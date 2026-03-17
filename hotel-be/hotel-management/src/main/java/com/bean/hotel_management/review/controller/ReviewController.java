package com.bean.hotel_management.review.controller;

import com.bean.hotel_management.common.dto.ApiResponse;
import com.bean.hotel_management.review.dto.request.CreateReplyRequest;
import com.bean.hotel_management.review.dto.request.CreateReviewRequest;
import com.bean.hotel_management.review.dto.response.ReviewResponse;
import com.bean.hotel_management.review.service.IReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/reviews")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService iReviewService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse> createReview(@Valid @RequestBody CreateReviewRequest request,
                                                    Authentication authentication) {

        String userEmail = authentication.getName();
        ReviewResponse response = iReviewService.createReview(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đánh giá thành công", response));
    }

    @PutMapping("{id}/update")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateReview(@PathVariable String id,
                                                    @RequestParam String comment,
                                                    Authentication authentication) {

        String email = authentication.getName();
        ReviewResponse response = iReviewService.updateReview(id, comment, email);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đánh giá thành công", response));
    }

    @DeleteMapping("{id}/delete")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable String id, Authentication authentication) {
        String email = authentication.getName();
        iReviewService.deleteReview(id, email);
        return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công", null));
    }

    @PutMapping("update-status/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateStatusReview(@PathVariable String id,
                                                          @RequestParam String status) {
        ReviewResponse response = iReviewService.updateStatusReview(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", response));
    }

    @PostMapping("{id}/reply")
    public ResponseEntity<ApiResponse> createReviewResponse(@PathVariable String id,
                                                            @RequestBody CreateReplyRequest request,
                                                            Authentication authentication) {
        String email = authentication.getName();
        ReviewResponse response = iReviewService.createReviewResponse(id, request, email);
        return ResponseEntity.ok(ApiResponse.success("Phản hồi đánh giá thành công", response));
    }

    @GetMapping("{reviewId}")
    public ResponseEntity<ApiResponse> getReviewById(@PathVariable String reviewId) {
        ReviewResponse response = iReviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Lấy bài review thành công", response));
    }

    @PutMapping("{replyId}/update-reply")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateReviewReply(@PathVariable String replyId,
                                                         @RequestParam String content,
                                                         Authentication authentication) {
        String email = authentication.getName();
        ReviewResponse response = iReviewService.updateReviewResponse(replyId, content, email);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phản hồi đánh giá thành công", response));
    }

    @DeleteMapping("{replyId}/delete-reply")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteReviewReply(@PathVariable String replyId,
                                                            Authentication authentication) {
        String email = authentication.getName();
        iReviewService.deleteReplyReview(replyId, email);
        return ResponseEntity.ok(ApiResponse.success("Xoá phản hồi đánh giá thành công", null));
    }
}
