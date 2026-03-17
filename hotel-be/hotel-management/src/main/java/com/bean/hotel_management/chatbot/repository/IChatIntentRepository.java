package com.bean.hotel_management.chatbot.repository;

import com.bean.hotel_management.chatbot.model.ChatIntent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IChatIntentRepository extends MongoRepository<ChatIntent, String> {

    Optional<ChatIntent> findByIntentName(String intentName);

    List<ChatIntent> findByIsActiveTrue();

    @Query("{ 'trainingPhrases': { $regex: ?0, $options: 'i' }, 'isActive': true }")
    List<ChatIntent> findByTrainingPhrase(String phrase);

    List<ChatIntent> findTop10ByIsActiveTrueOrderByUsageCountDesc();

    @Query("{ 'isActive': true }")
    List<ChatIntent> findAllActiveIntents();
}
