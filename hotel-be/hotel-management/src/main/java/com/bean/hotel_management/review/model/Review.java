package com.bean.hotel_management.review.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String id;

    private String userId;
    private String userFullName;
    private String userAvatar;
    private String userEmail;
    private String userPhoneNumber;

    private String roomId;
    private String roomNumber;
    private String roomName;
    private String roomType;

    private int rating;
    private String comment;
    private ReviewStatus status;

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    private List<String> replyIds = new ArrayList<>();
}
