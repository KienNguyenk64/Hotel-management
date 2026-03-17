package com.bean.hotel_management.booking.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestInfo {
    private String fullName;
    private String phoneNumber;
    private String email;
    private String cccdNumber;
    private String nationality;
    private String address;
}