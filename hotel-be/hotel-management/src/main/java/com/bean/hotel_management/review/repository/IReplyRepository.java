package com.bean.hotel_management.review.repository;

import com.bean.hotel_management.review.model.Reply;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IReplyRepository extends MongoRepository<Reply, String> {
}
