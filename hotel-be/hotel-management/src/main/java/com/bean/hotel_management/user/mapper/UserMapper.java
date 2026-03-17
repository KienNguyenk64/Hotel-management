package com.bean.hotel_management.user.mapper;

import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .username(user.getUsername())
                .role(user.getRole().name())
                .cccdNumber(user.getCccdNumber())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .isLocked(user.isLocked())
                .isActive(user.isActive())
                .createdDate(user.getCreatedDate())
                .build();
    }
}
