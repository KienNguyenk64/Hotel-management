package com.bean.hotel_management.auth.service.impl;

import com.bean.hotel_management.auth.dto.request.*;
import com.bean.hotel_management.auth.dto.response.AuthResponse;
import com.bean.hotel_management.auth.exception.InvalidOperationException;
import com.bean.hotel_management.auth.exception.InvalidTokenException;
import com.bean.hotel_management.auth.exception.TokenExpiredException;
import com.bean.hotel_management.auth.model.VerificationToken;
import com.bean.hotel_management.auth.repository.IVerificationTokenRepository;
import com.bean.hotel_management.auth.service.IAuthService;
import com.bean.hotel_management.common.exception.*;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.user.utils.UserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final IUserRepository userRepository;
    private final IVerificationTokenRepository tokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final SocialAuthService socialAuthService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final UserUtils userUtils;

    @Value("${app.verification.token.expiration}")
    private long verificationTokenExpiration;

    @Value("${app.reset.token.expiration}")
    private long resetTokenExpiration;

    @Value("${app.test.mode:false}")
    private boolean testMode;


    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Find user
        User user = userRepository.findByEmailOrUsername(
                        request.getUsername(),
                        request.getUsername()
                )
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        // Validate status
        userUtils.validateUserStatus(user);

        // Update last login
        user.updateLastLogin();
        userRepository.save(user);

        // Generate token
        String token = jwtService.generateToken(
                user.getEmail(),
                List.of("ROLE_" + user.getRole().name())
        );

        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(token, userMapper.mapToUserResponse(user));
    }


    @Override
    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        userUtils.validateDuplicateUser(
                request.getEmail(),
                request.getUsername(),
                request.getPhoneNumber(),
                request.getCccdNumber()
        );
        String defaultAvatarUrl =
                "https://ui-avatars.com/api/?name="
                        + URLEncoder.encode(request.getFullName(), StandardCharsets.UTF_8);

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .username(request.getUsername())
                .phoneNumber(request.getPhoneNumber())
                .cccdNumber(request.getCccdNumber())
                .address(request.getAddress())
                .avatarUrl(defaultAvatarUrl)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isLocked(false)
                .isActive(true)
                .createdDate(LocalDateTime.now())
                .build();

        String verificationToken = createVerificationToken(newUser, "EMAIL_VERIFICATION");

        try {
            emailService.sendVerificationEmail(newUser.getEmail(), verificationToken);
        } catch (Exception e) {
            log.error("Failed to send verification email: {}", e.getMessage());
        }

        User savedUser = userRepository.save(newUser);

        String jwtToken = jwtService.generateToken(
                savedUser.getEmail(),
                List.of("ROLE_" + savedUser.getRole().name())
        );

        log.info("User registered: {}", savedUser.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("user", userMapper.mapToUserResponse(savedUser));
        response.put("message", "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.");

        if (testMode) {
            response.put("verificationToken", verificationToken);
            response.put("verificationUrl", "/api/auth/verify-email?token=" + verificationToken);
        }

        return response;
    }


    @Override
    @Transactional
    public void verifyEmail(String token) {
        // Find and validate token
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token xác thực không hợp lệ"));

        validateToken(verificationToken, "EMAIL_VERIFICATION");

        // Find user
        User user = userRepository.findByEmail(verificationToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        if (user.isActive()) {
            throw new InvalidOperationException("Tài khoản đã được xác thực");
        }

        // Activate user
        user.activate();
        userRepository.save(user);

        // Mark token as used
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        log.info("Email verified: {}", user.getEmail());
    }

    @Override
    @Transactional
    public Map<String, Object> sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        if (user.isActive()) {
            throw new InvalidOperationException("Tài khoản đã được xác thực");
        }

        // Delete old tokens
        tokenRepository.deleteByEmailAndTokenType(email, "EMAIL_VERIFICATION");

        // Create new token
        String token = createVerificationToken(user, "EMAIL_VERIFICATION");

        try {
            emailService.sendVerificationEmail(email, token);
        } catch (Exception e) {
            log.error("Failed to send verification email:: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực");
        }

        log.info("Verification email sent: {}", email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email xác thực đã được gửi");

        if (testMode) {
            response.put("verificationToken", token);
        }

        return response;
    }


    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        // Validate old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Mật khẩu cũ không chính xác");
        }

        // Validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("Mật khẩu mới và xác nhận không khớp");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedDate(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password changed: {}", email);
    }

    @Override
    @Transactional
    public Map<String, Object> sendResetPasswordEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        tokenRepository.deleteByEmailAndTokenType(email, "PASSWORD_RESET");

        String token = createVerificationToken(user, "PASSWORD_RESET");

        try {
            emailService.sendResetPasswordEmail(email, token);
        } catch (Exception e) {
            log.error("Failed to send reset email: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email reset mật khẩu");
        }

        log.info("Reset password email sent: {}", email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email reset mật khẩu đã được gửi");

        if (testMode) {
            response.put("resetToken", token);
        }

        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> resetPassword(String token, String newPassword) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token không hợp lệ"));

        validateToken(verificationToken, "PASSWORD_RESET");

        User user = userRepository.findByEmail(verificationToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedDate(LocalDateTime.now());
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        log.info("Password reset: {}", user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đặt lại mật khẩu thành công");
        return response;
    }


    @Override
    @Transactional
    public AuthResponse loginWithGoogle(SocialLoginRequest request) {
        return socialAuthService.googleLogin(request.getToken());
    }

    @Override
    @Transactional
    public AuthResponse loginWithFacebook(SocialLoginRequest request) {
        return socialAuthService.facebookLogin(request.getToken());
    }

    @Override
    @Transactional
    public AuthResponse loginWithGitHub(SocialLoginRequest request) {
        return socialAuthService.githubLogin(request.getCode());
    }


    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new InvalidTokenException("Token không hợp lệ hoặc đã hết hạn");
        }

        String email = jwtService.extractUserId(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        String newToken = jwtService.generateToken(
                user.getEmail(),
                List.of("ROLE_" + user.getRole().name())
        );

        return new AuthResponse(newToken, userMapper.mapToUserResponse(user));
    }


    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String username) {
        User user = userRepository.findByEmailOrUsername(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        return userMapper.mapToUserResponse(user);
    }


    private String createVerificationToken(User user, String tokenType) {
        String token = UUID.randomUUID().toString();

        long expiration = tokenType.equals("EMAIL_VERIFICATION")
                ? verificationTokenExpiration
                : resetTokenExpiration;

        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .email(user.getEmail())
                .expiryDate(LocalDateTime.now().plusSeconds(expiration / 1000))
                .used(false)
                .tokenType(tokenType)
                .build();

        tokenRepository.save(verificationToken);
        return token;
    }

    private void validateToken(VerificationToken token, String expectedType) {
        if (token.isUsed()) {
            throw new InvalidTokenException("Token đã được sử dụng");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Token đã hết hạn");
        }

        if (!expectedType.equals(token.getTokenType())) {
            throw new InvalidTokenException("Token không hợp lệ");
        }
    }
}