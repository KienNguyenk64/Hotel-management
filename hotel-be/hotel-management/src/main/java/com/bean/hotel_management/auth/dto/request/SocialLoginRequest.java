package com.bean.hotel_management.auth.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLoginRequest {
    private String token;
    private String provider;
    private String code;
}
