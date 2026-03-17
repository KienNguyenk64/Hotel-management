package com.bean.hotel_management.room.mapper;

import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.review.dto.response.ReviewResponse;
import com.bean.hotel_management.review.mapper.ReviewMapper;
import com.bean.hotel_management.review.model.Review;
import com.bean.hotel_management.review.repository.IReviewRepository;
import com.bean.hotel_management.room.dto.request.CreateRoomRequest;
import com.bean.hotel_management.room.dto.response.RoomResponse;
import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.room.model.RoomStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomMapper {

    private final IReviewRepository iReviewRepository;
    private final ReviewMapper reviewMapper;

    public Room toEntity(CreateRoomRequest request, String createdBy, List<String> imageUrls, String thumbnailUrl) {
        return Room.builder()
                .roomNumber(request.getRoomNumber())
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .pricePerNight(request.getPricePerNight())
                .size(request.getSize())
                .bedCount(request.getBedCount())
                .bedType(request.getBedType())
                .maxOccupancy(request.getMaxOccupancy())
                .floor(request.getFloor())
                .view(request.getView())
                .amenities(request.getAmenities())
                .images(imageUrls)
                .thumbnailImage(thumbnailUrl != null ? thumbnailUrl : imageUrls.get(0))
                .status(RoomStatus.AVAILABLE)
                .isActive(true)
                .isFeatured(false)
                .allowSmoking(Optional.ofNullable(request.getAllowSmoking()).orElse(false))
                .hasBathroom(request.getHasBathroom())
                .hasBalcony(Optional.ofNullable(request.getHasBalcony()).orElse(false))
                .hasKitchen(Optional.ofNullable(request.getHasKitchen()).orElse(false))
                .reviewIds(new ArrayList<>())
                .averageRating(0.0)
                .totalReviews(0)
                .totalBookings(0)
                .createdDate(LocalDateTime.now())
                .createdBy(createdBy)
                .notes(request.getNotes())
                .build();
    }

    public RoomResponse toResponse(Room room) {
        return toResponse(room, false);
    }


    public RoomResponse toResponse(Room room, boolean includeReviews) {
        List<String> reviewIds = room.getReviewIds();
        if (reviewIds == null) {
            reviewIds = new ArrayList<>();
        }

        double averageRating = 0.0;
        int totalRating = 0;
        int totalReviews = reviewIds.size();
        List<ReviewResponse> reviews = new ArrayList<>();

        if (totalReviews > 0) {
            int validReviewCount = 0;

            for (String reviewId : reviewIds) {
                try {
                    Review review = iReviewRepository.findById(reviewId)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy reviewId: " + reviewId));

                    totalRating += review.getRating();
                    validReviewCount++;

                    // Nếu cần load reviews, convert sang ReviewResponse
                    if (includeReviews) {
                        reviews.add(reviewMapper.entityToResponse(review));
                    }

                } catch (Exception e) {
                    log.error("Error loading review {}: {}", reviewId, e.getMessage());
                }
            }

            if (validReviewCount > 0) {
                averageRating = (double) totalRating / validReviewCount;
            }

            // Cập nhật lại totalReviews
            totalReviews = validReviewCount;
        }

        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .name(room.getName())
                .type(room.getType())
                .typeDisplay(room.getType().getVietnameseName())
                .description(room.getDescription())
                .pricePerNight(room.getPricePerNight())
                .size(room.getSize())
                .bedCount(room.getBedCount())
                .bedType(room.getBedType())
                .bedTypeDisplay(room.getBedType().getVietnameseName())
                .maxOccupancy(room.getMaxOccupancy())
                .floor(room.getFloor())
                .view(room.getView())
                .viewDisplay(room.getView() != null ? room.getView().getVietnameseName() : null)
                .amenities(room.getAmenities())
                .images(room.getImages())
                .thumbnailImage(room.getThumbnailImage())
                .status(room.getStatus())
                .statusDisplay(room.getStatus().getVietnameseName())
                .isActive(room.getIsActive())
                .isFeatured(room.getIsFeatured())
                .allowSmoking(room.getAllowSmoking())
                .hasBathroom(room.getHasBathroom())
                .hasBalcony(room.getHasBalcony())
                .hasKitchen(room.getHasKitchen())
                .reviewIds(reviewIds)
                .reviews(includeReviews ? reviews : null)
                .averageRating(Math.round(averageRating * 10.0) / 10.0)
                .totalReviews(totalReviews)
                .totalBookings(room.getTotalBookings())
                .lastBookedDate(room.getLastBookedDate())
                .createdDate(room.getCreatedDate())
                .updatedDate(room.getUpdatedDate())
                .notes(room.getNotes())
                .build();
    }
}