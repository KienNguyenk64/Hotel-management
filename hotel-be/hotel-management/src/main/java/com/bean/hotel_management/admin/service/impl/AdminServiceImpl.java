package com.bean.hotel_management.admin.service.impl;

import com.bean.hotel_management.admin.dto.AddUserRequest;
import com.bean.hotel_management.admin.dto.FilterUserRequest;
import com.bean.hotel_management.admin.dto.UpdateUserRequest;
import com.bean.hotel_management.admin.service.IAdminService;
import com.bean.hotel_management.admin.specification.AdminSpecification;
import com.bean.hotel_management.common.exception.BusinessException;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.common.service.IBaseRedisService;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.mapper.UserMapper;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.user.utils.UserUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements IAdminService {

    private final IUserRepository userRepository;
    private final AdminSpecification adminSpecification;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserUtils userUtils;



    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(FilterUserRequest request) {
        log.info("Getting users with filters: {}", request);

        Pageable pageable = createPageable(request);

        // Get all users and filter
        List<User> allUsers = userRepository.findAll();
        List<User> filteredUsers = allUsers.stream()
                .filter(adminSpecification.createPredicate(request))
                .collect(Collectors.toList());

        log.info("Found {} users after filtering", filteredUsers.size());

        return createPageFromList(filteredUsers, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        log.info("Getting user by ID: {}", id);
        User user = findUserById(id);
        return userMapper.mapToUserResponse(user);
    }


    @Override
    @Transactional
    public UserResponse addUser(AddUserRequest request) {
        log.info("Adding new user: {}", request.getEmail());

        userUtils.validateDuplicateUser(
                request.getEmail(),
                request.getUsername(),
                request.getPhoneNumber(),
                request.getCccdNumber()
        );

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Vai trò không hợp lệ: " + request.getRole());
        }
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
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .isLocked(false)
                .createdDate(LocalDateTime.now())
                .avatarUrl(defaultAvatarUrl)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("User created by admin: {}", savedUser.getEmail());

        return userMapper.mapToUserResponse(savedUser);
    }


    @Override
    @Transactional
    public UserResponse updateUserById(String id, UpdateUserRequest request) {
        log.info("Updating user: {}", id);

        User user = findUserById(id);

        // Validate duplicates for changed fields
        validateDuplicatesForUpdate(user, request);

        // Update fields
        updateUserFields(user, request);

        User updatedUser = userRepository.save(user);
        log.info("User updated: {}", updatedUser.getEmail());

        return userMapper.mapToUserResponse(updatedUser);
    }


    @Override
    @Transactional
    public UserResponse activateUserById(String id) {
        log.info("Activating user: {}", id);
        User user = findUserById(id);
        user.activate();
        User saved = userRepository.save(user);
        return userMapper.mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse deactivateUserById(String id) {
        log.info("Deactivating user: {}", id);
        User user = findUserById(id);
        user.deactivate();
        User saved = userRepository.save(user);
        return userMapper.mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse lockUserById(String id) {
        log.info("Locking user: {}", id);
        User user = findUserById(id);
        user.lock();
        User saved = userRepository.save(user);
        return userMapper.mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse unlockUserById(String id) {
        log.info("Unlocking user: {}", id);
        User user = findUserById(id);
        user.unlock();
        User saved = userRepository.save(user);
        return userMapper.mapToUserResponse(saved);
    }



    private User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng với ID: " + id));
    }

    private void validateDuplicatesForUpdate(User currentUser, UpdateUserRequest request) {
        if (request.getPhoneNumber() != null &&
                !request.getPhoneNumber().equals(currentUser.getPhoneNumber())) {
            userUtils.validateDuplicatePhoneNumber(request.getPhoneNumber());
        }

        if (request.getUsername() != null &&
                !request.getUsername().equals(currentUser.getUsername())) {
            userUtils.validateDuplicateUsername(request.getUsername());
        }

        if (request.getEmail() != null &&
                !request.getEmail().equals(currentUser.getEmail())) {
            userUtils.validateDuplicateEmail(request.getEmail());
        }

        if (request.getCccdNumber() != null &&
                !request.getCccdNumber().equals(currentUser.getCccdNumber())) {
            userUtils.validateDuplicateCccdNumber(request.getCccdNumber());
        }
    }

    private void updateUserFields(User user, UpdateUserRequest request) {
        if (shouldUpdate(request.getFullName(), user.getFullName())) {
            user.setFullName(request.getFullName());
        }

        if (shouldUpdate(request.getPhoneNumber(), user.getPhoneNumber())) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (shouldUpdate(request.getUsername(), user.getUsername())) {
            user.setUsername(request.getUsername());
        }

        if (shouldUpdate(request.getEmail(), user.getEmail())) {
            user.setEmail(request.getEmail());
        }

        if (shouldUpdate(request.getAddress(), user.getAddress())) {
            user.setAddress(request.getAddress());
        }

        if (shouldUpdate(request.getCccdNumber(), user.getCccdNumber())) {
            user.setCccdNumber(request.getCccdNumber());
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                Role newRole = Role.valueOf(request.getRole().toUpperCase());
                if (newRole != user.getRole()) {
                    user.setRole(newRole);
                }
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Vai trò không hợp lệ: " + request.getRole());
            }
        }

        user.setUpdatedDate(LocalDateTime.now());
    }

    private boolean shouldUpdate(String newValue, String currentValue) {
        return newValue != null &&
                !newValue.isBlank() &&
                !newValue.equals(currentValue);
    }

    private Pageable createPageable(FilterUserRequest request) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "createdDate";
        String sortOrder = request.getSortOrder() != null ? request.getSortOrder() : "desc";

        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return PageRequest.of(request.getPage(), request.getSize(), sort);
    }

    private Page<UserResponse> createPageFromList(List<User> users, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), users.size());

        List<UserResponse> pageContent = users.subList(start, end).stream()
                .map(userMapper::mapToUserResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, users.size());
    }
}