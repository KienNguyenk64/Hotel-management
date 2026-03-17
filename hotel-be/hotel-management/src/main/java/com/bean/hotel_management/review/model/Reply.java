package com.bean.hotel_management.review.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "replies")
public class Reply {

    @Id
    private String id;
    private String reviewId;

    private String userId;
    private String userFullName;
    private String userAvatar;
    private String userEmail;
    private String userPhoneNumber;

    private String content;
    private LocalDateTime createdDate;
}
