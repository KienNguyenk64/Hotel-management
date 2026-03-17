package com.bean.hotel_management.auth.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "verification_tokens")
public class VerificationToken {
    @Id
    private String id;

    private String token;
    private String email;
    private LocalDateTime expiryDate;
    private boolean used;
    private String tokenType;       // EMAIL_VERIFICATION, PASSWORD_RESET
}
