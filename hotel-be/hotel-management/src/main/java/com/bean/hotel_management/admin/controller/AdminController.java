package com.bean.hotel_management.admin.controller;

import com.bean.hotel_management.admin.dto.AddUserRequest;
import com.bean.hotel_management.admin.dto.FilterUserRequest;
import com.bean.hotel_management.admin.dto.UpdateUserRequest;
import com.bean.hotel_management.admin.service.IAdminService;
import com.bean.hotel_management.user.dto.UserResponse;
import com.bean.hotel_management.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService iAdminService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách tất cả user với phân trang và sắp xếp")
    public ResponseEntity<ApiResponse> getAllUsers(@Valid FilterUserRequest request){

        Page<UserResponse> users = iAdminService.getAllUsers(request);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user thành công", users));
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Thêm mới user")
    public ResponseEntity<ApiResponse> addUser(@Valid @RequestBody AddUserRequest request) {
        UserResponse newUser = iAdminService.addUser(request);
        return ResponseEntity.ok(ApiResponse.success("Thêm mới user thành công", newUser));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy thông tin chi tiết user theo ID")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable String id) {
        UserResponse theUser = iAdminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", theUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật thông tin user theo ID")
    public ResponseEntity<ApiResponse> updateUserById(@PathVariable String id,
                                                      @Valid @RequestBody UpdateUserRequest request) {

        UserResponse updatedUser = iAdminService.updateUserById(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin user thành công", updatedUser));
    }

    @DeleteMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Vô hiệu hoá tài khoản user theo ID")
    public ResponseEntity<ApiResponse> deactivateUserById(@PathVariable String id) {
         UserResponse response =  iAdminService.deactivateUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Xoá user thành công", response));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Kích hoạt tài khoản user theo ID")
    public ResponseEntity<ApiResponse> activateUserById(@PathVariable String id) {
        UserResponse activatedUser = iAdminService.activateUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt tài khoản user thành công", activatedUser));
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Khoá tài khoản user theo ID")
    public ResponseEntity<ApiResponse> lockUserById(@PathVariable String id) {
        UserResponse lockedUser = iAdminService.lockUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Khoá tài khoản user thành công", lockedUser));
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Mở khoá tài khoản user theo ID")
    public ResponseEntity<ApiResponse> unlockUserById(@PathVariable String id) {
        UserResponse unlockedUser = iAdminService.unlockUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Mở khoá tài khoản user thành công", unlockedUser));
    }

}
