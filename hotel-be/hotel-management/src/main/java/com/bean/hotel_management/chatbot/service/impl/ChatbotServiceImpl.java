package com.bean.hotel_management.chatbot.service.impl;

import com.bean.hotel_management.chatbot.dto.*;
import com.bean.hotel_management.chatbot.model.*;
import com.bean.hotel_management.chatbot.repository.*;
import com.bean.hotel_management.chatbot.service.IChatbotService;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.bean.hotel_management.chatbot.constants.ChatbotConstants.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements IChatbotService {

    private final IChatConversationRepository conversationRepository;
    private final IFAQRepository faqRepository;
    private final IChatIntentRepository intentRepository;

    // ==================== CHAT OPERATIONS ====================

    @Override
    @Transactional
    public ChatResponse processMessage(ChatRequest request) {
        String sessionId = request.getSessionId();
        ChatConversation conversation;

        // Get or create conversation
        if (sessionId != null) {
            conversation = conversationRepository.findBySessionId(sessionId)
                    .orElseGet(() -> createNewConversation(request));
        } else {
            conversation = createNewConversation(request);
            sessionId = conversation.getSessionId();
        }

        // Add user message to conversation
        ChatMessage userMessage = createUserMessage(request.getMessage());
        conversation.getMessages().add(userMessage);
        conversation.setTotalMessages(conversation.getTotalMessages() + 1);
        conversation.setLastMessageAt(LocalDateTime.now());

        // Detect intent and generate response
        String intent = detectIntent(request.getMessage());
        Double confidence = getIntentConfidence(request.getMessage(), intent);

        ChatResponse botResponse = generateResponse(
                request.getMessage(),
                intent,
                confidence,
                conversation
        );

        // Add bot message to conversation
        ChatMessage botMessage = createBotMessage(
                botResponse.getMessage(),
                intent,
                confidence,
                botResponse.getQuickReplies()
        );
        conversation.getMessages().add(botMessage);
        conversation.setTotalMessages(conversation.getTotalMessages() + 1);

        // Update category if detected
        if (conversation.getCategory() == null) {
            conversation.setCategory(mapIntentToCategory(intent));
        }

        // Check if needs human support
        if (confidence < Settings.CONFIDENCE_THRESHOLD ||
                intent.equals(Intents.COMPLAINT)) {
            conversation.setNeedsHumanSupport(true);
            botResponse.setNeedsHumanSupport(true);
        }

        conversationRepository.save(conversation);

        botResponse.setSessionId(sessionId);
        botResponse.setTimestamp(LocalDateTime.now());

        log.info("Processed message for session: {}, intent: {}", sessionId, intent);
        return botResponse;
    }

    @Override
    public String startConversation(String userId, String userName) {
        String sessionId = UUID.randomUUID().toString();

        ChatConversation conversation = ChatConversation.builder()
                .sessionId(sessionId)
                .userId(userId)
                .userName(userName)
                .messages(new ArrayList<>())
                .status(ConversationStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .lastMessageAt(LocalDateTime.now())
                .needsHumanSupport(false)
                .totalMessages(0)
                .build();

        conversationRepository.save(conversation);
        log.info("Started new conversation: {}", sessionId);

        return sessionId;
    }

    @Override
    @Transactional
    public void endConversation(String sessionId) {
        ChatConversation conversation = findConversationBySessionId(sessionId);
        conversation.setStatus(ConversationStatus.CLOSED);
        conversation.setClosedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("Closed conversation: {}", sessionId);
    }

    @Override
    public ConversationResponse getConversation(String sessionId) {
        ChatConversation conversation = findConversationBySessionId(sessionId);
        return mapToConversationResponse(conversation);
    }

    @Override
    public List<ConversationResponse> getUserConversations(String userId) {
        return conversationRepository.findByUserId(userId).stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void transferToHuman(String sessionId) {
        ChatConversation conversation = findConversationBySessionId(sessionId);
        conversation.setNeedsHumanSupport(true);
        conversation.setStatus(ConversationStatus.TRANSFERRED);
        conversationRepository.save(conversation);

        log.info("Transferred conversation to human: {}", sessionId);
    }

    // ==================== INTENT DETECTION & RESPONSE GENERATION ====================

    @Override
    public String detectIntent(String message) {
        String lowerMessage = message.toLowerCase().trim();

        // Check greeting
        if (containsAny(lowerMessage, Keywords.GREETING_KEYWORDS)) {
            return Intents.GREETING;
        }

        // Check goodbye
        if (containsAny(lowerMessage, Keywords.GOODBYE_KEYWORDS)) {
            return Intents.GOODBYE;
        }

        // Check booking
        if (containsAny(lowerMessage, Keywords.BOOKING_KEYWORDS)) {
            return Intents.BOOKING_INQUIRY;
        }

        // Check room info
        if (containsAny(lowerMessage, Keywords.ROOM_KEYWORDS)) {
            return Intents.ROOM_INFO;
        }

        // Check price
        if (containsAny(lowerMessage, Keywords.PRICE_KEYWORDS)) {
            return Intents.PRICE_INQUIRY;
        }

        // Check facility
        if (containsAny(lowerMessage, Keywords.FACILITY_KEYWORDS)) {
            return Intents.FACILITY_INFO;
        }

        // Check check-in/out
        if (containsAny(lowerMessage, Keywords.CHECKIN_KEYWORDS) ||
                containsAny(lowerMessage, Keywords.CHECKOUT_KEYWORDS)) {
            return Intents.CHECK_IN_OUT;
        }

        // Check cancellation
        if (containsAny(lowerMessage, Keywords.CANCEL_KEYWORDS)) {
            return Intents.CANCELLATION;
        }

        // Check payment
        if (containsAny(lowerMessage, Keywords.PAYMENT_KEYWORDS)) {
            return Intents.PAYMENT;
        }

        // Check location
        if (containsAny(lowerMessage, Keywords.LOCATION_KEYWORDS)) {
            return Intents.LOCATION;
        }

        // Check contact
        if (containsAny(lowerMessage, Keywords.CONTACT_KEYWORDS)) {
            return Intents.CONTACT;
        }

        // Check help
        if (containsAny(lowerMessage, Keywords.HELP_KEYWORDS)) {
            return Intents.HELP;
        }

        return Intents.UNKNOWN;
    }

    @Override
    public Double getIntentConfidence(String message, String intent) {
        String lowerMessage = message.toLowerCase();
        int matchCount = 0;
        int totalKeywords = 0;

        List<String> keywords = getKeywordsForIntent(intent);
        totalKeywords = keywords.size();

        for (String keyword : keywords) {
            if (lowerMessage.contains(keyword)) {
                matchCount++;
            }
        }

        return totalKeywords > 0
                ? (matchCount / (double) totalKeywords)
                : 0.0;
    }

    private ChatResponse generateResponse(
            String userMessage,
            String intent,
            Double confidence,
            ChatConversation conversation) {

        ChatResponse.ChatResponseBuilder responseBuilder = ChatResponse.builder()
                .messageType(MessageType.TEXT)
                .intentDetected(intent)
                .confidence(confidence);

        switch (intent) {
            case Intents.GREETING:
                responseBuilder
                        .message(Responses.GREETING)
                        .quickReplies(createInitialQuickReplies());
                break;

            case Intents.GOODBYE:
                responseBuilder.message(Responses.GOODBYE);
                break;

            case Intents.BOOKING_INQUIRY:
                responseBuilder
                        .message("Tôi có thể giúp bạn đặt phòng. " +
                                "Bạn muốn đặt phòng cho ngày nào?")
                        .quickReplies(createBookingQuickReplies());
                break;

            case Intents.ROOM_INFO:
                responseBuilder
                        .message("Khách sạn chúng tôi có các loại phòng:\n" +
                                "• Phòng Standard (2.000.000đ/đêm)\n" +
                                "• Phòng Deluxe (3.000.000đ/đêm)\n" +
                                "• Phòng Suite (5.000.000đ/đêm)\n" +
                                "Bạn muốn xem chi tiết phòng nào?");
                break;

            case Intents.PRICE_INQUIRY:
                responseBuilder
                        .message("Giá phòng của chúng tôi:\n" +
                                "• Standard: 2.000.000đ/đêm\n" +
                                "• Deluxe: 3.000.000đ/đêm\n" +
                                "• Suite: 5.000.000đ/đêm\n" +
                                "Giá đã bao gồm VAT và phí dịch vụ.");
                break;

            case Intents.FACILITY_INFO:
                responseBuilder
                        .message("Tiện ích của khách sạn:\n" +
                                "• " + HotelInfo.FACILITIES + "\n" +
                                "Tất cả đều miễn phí cho khách lưu trú!");
                break;

            case Intents.CHECK_IN_OUT:
                responseBuilder
                        .message("Giờ nhận phòng: " + HotelInfo.CHECKIN_TIME + "\n" +
                                "Giờ trả phòng: " + HotelInfo.CHECKOUT_TIME + "\n" +
                                "Chúng tôi có dịch vụ check-in sớm và check-out muộn với phụ phí.");
                break;

            case Intents.CANCELLATION:
                responseBuilder
                        .message("Chính sách hủy phòng:\n" +
                                "• Miễn phí nếu hủy trước 24h\n" +
                                "• Phí 20% nếu hủy trong vòng 24h\n" +
                                "Bạn muốn hủy booking nào?");
                break;

            case Intents.PAYMENT:
                responseBuilder
                        .message("Chúng tôi chấp nhận:\n" +
                                "• Tiền mặt\n" +
                                "• Thẻ tín dụng/ghi nợ\n" +
                                "• Chuyển khoản\n" +
                                "• Ví điện tử (Momo, ZaloPay)");
                break;

            case Intents.LOCATION:
                responseBuilder
                        .message("Khách sạn của chúng tôi:\n" +
                                "📍 Địa chỉ: " + HotelInfo.ADDRESS + "\n" +
                                "🚗 Cách sân bay 30 phút\n" +
                                "🚇 Gần các trạm Metro");
                break;

            case Intents.CONTACT:
                responseBuilder
                        .message("Liên hệ với chúng tôi:\n" +
                                "📞 Hotline: " + HotelInfo.PHONE + "\n" +
                                "📧 Email: " + HotelInfo.EMAIL + "\n" +
                                "⏰ Hỗ trợ 24/7");
                break;

            case Intents.HELP:
                responseBuilder
                        .message("Tôi có thể giúp bạn:\n" +
                                "• Đặt phòng\n" +
                                "• Xem thông tin phòng\n" +
                                "• Hỏi về tiện ích\n" +
                                "• Chính sách khách sạn\n" +
                                "Hoặc bạn có thể nói chuyện với nhân viên?")
                        .quickReplies(createHelpQuickReplies());
                break;

            case Intents.COMPLAINT:
                responseBuilder
                        .message("Tôi rất tiếc về sự bất tiện này. " +
                                "Để xử lý tốt nhất, tôi sẽ chuyển bạn đến bộ phận hỗ trợ.")
                        .needsHumanSupport(true);
                break;

            default:
                // Try to find answer in FAQs
                List<FAQResponse> faqs = searchFAQs(userMessage);
                if (!faqs.isEmpty()) {
                    responseBuilder.message(faqs.get(0).getAnswer());
                } else {
                    responseBuilder
                            .message(Responses.NOT_UNDERSTAND + "\n" +
                                    "Bạn có thể thử:\n" +
                                    "• Đặt câu hỏi khác\n" +
                                    "• Xem FAQ\n" +
                                    "• Nói chuyện với nhân viên")
                            .quickReplies(createHelpQuickReplies());
                }
                break;
        }

        return responseBuilder.build();
    }

    // ==================== HELPER METHODS ====================

    private ChatConversation createNewConversation(ChatRequest request) {
        String sessionId = UUID.randomUUID().toString();

        return ChatConversation.builder()
                .sessionId(sessionId)
                .userId(request.getUserId())
                .messages(new ArrayList<>())
                .status(ConversationStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .lastMessageAt(LocalDateTime.now())
                .needsHumanSupport(false)
                .totalMessages(0)
                .build();
    }

    private ChatMessage createUserMessage(String content) {
        return ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .content(content)
                .type(MessageType.TEXT)
                .sender(MessageSender.USER)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private ChatMessage createBotMessage(
            String content, String intent, Double confidence, List<QuickReply> quickReplies) {

        return ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .content(content)
                .type(quickReplies != null && !quickReplies.isEmpty()
                        ? MessageType.QUICK_REPLY
                        : MessageType.TEXT)
                .sender(MessageSender.BOT)
                .timestamp(LocalDateTime.now())
                .intentDetected(intent)
                .confidence(confidence)
                .quickReplies(quickReplies)
                .build();
    }

    private List<QuickReply> createInitialQuickReplies() {
        return Arrays.stream(QuickReplies.INITIAL_OPTIONS)
                .map(option -> QuickReply.builder()
                        .text(option)
                        .value(option)
                        .build())
                .collect(Collectors.toList());
    }

    private List<QuickReply> createBookingQuickReplies() {
        return Arrays.stream(QuickReplies.BOOKING_OPTIONS)
                .map(option -> QuickReply.builder()
                        .text(option)
                        .value(option)
                        .build())
                .collect(Collectors.toList());
    }

    private List<QuickReply> createHelpQuickReplies() {
        return Arrays.stream(QuickReplies.HELP_OPTIONS)
                .map(option -> QuickReply.builder()
                        .text(option)
                        .value(option)
                        .build())
                .collect(Collectors.toList());
    }

    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }

    private List<String> getKeywordsForIntent(String intent) {
        switch (intent) {
            case Intents.GREETING: return Keywords.GREETING_KEYWORDS;
            case Intents.GOODBYE: return Keywords.GOODBYE_KEYWORDS;
            case Intents.BOOKING_INQUIRY: return Keywords.BOOKING_KEYWORDS;
            case Intents.ROOM_INFO: return Keywords.ROOM_KEYWORDS;
            case Intents.PRICE_INQUIRY: return Keywords.PRICE_KEYWORDS;
            case Intents.FACILITY_INFO: return Keywords.FACILITY_KEYWORDS;
            case Intents.CANCELLATION: return Keywords.CANCEL_KEYWORDS;
            case Intents.PAYMENT: return Keywords.PAYMENT_KEYWORDS;
            case Intents.LOCATION: return Keywords.LOCATION_KEYWORDS;
            case Intents.CONTACT: return Keywords.CONTACT_KEYWORDS;
            case Intents.HELP: return Keywords.HELP_KEYWORDS;
            default: return Collections.emptyList();
        }
    }

    private String mapIntentToCategory(String intent) {
        switch (intent) {
            case Intents.BOOKING_INQUIRY:
            case Intents.CANCELLATION:
                return Categories.BOOKING;
            case Intents.ROOM_INFO:
            case Intents.PRICE_INQUIRY:
                return Categories.ROOM;
            case Intents.FACILITY_INFO:
                return Categories.FACILITY;
            case Intents.PAYMENT:
                return Categories.PAYMENT;
            case Intents.CHECK_IN_OUT:
                return Categories.POLICY;
            case Intents.LOCATION:
                return Categories.LOCATION;
            default:
                return Categories.OTHER;
        }
    }

    private ChatConversation findConversationBySessionId(String sessionId) {
        return conversationRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy conversation với session: " + sessionId));
    }

    private ConversationResponse mapToConversationResponse(ChatConversation conversation) {
        return ConversationResponse.builder()
                .id(conversation.getId())
                .sessionId(conversation.getSessionId())
                .userId(conversation.getUserId())
                .userName(conversation.getUserName())
                .messages(conversation.getMessages())
                .status(conversation.getStatus().getVietnameseName())
                .category(conversation.getCategory())
                .startedAt(conversation.getStartedAt())
                .lastMessageAt(conversation.getLastMessageAt())
                .needsHumanSupport(conversation.getNeedsHumanSupport())
                .totalMessages(conversation.getTotalMessages())
                .build();
    }

// ==================== FAQ MANAGEMENT ====================
// Thêm vào ChatbotServiceImpl.java

    @Override
    public List<FAQResponse> searchFAQs(String query) {
        String lowerQuery = query.toLowerCase();

        // Search in FAQs
        List<FAQ> faqs = faqRepository.searchFAQs(lowerQuery);

        // Sort by relevance (simple keyword matching)
        return faqs.stream()
                .map(faq -> {
                    int relevanceScore = calculateRelevance(query, faq);
                    FAQResponse response = mapToFAQResponse(faq);
                    return new AbstractMap.SimpleEntry<>(relevanceScore, response);
                })
                .sorted(Map.Entry.<Integer, FAQResponse>comparingByKey().reversed())
                .limit(5)
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
    }

    @Override
    public List<FAQResponse> getAllFAQs() {
        return faqRepository.findByIsActiveTrue().stream()
                .map(this::mapToFAQResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FAQResponse> getFAQsByCategory(String category) {
        return faqRepository.findByCategoryAndIsActiveTrue(category).stream()
                .map(this::mapToFAQResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FAQResponse> getTopFAQs(Integer limit) {
        return faqRepository.findTop10ByIsActiveTrueOrderByHelpfulCountDesc().stream()
                .limit(limit)
                .map(this::mapToFAQResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FAQResponse createFAQ(CreateFAQRequest request) {
        FAQ faq = FAQ.builder()
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .keywords(request.getKeywords())
                .alternativeQuestions(request.getAlternativeQuestions())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .isActive(true)
                .viewCount(0)
                .helpfulCount(0)
                .notHelpfulCount(0)
                .createdDate(LocalDateTime.now())
                .build();

        FAQ savedFAQ = faqRepository.save(faq);
        log.info("Created new FAQ: {}", savedFAQ.getId());

        return mapToFAQResponse(savedFAQ);
    }

    @Override
    @Transactional
    public FAQResponse updateFAQ(String faqId, UpdateFAQRequest request) {
        FAQ faq = findFAQById(faqId);

        if (request.getQuestion() != null) {
            faq.setQuestion(request.getQuestion());
        }
        if (request.getAnswer() != null) {
            faq.setAnswer(request.getAnswer());
        }
        if (request.getKeywords() != null) {
            faq.setKeywords(request.getKeywords());
        }
        if (request.getAlternativeQuestions() != null) {
            faq.setAlternativeQuestions(request.getAlternativeQuestions());
        }
        if (request.getCategory() != null) {
            faq.setCategory(request.getCategory());
        }
        if (request.getPriority() != null) {
            faq.setPriority(request.getPriority());
        }
        if (request.getIsActive() != null) {
            faq.setIsActive(request.getIsActive());
        }

        faq.setUpdatedDate(LocalDateTime.now());
        FAQ updatedFAQ = faqRepository.save(faq);

        log.info("Updated FAQ: {}", faqId);
        return mapToFAQResponse(updatedFAQ);
    }

    @Override
    @Transactional
    public void deleteFAQ(String faqId) {
        FAQ faq = findFAQById(faqId);
        faq.setIsActive(false);
        faqRepository.save(faq);

        log.info("Deleted FAQ: {}", faqId);
    }

    @Override
    @Transactional
    public void markFAQHelpful(String faqId, Boolean helpful) {
        FAQ faq = findFAQById(faqId);

        if (helpful) {
            faq.setHelpfulCount(faq.getHelpfulCount() + 1);
        } else {
            faq.setNotHelpfulCount(faq.getNotHelpfulCount() + 1);
        }

        faqRepository.save(faq);
    }

// ==================== FEEDBACK ====================

    @Override
    @Transactional
    public void submitFeedback(ChatFeedbackRequest request) {
        ChatConversation conversation = findConversationBySessionId(request.getSessionId());

        conversation.setSatisfactionRating(request.getRating());
        conversation.setFeedback(request.getFeedback());
        conversation.setStatus(ConversationStatus.RESOLVED);

        conversationRepository.save(conversation);
        log.info("Received feedback for session: {}", request.getSessionId());
    }

    @Override
    @Transactional
    public void rateMessage(String sessionId, String messageId, Boolean isHelpful) {
        ChatConversation conversation = findConversationBySessionId(sessionId);

        conversation.getMessages().stream()
                .filter(msg -> msg.getId().equals(messageId))
                .findFirst()
                .ifPresent(msg -> msg.setIsHelpful(isHelpful));

        conversationRepository.save(conversation);
    }

// ==================== ANALYTICS ====================

    @Override
    public ChatbotStats getChatbotStats() {
        List<ChatConversation> allConversations = conversationRepository.findAll();

        Integer totalConversations = allConversations.size();
        Integer activeConversations = (int) allConversations.stream()
                .filter(c -> c.getStatus() == ConversationStatus.ACTIVE)
                .count();
        Integer resolvedConversations = (int) allConversations.stream()
                .filter(c -> c.getStatus() == ConversationStatus.RESOLVED)
                .count();
        Integer transferredToHuman = (int) allConversations.stream()
                .filter(c -> c.getStatus() == ConversationStatus.TRANSFERRED)
                .count();

        List<ChatConversation> ratedConversations =
                conversationRepository.findConversationsWithRating();

        Double averageSatisfactionRating = ratedConversations.stream()
                .mapToDouble(ChatConversation::getSatisfactionRating)
                .average()
                .orElse(0.0);

        Double resolutionRate = totalConversations > 0
                ? (resolvedConversations / (double) totalConversations) * 100
                : 0.0;

        Double transferRate = totalConversations > 0
                ? (transferredToHuman / (double) totalConversations) * 100
                : 0.0;

        Integer totalMessages = allConversations.stream()
                .mapToInt(ChatConversation::getTotalMessages)
                .sum();

        Double averageMessagesPerConversation = totalConversations > 0
                ? totalMessages / (double) totalConversations
                : 0.0;

        // Category stats
        Map<String, Long> categoryCount = allConversations.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(
                        ChatConversation::getCategory,
                        Collectors.counting()
                ));

        List<CategoryStats> categoryStats = categoryCount.entrySet().stream()
                .map(entry -> CategoryStats.builder()
                        .category(entry.getKey())
                        .count(entry.getValue().intValue())
                        .percentage((entry.getValue() / (double) totalConversations) * 100)
                        .build())
                .collect(Collectors.toList());

        // Intent stats (from messages)
        Map<String, List<ChatMessage>> intentMessages = allConversations.stream()
                .flatMap(c -> c.getMessages().stream())
                .filter(m -> m.getIntentDetected() != null)
                .collect(Collectors.groupingBy(ChatMessage::getIntentDetected));

        List<IntentStats> intentStats = intentMessages.entrySet().stream()
                .map(entry -> {
                    List<ChatMessage> messages = entry.getValue();
                    Double avgConfidence = messages.stream()
                            .filter(m -> m.getConfidence() != null)
                            .mapToDouble(ChatMessage::getConfidence)
                            .average()
                            .orElse(0.0);

                    return IntentStats.builder()
                            .intent(entry.getKey())
                            .count(messages.size())
                            .averageConfidence(Math.round(avgConfidence * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());

        return ChatbotStats.builder()
                .totalConversations(totalConversations)
                .activeConversations(activeConversations)
                .resolvedConversations(resolvedConversations)
                .transferredToHuman(transferredToHuman)
                .averageSatisfactionRating(Math.round(averageSatisfactionRating * 100.0) / 100.0)
                .resolutionRate(Math.round(resolutionRate * 100.0) / 100.0)
                .transferRate(Math.round(transferRate * 100.0) / 100.0)
                .totalMessages(totalMessages)
                .averageMessagesPerConversation(Math.round(averageMessagesPerConversation * 100.0) / 100.0)
                .averageResponseTime(0.5) // Mock value
                .categoryStats(categoryStats)
                .intentStats(intentStats)
                .build();
    }

    @Override
    public List<ConversationResponse> getConversationsNeedingSupport() {
        return conversationRepository.findConversationsNeedingSupport().stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationResponse> getConversationsByStatus(ConversationStatus status) {
        return conversationRepository.findByStatus(status).stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationResponse> getConversationsByDateRange(
            LocalDateTime startDate, LocalDateTime endDate) {

        return conversationRepository.findByDateRange(startDate, endDate).stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageSatisfactionRating() {
        return conversationRepository.findConversationsWithRating().stream()
                .mapToDouble(ChatConversation::getSatisfactionRating)
                .average()
                .orElse(0.0);
    }

// ==================== PRIVATE HELPER METHODS ====================

    private FAQ findFAQById(String faqId) {
        return faqRepository.findById(faqId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy FAQ với ID: " + faqId));
    }

    private FAQResponse mapToFAQResponse(FAQ faq) {
        int total = faq.getHelpfulCount() + faq.getNotHelpfulCount();
        Double helpfulRate = total > 0
                ? (faq.getHelpfulCount() / (double) total) * 100
                : 0.0;

        return FAQResponse.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .category(faq.getCategory())
                .helpfulCount(faq.getHelpfulCount())
                .notHelpfulCount(faq.getNotHelpfulCount())
                .helpfulRate(Math.round(helpfulRate * 100.0) / 100.0)
                .build();
    }

    private int calculateRelevance(String query, FAQ faq) {
        int score = 0;
        String lowerQuery = query.toLowerCase();

        // Check question match
        if (faq.getQuestion().toLowerCase().contains(lowerQuery)) {
            score += 10;
        }

        // Check keywords
        if (faq.getKeywords() != null) {
            for (String keyword : faq.getKeywords()) {
                if (lowerQuery.contains(keyword.toLowerCase())) {
                    score += 5;
                }
            }
        }

        // Check alternative questions
        if (faq.getAlternativeQuestions() != null) {
            for (String altQuestion : faq.getAlternativeQuestions()) {
                if (altQuestion.toLowerCase().contains(lowerQuery)) {
                    score += 7;
                }
            }
        }

        // Priority bonus
        score += (faq.getPriority() != null ? faq.getPriority() : 0);

        return score;
    }
}