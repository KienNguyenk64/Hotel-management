package com.bean.hotel_management.chatbot.repository;

import com.bean.hotel_management.chatbot.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface IChatConversationRepository extends MongoRepository<ChatConversation, String> {

    Optional<ChatConversation> findBySessionId(String sessionId);

    List<ChatConversation> findByUserId(String userId);

    List<ChatConversation> findByStatus(ConversationStatus status);

    List<ChatConversation> findByUserIdAndStatus(String userId, ConversationStatus status);

    @Query("{ 'status': 'ACTIVE', 'needsHumanSupport': true }")
    List<ChatConversation> findConversationsNeedingSupport();

    @Query("{ 'startedAt': { $gte: ?0, $lte: ?1 } }")
    List<ChatConversation> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    Long countByStatus(ConversationStatus status);

    @Query("{ 'satisfactionRating': { $exists: true } }")
    List<ChatConversation> findConversationsWithRating();

    List<ChatConversation> findByAssignedStaffId(String staffId);

    @Query("{ 'category': ?0, 'status': 'RESOLVED' }")
    List<ChatConversation> findResolvedByCategory(String category);
}


