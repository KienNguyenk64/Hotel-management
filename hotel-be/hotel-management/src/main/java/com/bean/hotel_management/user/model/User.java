package com.bean.hotel_management.user.model;

import com.bean.hotel_management.user.dto.UpdateProfileRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Indexed(unique = true, sparse = true)
    private String phoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true, sparse = true)
    private String username;

    private String password;

    @Indexed(unique = true, sparse = true)
    private String cccdNumber;

    private String address;
    private String avatarUrl;

    @Builder.Default
    private Role role = Role.USER;

    private AuthProvider provider;

    @Builder.Default
    private boolean isLocked = false;

    @Builder.Default
    private boolean isActive = false;


    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private LocalDateTime lastLoginDate;


    public boolean hasCloudinaryAvatar() {
        return avatarUrl != null && avatarUrl.contains("cloudinary.com");
    }


    public boolean hasDefaultAvatar() {
        return avatarUrl == null || avatarUrl.contains("ui-avatars.com");
    }

    public String updateAvatar(String newAvatarUrl) {
        String oldAvatar = this.avatarUrl;
        this.avatarUrl = newAvatarUrl;
        this.updatedDate = LocalDateTime.now();

        return hasCloudinaryAvatar(oldAvatar) ? oldAvatar : null;
    }


    public String resetToDefaultAvatar() {
        String oldAvatar = this.avatarUrl;
        this.avatarUrl = generateDefaultAvatarUrl();
        this.updatedDate = LocalDateTime.now();

        return hasCloudinaryAvatar(oldAvatar) ? oldAvatar : null;
    }

    public String generateDefaultAvatarUrl() {
        String encodedName = java.net.URLEncoder.encode(
                this.fullName,
                java.nio.charset.StandardCharsets.UTF_8
        );
        return "https://ui-avatars.com/api/?name=" + encodedName +
                "&background=random&size=200&bold=true";
    }

    public List<String> updateProfile(UpdateProfileRequest request) {
        List<String> changedFields = new ArrayList<>();

        if (shouldUpdate(request.getFullName(), this.fullName)) {
            this.fullName = request.getFullName();
            changedFields.add("fullName");
        }

        if (shouldUpdate(request.getPhoneNumber(), this.phoneNumber)) {
            this.phoneNumber = request.getPhoneNumber();
            changedFields.add("phoneNumber");
        }

        if (shouldUpdate(request.getUsername(), this.username)) {
            this.username = request.getUsername();
            changedFields.add("username");
        }

        if (shouldUpdate(request.getEmail(), this.email)) {
            this.email = request.getEmail();
            changedFields.add("email");
        }

        if (shouldUpdate(request.getAddress(), this.address)) {
            this.address = request.getAddress();
            changedFields.add("address");
        }

        if (shouldUpdate(request.getCccdNumber(), this.cccdNumber)) {
            this.cccdNumber = request.getCccdNumber();
            changedFields.add("cccdNumber");
        }

        if (!changedFields.isEmpty()) {
            this.updatedDate = LocalDateTime.now();
        }

        return changedFields;
    }

    public void activate() {
        this.isActive = true;
        this.updatedDate = LocalDateTime.now();
    }

    public void deactivate() {
        this.isActive = false;
        this.updatedDate = LocalDateTime.now();
    }

    public void lock() {
        this.isLocked = true;
        this.updatedDate = LocalDateTime.now();
    }

    public void unlock() {
        this.isLocked = false;
        this.updatedDate = LocalDateTime.now();
    }

    public void updateLastLogin() {
        this.lastLoginDate = LocalDateTime.now();
    }


    private boolean shouldUpdate(String newValue, String currentValue) {
        return newValue != null &&
                !newValue.isBlank() &&
                !newValue.equals(currentValue);
    }

    private boolean hasCloudinaryAvatar(String url) {
        return url != null && url.contains("cloudinary.com");
    }
}