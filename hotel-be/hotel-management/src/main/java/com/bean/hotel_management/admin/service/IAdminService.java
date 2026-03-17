package com.bean.hotel_management.admin.service;

import com.bean.hotel_management.admin.dto.AddUserRequest;
import com.bean.hotel_management.admin.dto.FilterUserRequest;
import com.bean.hotel_management.admin.dto.UpdateUserRequest;
import com.bean.hotel_management.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;

public interface IAdminService {
    Page<UserResponse> getAllUsers(FilterUserRequest request);

    UserResponse getUserById(String id);

    UserResponse updateUserById(String id, @Valid UpdateUserRequest request);

    UserResponse deactivateUserById(String id);

    UserResponse activateUserById(String id);

    UserResponse lockUserById(String id);

    UserResponse unlockUserById(String id);

    UserResponse addUser(@Valid AddUserRequest request);
}
