package com.bean.hotel_management.user.repository;

import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface IUserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailOrUsername(String email, String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhoneNumber(String phoneNumber);

    Page<User> findByRoleNot(Role role, Pageable pageable);

    // Tìm theo role cụ thể
    Page<User> findByRole(Role role, Pageable pageable);

    // Tìm kiếm với điều kiện
    @Query("{ $and: [ " +
            "{ 'role': { $ne: ?0 } }, " +
            "{ $or: [ " +
            "  { 'fullName': { $regex: ?1, $options: 'i' } }, " +
            "  { 'email': { $regex: ?1, $options: 'i' } }, " +
            "  { 'username': { $regex: ?1, $options: 'i' } }, " +
            "  { 'phoneNumber': { $regex: ?1, $options: 'i' } } " +
            "] } " +
            "] }")
    Page<User> searchUsersExcludingRole(Role excludedRole, String searchTerm, Pageable pageable);

    boolean existsByCccdNumber(String cccdNumber);
}