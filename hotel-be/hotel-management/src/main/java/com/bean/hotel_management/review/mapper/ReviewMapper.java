package com.bean.hotel_management.review.mapper;

import com.bean.hotel_management.review.dto.request.CreateReviewRequest;
import com.bean.hotel_management.review.dto.response.ReviewResponse;
import com.bean.hotel_management.review.model.Reply;
import com.bean.hotel_management.review.model.Review;
import com.bean.hotel_management.review.model.ReviewStatus;
import com.bean.hotel_management.review.repository.IReplyRepository;
import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class ReviewMapper {

    @Autowired
    private IReplyRepository iReplyRepository;

    public Review toEntity(CreateReviewRequest request, User user, Room room) {
        return  Review.builder()
                .userId(user.getId())
                .userAvatar(user.getAvatarUrl())
                .userEmail(user.getEmail())
                .userFullName(user.getFullName())
                .userPhoneNumber(user.getPhoneNumber())
                .roomId(room.getId())
                .roomName(room.getName())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getType().getDisplayName())
                .status(ReviewStatus.APPROVED)
                .comment(request.getComment())
                .rating(request.getRating())
                .createdDate(LocalDateTime.now())
                .updatedDate(null)
                .replyIds(new ArrayList<>())
                .build();
    }

    public ReviewResponse entityToResponse(Review review) {
        List<Reply> replies = new ArrayList<>();
        if (!review.getReplyIds().isEmpty()) {
            for (String replyId : review.getReplyIds()) {
                iReplyRepository.findById(replyId).ifPresent(replies::add);
            }
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .userId(review.getUserId())
                .userAvatar(review.getUserAvatar())
                .userEmail(review.getUserEmail())
                .userFullName(review.getUserFullName())
                .userPhoneNumber(review.getUserPhoneNumber())
                .roomId(review.getRoomId())
                .roomName(review.getRoomName())
                .roomNumber(review.getRoomNumber())
                .roomType(review.getRoomType())
                .comment(review.getComment())
                .reviewStatus(review.getStatus().getDisplayName())
                .createdDate(review.getCreatedDate())
                .updatedDate(review.getUpdatedDate())
                .replies(replies)
                .build();
    }


}
