package com.bean.hotel_management.auth.repository;

import com.bean.hotel_management.auth.model.VerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface IVerificationTokenRepository extends MongoRepository<VerificationToken, String> {

    Optional<VerificationToken> findByToken(String token);

    void deleteByEmailAndTokenType(String email, String tokenType);

}