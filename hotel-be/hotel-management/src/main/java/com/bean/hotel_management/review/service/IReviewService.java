package com.bean.hotel_management.review.service;

import com.bean.hotel_management.review.dto.request.CreateReplyRequest;
import com.bean.hotel_management.review.dto.request.CreateReviewRequest;
import com.bean.hotel_management.review.dto.response.ReviewResponse;
import jakarta.validation.Valid;

public interface IReviewService {
    ReviewResponse createReview(@Valid CreateReviewRequest request, String email);


    ReviewResponse updateReview(String id, String comment, String email);

    void deleteReview(String id, String email);

    ReviewResponse updateStatusReview(String id, String status);


    ReviewResponse getReviewById(String reviewId);

    ReviewResponse createReviewResponse(String id, CreateReplyRequest request, String email);

    ReviewResponse updateReviewResponse(String replyId, String content, String email);

    void deleteReplyReview(String replyId, String email);
}
