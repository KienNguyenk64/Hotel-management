package com.bean.hotel_management.room.dto.response;

import com.bean.hotel_management.review.dto.response.ReviewResponse;
import com.bean.hotel_management.room.model.BedType;
import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.model.RoomType;
import com.bean.hotel_management.room.model.RoomView;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {

    private String id;
    private String roomNumber;
    private String name;
    private RoomType type;
    private String typeDisplay;
    private String description;
    private Double pricePerNight;
    private Integer size;
    private Integer bedCount;
    private BedType bedType;
    private String bedTypeDisplay;
    private Integer maxOccupancy;
    private Integer floor;
    private RoomView view;
    private String viewDisplay;
    private List<String> amenities;
    private List<String> images;
    private String thumbnailImage;
    private RoomStatus status;
    private String statusDisplay;
    private Boolean isActive;
    private Boolean isFeatured;
    private Boolean allowSmoking;
    private Boolean hasBathroom;
    private Boolean hasBalcony;
    private Boolean hasKitchen;

    private List<String> reviewIds;
    private List<ReviewResponse> reviews;
    private Double averageRating;
    private Integer totalReviews;

    private Integer totalBookings;
    private LocalDateTime lastBookedDate;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String notes;
}