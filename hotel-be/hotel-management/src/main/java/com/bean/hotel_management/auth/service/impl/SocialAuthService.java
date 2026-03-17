package com.bean.hotel_management.auth.service.impl;

import com.bean.hotel_management.auth.dto.response.AuthResponse;
import com.bean.hotel_management.auth.exception.InvalidTokenException;
import com.bean.hotel_management.auth.exception.OAuthProviderException;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.AuthProvider;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialAuthService {

    private final IUserRepository iUserRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final WebClient.Builder webClientBuilder;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-id}")
    private String facebookAppId;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    // Google login
    public AuthResponse googleLogin (String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
                    .setAudience(Collections.singleton(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new InvalidTokenException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            User user = findOrCreateSocialUser(email, name, picture, AuthProvider.GOOGLE);
            String jwtToken = jwtService.generateToken(user.getEmail(), List.of("ROLE_" + user.getRole().name()));

            log.info("User {} logged in with Google", email);
            return new AuthResponse(jwtToken, userMapper.mapToUserResponse(user));

        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new OAuthProviderException("Google login failed: " + e.getMessage());
        }
    }

    // Facebook login
    public AuthResponse facebookLogin (String accessToken) {
        try {
            WebClient webClient = webClientBuilder.build();
            String url = String.format(
                    "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=%s",
                    accessToken
            );

            Map<String, Object> fbResponse = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (fbResponse == null || fbResponse.containsKey("error")) {
                throw new InvalidTokenException("Invalid Facebook access token");
            }

            String email = (String) fbResponse.get("email");
            if (email == null || email.isEmpty()) {
                // Facebook không trả về email - fallback
                email = fbResponse.get("id") + "@facebook.user";
            }

            String name = (String) fbResponse.get("name");
            Map<String, Object> pictureData = (Map<String, Object>) fbResponse.get("picture");
            Map<String, Object> data = (Map<String, Object>) pictureData.get("data");
            String picture = (String) data.get("url");

            User user = findOrCreateSocialUser(email, name, picture, AuthProvider.FACEBOOK);
            String jwt = jwtService.generateToken(user.getEmail(), List.of("ROLE_" + user.getRole().name()));

            log.info("User {} logged in with Facebook successfully", email);
            return new AuthResponse(jwt, userMapper.mapToUserResponse(user));

        } catch (Exception e) {
            log.error("Facebook login failed", e);
            throw new OAuthProviderException("Facebook login failed: " + e.getMessage());
            }
    }

    // GitHub login
    public AuthResponse githubLogin(String code) {
        try {
            // B1: Đổi code lấy access token
            WebClient webClient = webClientBuilder.build();

            Map<String, Object> tokenResponse = webClient.post()
                    .uri("https://github.com/login/oauth/access_token")
                    .header("Accept", "application/json")
                    .bodyValue(Map.of(
                            "client_id", githubClientId,
                            "client_secret", githubClientSecret,
                            "code", code
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (tokenResponse == null || tokenResponse.containsKey("error")) {
                throw new RuntimeException("Failed to get GitHub access token");
            }

            String accessToken = (String) tokenResponse.get("access_token");

            // B2: Lấy thông tin user
            Map<String, Object> userResponse = webClient.get()
                    .uri("https://api.github.com/user")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (userResponse == null) {
                throw new RuntimeException("Failed to get GitHub user info");
            }

            String email = (String) userResponse.get("email");

            // GitHub email có thể null nếu user set private
            if (email == null || email.isEmpty()) {
                // Lấy email từ API khác
                List<Map<String, Object>> emails = webClient.get()
                        .uri("https://api.github.com/user/emails")
                        .header("Authorization", "Bearer " + accessToken)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                        .block();


                if (emails != null && !emails.isEmpty()) {
                    // Lấy primary email
                    email = emails.stream()
                            .filter(e -> Boolean.TRUE.equals(e.get("primary")))
                            .map(e -> (String) e.get("email"))
                            .findFirst()
                            .orElse((String) emails.get(0).get("email"));
                }

                // Nếu vẫn null thì fallback
                if (email == null || email.isEmpty()) {
                    email = userResponse.get("id") + "@github.user";
                }
            }

            String name = (String) userResponse.get("name");
            if (name == null || name.isEmpty()) {
                name = (String) userResponse.get("login");
            }

            String picture = (String) userResponse.get("avatar_url");

            User user = findOrCreateSocialUser(email, name, picture, AuthProvider.GITHUB);
            String jwt = jwtService.generateToken(user.getEmail(), List.of("ROLE_" + user.getRole().name()));

            log.info("User {} logged in with GitHub successfully", email);
            return new AuthResponse(jwt, userMapper.mapToUserResponse(user));

        } catch (Exception e) {
            log.error("GitHub login failed: {}", e.getMessage());
            throw new OAuthProviderException("GitHub login failed: " + e.getMessage());
        }
    }



    // Thêm hoặc tìm user từ social login
    private User findOrCreateSocialUser(String email, String name, String picture, AuthProvider provider) {
        return iUserRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getAvatarUrl() == null || existingUser.getAvatarUrl().isEmpty()) {
                        existingUser.setAvatarUrl(picture);
                    }
                    if (existingUser.getProvider() == null) {
                        existingUser.setProvider(provider);
                    }
                    return iUserRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .fullName(name)
                            .username(email.split("@")[0] + "_" + System.currentTimeMillis())
                            .phoneNumber(null)
                            .cccdNumber(null)
                            .avatarUrl(picture)
                            .provider(provider)
                            .password(null)
                            .role(Role.USER)
                            .isActive(true)
                            .isLocked(false)
                            .createdDate(LocalDateTime.now())
                            .build();
                    return iUserRepository.save(newUser);
                });
    }
}
