package com.bean.hotel_management.user.service.impl;

import com.bean.hotel_management.common.config.ImageUploadProperties;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.common.utils.FileUtils;
import com.bean.hotel_management.common.utils.ImageUtils;
import com.bean.hotel_management.user.dto.UpdateProfileRequest;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.user.service.IUserService;
import com.bean.hotel_management.user.utils.UserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final IUserRepository iUserRepository;
    private final UserMapper userMapper;
    private final UserUtils userUtils;
    private final ImageUtils imageUtils;
    private final static String AVATAR_IMAGE_FOLDER = "/avatars";

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String username) {
        User user = findUserByEmail(username);
        log.info("Lấy thông tin user với email: {}", username);
        return userMapper.mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserProfile(String username, UpdateProfileRequest request) {
        log.info("Cập nhật thông tin user: {}, dữ liệu: {}", username, request);
        User user = findUserByEmail(username);

        String newPhoneNumber = request.getPhoneNumber();
        String newFullName = request.getFullName();
        String newUsername = request.getUsername();
        String newEmail = request.getEmail();

        if (newPhoneNumber != null && !newPhoneNumber.isBlank() && !newPhoneNumber.equals(user.getPhoneNumber())) {
            userUtils.validateDuplicatePhoneNumber(newPhoneNumber);
            user.setPhoneNumber(newPhoneNumber);
        }
        if (newFullName != null && !newFullName.isBlank() ) {
            user.setFullName(newFullName);
        }
        if (newUsername != null && !newUsername.isBlank() && !newUsername.equals(user.getUsername())) {
            userUtils.validateDuplicateUsername(newUsername);
            user.setUsername(newUsername);
        }
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equals(user.getEmail())) {
            userUtils.validateDuplicateEmail(newEmail);
            user.setEmail(newEmail);
        }
        iUserRepository.save(user);
        return userMapper.mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(String email, MultipartFile file) {
        User user = findUserByEmail(email);
        if (user.getAvatarUrl() != null) {
            imageUtils.deleteImage(user.getAvatarUrl());
        }
        String avatarURL = imageUtils.uploadImage(file, AVATAR_IMAGE_FOLDER);
        user.setAvatarUrl(avatarURL);
        iUserRepository.save(user);
        log.info("Cập nhật avatar cho user với email: {}", email);
        return userMapper.mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse deleteAvatar(String email) {
        User user = findUserByEmail(email);
        imageUtils.deleteImage(user.getAvatarUrl());
        user.setAvatarUrl(user.generateDefaultAvatarUrl());
        iUserRepository.save(user);
        log.info("Xóa avatar cho user với email: {}", email);
        return userMapper.mapToUserResponse(user);
    }


    private User findUserByEmail(String email) {
        return iUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với email: " + email));
    }
}
