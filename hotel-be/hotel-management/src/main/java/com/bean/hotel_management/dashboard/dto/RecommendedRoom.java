package com.bean.hotel_management.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendedRoom {
    private String roomId;
    private String roomName;
    private String roomNumber;
    private String roomType;
    private String thumbnailImage;
    private Double pricePerNight;
    private Double rating;
    private Integer totalReviews;
    private Boolean isFeatured;
    private String recommendationReason;
}