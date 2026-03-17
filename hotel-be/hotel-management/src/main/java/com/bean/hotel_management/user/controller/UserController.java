package com.bean.hotel_management.user.controller;

import com.bean.hotel_management.common.dto.ApiResponse;
import com.bean.hotel_management.user.dto.UpdateProfileRequest;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.user.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UserController {

    private final IUserService iUserService;

    @GetMapping("me")
    @Operation(summary = "Lấy thông tin user hiện tại")
    public ResponseEntity<ApiResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserResponse response = iUserService.getUserByEmail(username);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin user thành công", response)
        );
    }

    @PutMapping("update-profile")
    @Operation(summary = "Cập nhật thông tin user hiện tại")
    public ResponseEntity<ApiResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                     Authentication authentication) {
        String username = authentication.getName();
        UserResponse response = iUserService.updateUserProfile(username, request);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật thông tin user thành công", response)
        );
    }

    @PutMapping("upload-avatar")
    @Operation(summary = "Cập nhật avatar user")
    public ResponseEntity<ApiResponse> uploadAvatarUser(@RequestParam("file")MultipartFile file,
                                                    Authentication authentication) {
        String email = authentication.getName();
        UserResponse response = iUserService.uploadAvatar(email, file);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật avatar thành công", response)
        );
    }

    @DeleteMapping("delete-avatar")
    @Operation(summary = "Xóa avatar user")
    public ResponseEntity<ApiResponse> deleteAvatarUer(Authentication authentication) {
        String email = authentication.getName();
        UserResponse response = iUserService.deleteAvatar(email);
        return ResponseEntity.ok(
                ApiResponse.success("Gỡ avatar thành công", response)
        );
    }
}
