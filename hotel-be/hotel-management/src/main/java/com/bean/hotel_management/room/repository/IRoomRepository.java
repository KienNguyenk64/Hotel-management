package com.bean.hotel_management.room.repository;

import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.model.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IRoomRepository extends MongoRepository<Room, String> {

    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Room> findByStatus(RoomStatus status);

    List<Room> findByType(RoomType type);

    List<Room> findByFloor(Integer floor);

    List<Room> findByIsActiveTrue();

    List<Room> findByIsActiveFalse();

    List<Room> findByIsFeaturedTrue();

    List<Room> findByStatusAndIsActiveTrue(RoomStatus status);

    Long countByStatus(RoomStatus status);

    Long countByStatusAndIsActiveTrue(RoomStatus status);

    List<Room> findByTypeAndIsActiveTrue(RoomType type);

    Long countByType(RoomType type);

    List<Room> findByPricePerNightBetween(Double minPrice, Double maxPrice);

    List<Room> findByPricePerNightLessThanEqual(Double maxPrice);

    List<Room> findByPricePerNightGreaterThanEqual(Double minPrice);

    List<Room> findByMaxOccupancyGreaterThanEqual(Integer minOccupancy);

    @Query("{ 'isActive': true, 'status': ?0, 'type': ?1 }")
    List<Room> findAvailableByTypeAndStatus(RoomStatus status, RoomType type);

    @Query("{ 'isActive': true, 'status': 'AVAILABLE', 'pricePerNight': { $gte: ?0, $lte: ?1 } }")
    List<Room> findAvailableByPriceRange(Double minPrice, Double maxPrice);

    @Query("{ 'isActive': true, 'maxOccupancy': { $gte: ?0 } }")
    List<Room> findByMinOccupancy(Integer minOccupancy);

    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } }, { 'roomNumber': { $regex: ?0, $options: 'i' } } ] }")
    Page<Room> searchRooms(String keyword, Pageable pageable);

    @Query("{ 'isActive': true }")
    Long countActiveRooms();

    @Query(value = "{ 'isActive': true }", fields = "{ 'pricePerNight': 1 }")
    List<Room> findAllPrices();

    @Query("{ 'amenities': { $in: ?0 } }")
    List<Room> findByAmenities(List<String> amenities);

    List<Room> findByAllowSmokingTrue();

    List<Room> findByHasBalconyTrue();

    List<Room> findByHasKitchenTrue();

    @Query("{ " +
            "'isActive': true, " +
            "'status': { $in: ?0 }, " +
            "'pricePerNight': { $gte: ?1, $lte: ?2 }, " +
            "'maxOccupancy': { $gte: ?3 } " +
            "}")
    Page<Room> advancedSearch(
            List<RoomStatus> statuses,
            Double minPrice,
            Double maxPrice,
            Integer minOccupancy,
            Pageable pageable
    );

    Page<Room> findByIsActiveTrueAndStatus(RoomStatus status, Pageable pageable);

}
