package com.bean.hotel_management.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    private String fullName;
    @Email
    private String email;
    @Pattern(regexp = "^\\+?[0-9]\\d{1,14}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    private String username;
    private String address;
    private String cccdNumber;
}
