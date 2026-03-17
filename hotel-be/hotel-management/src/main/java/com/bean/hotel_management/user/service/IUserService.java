package com.bean.hotel_management.user.service;

import com.bean.hotel_management.user.dto.UpdateProfileRequest;
import com.bean.hotel_management.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

public interface IUserService {
    UserResponse getUserByEmail(String email);

    UserResponse updateUserProfile(String username, @Valid UpdateProfileRequest request);

    UserResponse uploadAvatar(String email, MultipartFile file);

    UserResponse deleteAvatar(String email);
}
