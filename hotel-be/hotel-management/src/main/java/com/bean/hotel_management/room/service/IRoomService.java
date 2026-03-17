package com.bean.hotel_management.room.service;

import com.bean.hotel_management.room.dto.request.CreateRoomRequest;
import com.bean.hotel_management.room.dto.request.RoomSearchRequest;
import com.bean.hotel_management.room.dto.request.UpdateRoomRequest;
import com.bean.hotel_management.room.dto.response.RoomResponse;
import com.bean.hotel_management.room.dto.response.RoomStatistics;
import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.model.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IRoomService {

    RoomResponse createRoom(String adminEmail, CreateRoomRequest request);

    RoomResponse updateRoom(String roomId, UpdateRoomRequest request);

    void deleteRoom(String roomId);

    RoomResponse getRoomById(String roomId);

    RoomResponse getRoomByRoomNumber(String roomNumber);

    Page<RoomResponse> getAllRooms(int page, int size, String sortBy, String sortOrder, boolean includeReviews);

    Page<RoomResponse> searchRooms(RoomSearchRequest request);

    List<RoomResponse> getFeaturedRooms();

    List<RoomResponse> getAvailableRooms();

    List<RoomResponse> getRoomsByType(RoomType type);

    List<RoomResponse> getRoomsByStatus(RoomStatus status);

    List<RoomResponse> getRoomsByFloor(Integer floor);

    List<RoomResponse> getRoomsByPriceRange(Double minPrice, Double maxPrice);

    List<RoomResponse> getRoomsByOccupancy(Integer minOccupancy);

    // Status management
    RoomResponse updateRoomStatus(String roomId, RoomStatus status);

    RoomResponse markAsAvailable(String roomId);

    RoomResponse markAsOccupied(String roomId);

    RoomResponse markAsMaintenance(String roomId);

    RoomResponse markAsCleaning(String roomId);

    // Feature management
    RoomResponse toggleFeatured(String roomId);

    RoomResponse toggleActive(String roomId);

    // Image management
//    RoomResponse uploadImagesFile(String roomId, List<String> imageUrls);

    RoomResponse removeImage(String roomId, String imageUrl);

    RoomResponse setThumbnail(String roomId, String imageUrl);

    // Amenities management
    RoomResponse addAmenities(String roomId, List<String> amenities);

    RoomResponse removeAmenity(String roomId, String amenity);

    // Price management
    RoomResponse updatePrice(String roomId, Double newPrice);

    // Statistics
    RoomStatistics getRoomStatistics();

    Long countRoomsByStatus(RoomStatus status);

    Long countRoomsByType(RoomType type);

    Double getAveragePrice();

    // Availability check
    boolean isRoomAvailable(String roomId);

    RoomResponse uploadImagesFile(String id, List<MultipartFile> files);

}