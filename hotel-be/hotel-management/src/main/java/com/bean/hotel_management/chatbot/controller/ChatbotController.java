package com.bean.hotel_management.chatbot.controller;

import com.bean.hotel_management.chatbot.dto.*;
import com.bean.hotel_management.chatbot.model.ConversationStatus;
import com.bean.hotel_management.chatbot.service.IChatbotService;
import com.bean.hotel_management.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final IChatbotService chatbotService;

    // ==================== PUBLIC CHAT ENDPOINTS ====================

    /**
     * Gửi message tới chatbot
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatbotService.processMessage(request);
        return ResponseEntity.ok(
                ApiResponse.success("Message processed successfully", response));
    }

    /**
     * Bắt đầu conversation mới
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse> startConversation(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String userName) {

        String sessionId = chatbotService.startConversation(userId, userName);
        return ResponseEntity.ok(
                ApiResponse.success("Conversation started",
                        Map.of("sessionId", sessionId)));
    }

    /**
     * Kết thúc conversation
     */
    @PostMapping("/end/{sessionId}")
    public ResponseEntity<ApiResponse> endConversation(@PathVariable String sessionId) {
        chatbotService.endConversation(sessionId);
        return ResponseEntity.ok(
                ApiResponse.success("Conversation ended", null));
    }

    /**
     * Lấy conversation history
     */
    @GetMapping("/conversation/{sessionId}")
    public ResponseEntity<ApiResponse> getConversation(@PathVariable String sessionId) {
        ConversationResponse conversation = chatbotService.getConversation(sessionId);
        return ResponseEntity.ok(
                ApiResponse.success("Conversation retrieved successfully", conversation));
    }

    /**
     * Chuyển sang nhân viên
     */
    @PostMapping("/transfer/{sessionId}")
    public ResponseEntity<ApiResponse> transferToHuman(@PathVariable String sessionId) {
        chatbotService.transferToHuman(sessionId);
        return ResponseEntity.ok(
                ApiResponse.success("Conversation transferred to human support", null));
    }

    /**
     * Gửi feedback
     */
    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse> submitFeedback(
            @Valid @RequestBody ChatFeedbackRequest request) {

        chatbotService.submitFeedback(request);
        return ResponseEntity.ok(
                ApiResponse.success("Feedback submitted successfully", null));
    }

    // ==================== FAQ ENDPOINTS ====================

    /**
     * Tìm kiếm FAQs
     */
    @GetMapping("/faq/search")
    public ResponseEntity<ApiResponse> searchFAQs(@RequestParam String query) {
        List<FAQResponse> faqs = chatbotService.searchFAQs(query);
        return ResponseEntity.ok(
                ApiResponse.success("FAQs retrieved successfully", faqs));
    }

    /**
     * Lấy tất cả FAQs
     */
    @GetMapping("/faq")
    public ResponseEntity<ApiResponse> getAllFAQs() {
        List<FAQResponse> faqs = chatbotService.getAllFAQs();
        return ResponseEntity.ok(
                ApiResponse.success("FAQs retrieved successfully", faqs));
    }

    /**
     * Lấy FAQs theo category
     */
    @GetMapping("/faq/category/{category}")
    public ResponseEntity<ApiResponse> getFAQsByCategory(@PathVariable String category) {
        List<FAQResponse> faqs = chatbotService.getFAQsByCategory(category);
        return ResponseEntity.ok(
                ApiResponse.success("FAQs retrieved successfully", faqs));
    }

    /**
     * Lấy top FAQs
     */
    @GetMapping("/faq/top")
    public ResponseEntity<ApiResponse> getTopFAQs(
            @RequestParam(defaultValue = "10") Integer limit) {

        List<FAQResponse> faqs = chatbotService.getTopFAQs(limit);
        return ResponseEntity.ok(
                ApiResponse.success("Top FAQs retrieved successfully", faqs));
    }

    /**
     * Đánh giá FAQ helpful/not helpful
     */
    @PostMapping("/faq/{faqId}/helpful")
    public ResponseEntity<ApiResponse> markFAQHelpful(
            @PathVariable String faqId,
            @RequestParam Boolean helpful) {

        chatbotService.markFAQHelpful(faqId, helpful);
        return ResponseEntity.ok(
                ApiResponse.success("Feedback recorded", null));
    }

    // ==================== USER ENDPOINTS ====================

    /**
     * Lấy conversations của user
     */
    @GetMapping("/user/conversations")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getUserConversations(Authentication authentication) {
        String userId = authentication.getName();
        List<ConversationResponse> conversations =
                chatbotService.getUserConversations(userId);

        return ResponseEntity.ok(
                ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Lấy chatbot statistics
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getChatbotStats() {
        ChatbotStats stats = chatbotService.getChatbotStats();
        return ResponseEntity.ok(
                ApiResponse.success("Statistics retrieved successfully", stats));
    }

    /**
     * Lấy conversations cần hỗ trợ
     */
    @GetMapping("/admin/conversations/need-support")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getConversationsNeedingSupport() {
        List<ConversationResponse> conversations =
                chatbotService.getConversationsNeedingSupport();

        return ResponseEntity.ok(
                ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    /**
     * Lấy conversations theo status
     */
    @GetMapping("/admin/conversations/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getConversationsByStatus(
            @PathVariable ConversationStatus status) {

        List<ConversationResponse> conversations =
                chatbotService.getConversationsByStatus(status);

        return ResponseEntity.ok(
                ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    /**
     * Lấy conversations theo date range
     */
    @GetMapping("/admin/conversations/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getConversationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        List<ConversationResponse> conversations =
                chatbotService.getConversationsByDateRange(startDate, endDate);

        return ResponseEntity.ok(
                ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    /**
     * Lấy average satisfaction rating
     */
    @GetMapping("/admin/satisfaction-rating")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAverageSatisfactionRating() {
        Double rating = chatbotService.getAverageSatisfactionRating();
        return ResponseEntity.ok(
                ApiResponse.success("Rating retrieved successfully", rating));
    }

    // ==================== ADMIN FAQ MANAGEMENT ====================

    /**
     * Tạo FAQ mới
     */
    @PostMapping("/admin/faq")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createFAQ(
            @Valid @RequestBody CreateFAQRequest request) {

        FAQResponse faq = chatbotService.createFAQ(request);
        return ResponseEntity.ok(
                ApiResponse.success("FAQ created successfully", faq));
    }

    /**
     * Cập nhật FAQ
     */
    @PutMapping("/admin/faq/{faqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateFAQ(
            @PathVariable String faqId,
            @Valid @RequestBody UpdateFAQRequest request) {

        FAQResponse faq = chatbotService.updateFAQ(faqId, request);
        return ResponseEntity.ok(
                ApiResponse.success("FAQ updated successfully", faq));
    }

    /**
     * Xóa FAQ
     */
    @DeleteMapping("/admin/faq/{faqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteFAQ(@PathVariable String faqId) {
        chatbotService.deleteFAQ(faqId);
        return ResponseEntity.ok(
                ApiResponse.success("FAQ deleted successfully", null));
    }
}