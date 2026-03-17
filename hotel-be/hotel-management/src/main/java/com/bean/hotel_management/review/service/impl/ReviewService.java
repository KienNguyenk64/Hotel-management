package com.bean.hotel_management.review.service.impl;

import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.review.dto.request.CreateReplyRequest;
import com.bean.hotel_management.review.dto.request.CreateReviewRequest;
import com.bean.hotel_management.review.dto.response.ReviewResponse;
import com.bean.hotel_management.review.mapper.ReviewMapper;
import com.bean.hotel_management.review.model.Reply;
import com.bean.hotel_management.review.model.Review;
import com.bean.hotel_management.review.model.ReviewStatus;
import com.bean.hotel_management.review.repository.IReplyRepository;
import com.bean.hotel_management.review.repository.IReviewRepository;
import com.bean.hotel_management.review.service.IReviewService;
import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.room.repository.IRoomRepository;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;


@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService implements IReviewService {

    private final IReviewRepository iReviewRepository;
    private final IReplyRepository iReplyRepository;
    private final IUserRepository iUserRepository;
    private final IRoomRepository iRoomRepository;

    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request, String email) {
        User theUser = findUserByEmail(email);
        Room theRoom = findRoomById(request.getRoomId());

        Review newReview = reviewMapper.toEntity(request, theUser, theRoom);
        Review savedReview =  iReviewRepository.save(newReview);

        if (theRoom.getReviewIds() == null) {
            theRoom.setReviewIds(new ArrayList<>());
        }
        theRoom.getReviewIds().add(savedReview.getId());
        iRoomRepository.save(theRoom);

        log.info("Review created successfully: {} for room: {}", savedReview.getId(), theRoom.getRoomNumber());
        return reviewMapper.entityToResponse(savedReview);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(String id, String comment, String email) {
        Review review = findReviewById(id);
        User user = findUserByEmail(email);

        if (!user.getId().equals(review.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập bài review này");
        }

        review.setComment(comment);
        review.setUpdatedDate(LocalDateTime.now());
        Review savedReview = iReviewRepository.save(review);
        log.info("Review updated successfully: {} for room: {}", savedReview.getId(), savedReview.getRoomNumber());
        return reviewMapper.entityToResponse(savedReview);
    }

    @Override
    @Transactional
    public void deleteReview(String id, String email) {
        User user = findUserByEmail(email);
        Review review = findReviewById(id);

        if (!user.getId().equals(review.getUserId()) &&  user.getRole().name().equals("USER")) {
            throw new AccessDeniedException("Bạn không có quyền xóa bài review này");
        }

        Room room = findRoomById(review.getRoomId());
        if (room.getReviewIds() != null) {
            room.getReviewIds().remove(id);
            iRoomRepository.save(room);
        }

        if (!review.getReplyIds().isEmpty()) {
            for (String replyId : review.getReplyIds()) {
                iReplyRepository.deleteById(replyId);
            }
        }

        iReviewRepository.deleteById(id);

        log.info("Review deleted: {} from room: {}", id, room.getRoomNumber());
    }

    @Override
    @Transactional
    public ReviewResponse updateStatusReview(String id, String status) {
        Review review = findReviewById(id);
        review.setStatus(ReviewStatus.valueOf(status));
        log.info("Review updated status successfully: {} for room: {}", review.getId(), review.getRoomNumber());
        return reviewMapper.entityToResponse(iReviewRepository.save(review));
    }



    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(String reviewId) {
        return reviewMapper.entityToResponse(findReviewById(reviewId));
    }

    @Override
    @Transactional
    public ReviewResponse createReviewResponse(String id, CreateReplyRequest request, String email) {
        Review review = findReviewById(id);
        User user = findUserByEmail(email);

        Reply reply = Reply.builder()
                .reviewId(review.getId())
                .userId(user.getId())
                .userFullName(user.getFullName())
                .userAvatar(user.getAvatarUrl())
                .userEmail(user.getEmail())
                .userPhoneNumber(user.getPhoneNumber())
                .content(request.getContent())
                .createdDate(LocalDateTime.now())
                .build();

        Reply savedReply = iReplyRepository.save(reply);

        review.getReplyIds().add(savedReply.getId());
        Review savedReview = iReviewRepository.save(review);

        log.info("Reply added to review successfully: {} for room: {}", savedReview.getId(), savedReview.getRoomNumber());
        return reviewMapper.entityToResponse(savedReview);
    }

    @Override
    @Transactional
    public ReviewResponse updateReviewResponse(String replyId, String content, String email) {
        Reply reply = findReplyById(replyId);
        User user = findUserByEmail(email);
        if (!user.getId().equals(reply.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập phản hồi đánh giá này");
        }
        reply.setContent(content);
        Reply savedReply = iReplyRepository.save(reply);
        Review review = findReviewById(reply.getReviewId());
        log.info("Reply updated successfully: {} for room: {}", savedReply.getId(), review.getRoomNumber());
        return reviewMapper.entityToResponse(review);
    }

    @Override
    @Transactional
    public void deleteReplyReview(String replyId, String email) {
        Reply reply = findReplyById(replyId);
        User user = findUserByEmail(email);
        if (!user.getId().equals(reply.getUserId()) &&  user.getRole().name().equals("USER")) {
            throw new AccessDeniedException("Bạn không có quyền xóa phản hồi đánh giá này");
        }
        Review review = findReviewById(reply.getReviewId());
        review.getReplyIds().remove(replyId);
        iReviewRepository.save(review);
        iReplyRepository.deleteById(replyId);
        log.info("Reply deleted from review successfully: {} for room: {}", replyId, review.getRoomNumber());
    }

    private Reply findReplyById(String id) {
        return iReplyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phản hồi đánh giá"));
    }

    private Review findReviewById(String id) {
        return iReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review"));
    }

    private Room findRoomById(String roomId) {
        return iRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng"));
    }

    private User findUserByEmail(String email) {
        return iUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
    }

}
