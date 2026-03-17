package com.bean.hotel_management.chatbot.service;

import com.bean.hotel_management.chatbot.dto.*;
import com.bean.hotel_management.chatbot.model.ConversationStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface IChatbotService {

    // ==================== CHAT OPERATIONS ====================

    /**
     * Xử lý user message và trả về bot response
     */
    ChatResponse processMessage(ChatRequest request);

    /**
     * Bắt đầu conversation mới
     */
    String startConversation(String userId, String userName);

    /**
     * Kết thúc conversation
     */
    void endConversation(String sessionId);

    /**
     * Lấy conversation history
     */
    ConversationResponse getConversation(String sessionId);

    /**
     * Lấy tất cả conversations của user
     */
    List<ConversationResponse> getUserConversations(String userId);

    /**
     * Chuyển conversation sang nhân viên
     */
    void transferToHuman(String sessionId);

    // ==================== FAQ MANAGEMENT ====================

    /**
     * Tìm FAQs liên quan
     */
    List<FAQResponse> searchFAQs(String query);

    /**
     * Lấy tất cả FAQs
     */
    List<FAQResponse> getAllFAQs();

    /**
     * Lấy FAQs theo category
     */
    List<FAQResponse> getFAQsByCategory(String category);

    /**
     * Lấy top FAQs (most viewed/helpful)
     */
    List<FAQResponse> getTopFAQs(Integer limit);

    /**
     * Tạo FAQ mới (Admin)
     */
    FAQResponse createFAQ(CreateFAQRequest request);

    /**
     * Cập nhật FAQ (Admin)
     */
    FAQResponse updateFAQ(String faqId, UpdateFAQRequest request);

    /**
     * Xóa FAQ (Admin)
     */
    void deleteFAQ(String faqId);

    /**
     * Đánh dấu FAQ helpful/not helpful
     */
    void markFAQHelpful(String faqId, Boolean helpful);

    // ==================== FEEDBACK ====================

    /**
     * Gửi feedback cho conversation
     */
    void submitFeedback(ChatFeedbackRequest request);

    /**
     * Đánh giá bot response
     */
    void rateMessage(String sessionId, String messageId, Boolean isHelpful);

    // ==================== ANALYTICS ====================

    /**
     * Lấy chatbot statistics
     */
    ChatbotStats getChatbotStats();

    /**
     * Lấy conversations cần hỗ trợ
     */
    List<ConversationResponse> getConversationsNeedingSupport();

    /**
     * Lấy conversations theo status
     */
    List<ConversationResponse> getConversationsByStatus(ConversationStatus status);

    /**
     * Lấy conversations trong khoảng thời gian
     */
    List<ConversationResponse> getConversationsByDateRange(
            LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Lấy average satisfaction rating
     */
    Double getAverageSatisfactionRating();

    // ==================== INTENT DETECTION ====================

    /**
     * Detect intent từ user message
     */
    String detectIntent(String message);

    /**
     * Lấy confidence score của intent
     */
    Double getIntentConfidence(String message, String intent);
}