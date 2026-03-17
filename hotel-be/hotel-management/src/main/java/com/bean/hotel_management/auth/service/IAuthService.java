package com.bean.hotel_management.auth.service;

import com.bean.hotel_management.auth.dto.request.ChangePasswordRequest;
import com.bean.hotel_management.auth.dto.request.LoginRequest;
import com.bean.hotel_management.auth.dto.request.RegisterRequest;
import com.bean.hotel_management.auth.dto.request.SocialLoginRequest;
import com.bean.hotel_management.auth.dto.response.AuthResponse;
import com.bean.hotel_management.user.dto.UserResponse;

import java.util.Map;

public interface IAuthService {

    AuthResponse login(LoginRequest loginRequest);

    Map<String, Object> register(RegisterRequest registerRequest);

    AuthResponse refreshToken(String refreshToken);

    void changePassword(String email, ChangePasswordRequest request);

    Map<String, Object> sendResetPasswordEmail(String email);

    Map<String, Object> resetPassword(String token, String newPassword);

    void verifyEmail(String token);

    Map<String, Object> sendVerificationEmail(String email);

    UserResponse getUserByEmail(String username);

    AuthResponse loginWithGoogle(SocialLoginRequest request);

    AuthResponse loginWithFacebook(SocialLoginRequest request);

    AuthResponse loginWithGitHub(SocialLoginRequest request);
}