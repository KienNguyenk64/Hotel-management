package com.bean.hotel_management.auth.controller;

import com.bean.hotel_management.auth.dto.request.*;
import com.bean.hotel_management.auth.dto.response.AuthResponse;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.auth.service.IAuthService;
import com.bean.hotel_management.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final IAuthService iAuthService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = iAuthService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập thành công", response)
        );
    }

    @PostMapping("/login/google")
    @Operation(summary = "Đăng nhập bằng Google")
    public ResponseEntity<ApiResponse> loginWithGoogle (@RequestBody SocialLoginRequest request) {
        AuthResponse response = iAuthService.loginWithGoogle(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập bằng Google thành công", response)
        );
    }

    @PostMapping("/login/facebook")
    @Operation(summary = "Đăng nhập bằng Facebook")
    public ResponseEntity<ApiResponse> loginWithFacebook (@RequestBody SocialLoginRequest request) {
        AuthResponse response = iAuthService.loginWithFacebook(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập bằng Facebook thành công", response)
        );
    }

    @PostMapping("/login/github")
    @Operation(summary = "Đăng nhập bằng GitHub")
    public ResponseEntity<ApiResponse> loginWithGitHub (@RequestBody SocialLoginRequest request) {
        AuthResponse response = iAuthService.loginWithGitHub(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập bằng GitHub thành công", response)
        );
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> response = iAuthService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công. Vui lòng xác thực email", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin user hiện tại")
    public ResponseEntity<ApiResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserResponse response = iAuthService.getUserByEmail(username);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin user thành công", response)
        );
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(
                ApiResponse.success("Đăng xuất thành công", null)
        );
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới token")
    public ResponseEntity<ApiResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        String refreshToken = authHeader.substring(7);
        AuthResponse response = iAuthService.refreshToken(refreshToken);
        return ResponseEntity.ok(
                ApiResponse.success("Làm mới token thành công", response)
        );
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Quên mật khẩu")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestParam String email) {
        Map<String, Object> response = iAuthService.sendResetPasswordEmail(email);
        return ResponseEntity.ok(
                ApiResponse.success("Email reset mật khẩu đã được gửi", response)
        );
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {

        Map<String, Object> response = iAuthService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok(
                ApiResponse.success("Đặt lại mật khẩu thành công", response)
        );
    }

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<ApiResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        iAuthService.changePassword(email, request);
        return ResponseEntity.ok(
                ApiResponse.success("Đổi mật khẩu thành công", null)
        );
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Xác thực email")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestParam String token) {
        iAuthService.verifyEmail(token);
        return ResponseEntity.ok(
                ApiResponse.success("Xác thực email thành công", null)
        );
    }

    @PostMapping("/send-verification-email")
    @Operation(summary = "Gửi lại email xác thực")
    public ResponseEntity<ApiResponse> sendVerificationEmail(@RequestParam String email) {
        Map<String, Object> response = iAuthService.sendVerificationEmail(email);
        return ResponseEntity.ok(
                ApiResponse.success("Email xác thực đã được gửi", response)
        );
    }
}