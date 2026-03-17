package com.bean.hotel_management.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {
    private String email;
    private String phoneNumber;
    private String fullName;
    private String username;
    private String address;
    private String cccdNumber;
    private String role;
}
