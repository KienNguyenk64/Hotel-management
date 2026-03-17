package com.bean.hotel_management.review.repository;

import com.bean.hotel_management.review.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IReviewRepository extends MongoRepository<Review, String> {
}
