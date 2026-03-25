package com.bean.hotel_management.auth.model;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingUserData {
    String fullName;
    String phoneNumber;
    String username;
    String cccdNumber;
    String address;
    String avatarUrl;
    String password;
}
