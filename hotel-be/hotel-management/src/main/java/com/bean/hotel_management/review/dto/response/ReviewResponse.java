package com.bean.hotel_management.review.dto.response;

import com.bean.hotel_management.review.model.Reply;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private String id;

    private String userId;
    private String userFullName;
    private String userAvatar;
    private String userPhoneNumber;
    private String userEmail;

    private String roomId;
    private String roomNumber;
    private String roomName;
    private String roomType;

    private String comment;
    private int rating;
    private String reviewStatus;

    @JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    private LocalDateTime createdDate;
    @JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    private LocalDateTime updatedDate;

    private List<Reply> replies;

}
