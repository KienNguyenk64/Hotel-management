package com.bean.hotel_management.chatbot.repository;

import com.bean.hotel_management.chatbot.model.FAQ;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface IFAQRepository extends MongoRepository<FAQ, String> {

    List<FAQ> findByIsActiveTrue();

    List<FAQ> findByCategory(String category);

    List<FAQ> findByCategoryAndIsActiveTrue(String category);

    @Query("{ 'keywords': { $in: ?0 }, 'isActive': true }")
    List<FAQ> findByKeywords(List<String> keywords);

    @Query("{ $or: [ " +
            "{ 'question': { $regex: ?0, $options: 'i' } }, " +
            "{ 'answer': { $regex: ?0, $options: 'i' } }, " +
            "{ 'keywords': { $regex: ?0, $options: 'i' } } " +
            "], 'isActive': true }")
    List<FAQ> searchFAQs(String searchTerm);

    List<FAQ> findTop10ByIsActiveTrueOrderByViewCountDesc();

    List<FAQ> findTop10ByIsActiveTrueOrderByHelpfulCountDesc();

    @Query("{ 'isActive': true }")
    List<FAQ> findAllActive();
}
