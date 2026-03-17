package com.bean.hotel_management.room.service.impl;

import com.bean.hotel_management.common.exception.DuplicateResourceException;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.common.utils.ImageUtils;
import com.bean.hotel_management.review.model.Review;
import com.bean.hotel_management.review.model.ReviewStatus;
import com.bean.hotel_management.review.repository.IReviewRepository;
import com.bean.hotel_management.room.dto.request.CreateRoomRequest;
import com.bean.hotel_management.room.dto.request.RoomSearchRequest;
import com.bean.hotel_management.room.dto.request.UpdateRoomRequest;
import com.bean.hotel_management.room.dto.response.RoomResponse;
import com.bean.hotel_management.room.dto.response.RoomStatistics;
import com.bean.hotel_management.room.dto.response.RoomTypeStats;
import com.bean.hotel_management.room.mapper.RoomMapper;
import com.bean.hotel_management.room.model.*;
import com.bean.hotel_management.room.repository.IRoomRepository;
import com.bean.hotel_management.room.service.IRoomService;
import com.bean.hotel_management.room.specification.RoomSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements IRoomService {

    private final IRoomRepository iRoomRepository;
    private final IReviewRepository iReviewRepository;
    private final RoomMapper roomMapper;
    private final RoomSpecification roomSpecification;
    private final ImageUtils imageUtils;

    private static final String ROOM_IMAGE_FOLDER = "/rooms";


    @Override
    @Transactional
    public RoomResponse createRoom(String adminEmail, CreateRoomRequest request) {
        log.info("Creating room {} by {}", request.getRoomNumber(), adminEmail);

        request.validate();
        validateRoomNumberUnique(request.getRoomNumber());

        List<String> imageUrls = imageUtils.uploadListImages(request.getImageFiles(), ROOM_IMAGE_FOLDER);
        String thumbnailUrl = imageUtils.uploadImageWithFallback(
                request.getThumbnailImage(),
                imageUrls,
                ROOM_IMAGE_FOLDER
        );

        Room room = roomMapper.toEntity(request, adminEmail, imageUrls, thumbnailUrl);

        Room savedRoom = iRoomRepository.save(room);
        log.info("Room created successfully: {}", savedRoom.getRoomNumber());

        return roomMapper.toResponse(savedRoom);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(String roomId, UpdateRoomRequest request) {
        log.info("Updating room: {}", roomId);

        Room room = findRoomById(roomId);

        room.updateBasicFields(request);

        List<String> oldImagesToDelete = new ArrayList<>();

        // Danh sách ảnh cũ hiện tại trên server
        List<String> currentImages = room.getImages() != null ? new ArrayList<>(room.getImages()) : new ArrayList<>();
        String currentThumbnail = room.getThumbnailImage();

        // Xác định ảnh cũ nào bị xóa (có trong DB nhưng không có trong keepImageUrls)
        List<String> keepImageUrls = request.getKeepImageUrls() != null ? request.getKeepImageUrls() : new ArrayList<>();
        for (String oldUrl : currentImages) {
            if (!keepImageUrls.contains(oldUrl)) {
                oldImagesToDelete.add(oldUrl);
            }
        }
        // Xóa thumbnail cũ nếu không còn được giữ
        if (currentThumbnail != null && !keepImageUrls.contains(currentThumbnail)
                && !currentImages.contains(currentThumbnail)) {
            oldImagesToDelete.add(currentThumbnail);
        }

        // Upload ảnh mới (nếu có) và merge với ảnh cũ còn giữ
        List<String> mergedImageUrls = new ArrayList<>(keepImageUrls);
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<String> newImageUrls = imageUtils.uploadListImages(request.getImages(), ROOM_IMAGE_FOLDER);
            mergedImageUrls.addAll(newImageUrls);
        }

        // Cập nhật danh sách ảnh nếu có thay đổi
        if (!mergedImageUrls.isEmpty()) {
            room.updateImages(mergedImageUrls);
        } else if (!keepImageUrls.isEmpty()) {
            room.updateImages(keepImageUrls);
        }

        // Handle thumbnail: ưu tiên file mới upload, sau đó dùng ảnh đầu tiên trong merged list
        if (request.getThumbnailImage() != null && !request.getThumbnailImage().isEmpty()) {
            String newThumbnailUrl = imageUtils.uploadImage(request.getThumbnailImage(), ROOM_IMAGE_FOLDER);
            if (newThumbnailUrl != null) {
                room.updateThumbnail(newThumbnailUrl);
            }
        } else if (!mergedImageUrls.isEmpty()) {
            // Thumbnail = ảnh đầu tiên trong danh sách merged
            room.updateThumbnail(mergedImageUrls.get(0));
        }

        // Xóa ảnh cũ bị loại khỏi Cloudinary
        if (!oldImagesToDelete.isEmpty()) {
            imageUtils.deleteMultipleImages(oldImagesToDelete);
            log.info("Deleted {} old images from Cloudinary", oldImagesToDelete.size());
        }

        Room updatedRoom = iRoomRepository.save(room);
        log.info("Room updated successfully: {}", updatedRoom.getRoomNumber());

        return roomMapper.toResponse(updatedRoom);
    }


    @Override
    @Transactional
    public void deleteRoom(String roomId) {
        log.info("Deleting room: {}", roomId);

        Room room = findRoomById(roomId);

        imageUtils.deleteAllRoomImages(room.getImages(), room.getThumbnailImage());

        room.setIsActive(false);
        room.setStatus(RoomStatus.OUT_OF_SERVICE);
        room.setUpdatedDate(LocalDateTime.now());

        iRoomRepository.save(room);
        log.info("Room soft deleted with images cleaned: {}", room.getRoomNumber());
    }


    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(String roomId) {
        Room room = findRoomById(roomId);

        List<String> approvedReviewIds = filterApprovedReviews(room.getReviewIds());
        room.setReviewIds(approvedReviewIds);

        return roomMapper.toResponse(room, true);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomByRoomNumber(String roomNumber) {
        Room room = iRoomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phòng số " + roomNumber));
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> getAllRooms(int page, int size, String sortBy, String sortOrder, boolean includeReviews) {
        Pageable pageable = createPageable(page, size, sortBy, sortOrder);
        Page<Room> roomPage = iRoomRepository.findAll(pageable);
        return roomPage.map(room -> roomMapper.toResponse(room, includeReviews));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> searchRooms(RoomSearchRequest request) {
        Pageable pageable = createPageableFromRequest(request);

        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            return iRoomRepository.searchRooms(request.getKeyword(), pageable)
                    .map(roomMapper::toResponse);
        }

        List<Room> filteredRooms = iRoomRepository.findAll().stream()
                .filter(roomSpecification.createPredicate(request))
                .collect(Collectors.toList());

        return createPageFromList(filteredRooms, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getFeaturedRooms() {
        return iRoomRepository.findByIsFeaturedTrue().stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms() {
        return iRoomRepository.findByStatusAndIsActiveTrue(RoomStatus.AVAILABLE).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByType(RoomType type) {
        return iRoomRepository.findByTypeAndIsActiveTrue(type).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByStatus(RoomStatus status) {
        return iRoomRepository.findByStatusAndIsActiveTrue(status).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByFloor(Integer floor) {
        return iRoomRepository.findByFloor(floor).stream()
                .filter(Room::getIsActive)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByPriceRange(Double minPrice, Double maxPrice) {
        return iRoomRepository.findByPricePerNightBetween(minPrice, maxPrice).stream()
                .filter(Room::getIsActive)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByOccupancy(Integer minOccupancy) {
        return iRoomRepository.findByMaxOccupancyGreaterThanEqual(minOccupancy).stream()
                .filter(Room::getIsActive)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public RoomResponse updateRoomStatus(String roomId, RoomStatus status) {
        Room room = findRoomById(roomId);
        room.setStatus(status);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = iRoomRepository.save(room);
        log.info("Room {} status updated to {}", room.getRoomNumber(), status);

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse markAsAvailable(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.AVAILABLE);
    }

    @Override
    @Transactional
    public RoomResponse markAsOccupied(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.OCCUPIED);
    }

    @Override
    @Transactional
    public RoomResponse markAsMaintenance(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.MAINTENANCE);
    }

    @Override
    @Transactional
    public RoomResponse markAsCleaning(String roomId) {
        return updateRoomStatus(roomId, RoomStatus.CLEANING);
    }


    @Override
    @Transactional
    public RoomResponse toggleFeatured(String roomId) {
        Room room = findRoomById(roomId);
        room.setIsFeatured(!room.getIsFeatured());
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = iRoomRepository.save(room);
        log.info("Room {} featured status: {}", room.getRoomNumber(), room.getIsFeatured());

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse toggleActive(String roomId) {
        Room room = findRoomById(roomId);
        room.setIsActive(!room.getIsActive());

        if (!room.getIsActive()) {
            room.setStatus(RoomStatus.OUT_OF_SERVICE);
        }

        room.setUpdatedDate(LocalDateTime.now());
        Room updatedRoom = iRoomRepository.save(room);

        log.info("Room {} active status: {}", room.getRoomNumber(), room.getIsActive());
        return roomMapper.toResponse(updatedRoom);
    }


    @Override
    @Transactional
    public RoomResponse uploadImagesFile(String roomId, List<MultipartFile> files) {
        Room room = findRoomById(roomId);

        // Upload ảnh mới
        List<String> uploadedUrls = imageUtils.uploadListImages(files, ROOM_IMAGE_FOLDER);

        if (!uploadedUrls.isEmpty()) {
            if (room.getImages() == null) {
                room.setImages(new ArrayList<>());
            }
            room.getImages().addAll(uploadedUrls);

            // Set thumbnail nếu chưa có
            if (room.getThumbnailImage() == null) {
                room.setThumbnailImage(uploadedUrls.get(0));
            }

            room.setUpdatedDate(LocalDateTime.now());
            room = iRoomRepository.save(room);
            log.info("Added {} images to room {}", uploadedUrls.size(), room.getRoomNumber());
        }

        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse removeImage(String roomId, String imageUrl) {
        Room room = findRoomById(roomId);

        // Validate: không cho xóa nếu chỉ còn 1 ảnh
        if (room.getImages() != null && room.getImages().size() <= 1) {
            throw new IllegalStateException("Không thể xóa ảnh cuối cùng");
        }

        // Xóa ảnh
        boolean removedFromList = room.getImages() != null && room.getImages().remove(imageUrl);

        if (removedFromList) {
            // Xóa khỏi Cloudinary
            imageUtils.deleteImage(imageUrl);

            // Nếu xóa ảnh đang là thumbnail, set thumbnail mới
            if (imageUrl.equals(room.getThumbnailImage())) {
                if (!room.getImages().isEmpty()) {
                    room.setThumbnailImage(room.getImages().get(0));
                }
            }

            room.setUpdatedDate(LocalDateTime.now());
            room = iRoomRepository.save(room);
            log.info("Removed image from room {}", room.getRoomNumber());
        }

        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse setThumbnail(String roomId, String imageUrl) {
        Room room = findRoomById(roomId);

        if (room.getImages() == null || !room.getImages().contains(imageUrl)) {
            throw new IllegalArgumentException("URL ảnh không hợp lệ");
        }

        room.setThumbnailImage(imageUrl);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = iRoomRepository.save(room);
        log.info("Set thumbnail for room {}", room.getRoomNumber());

        return roomMapper.toResponse(updatedRoom);
    }


    @Override
    @Transactional
    public RoomResponse addAmenities(String roomId, List<String> amenities) {
        Room room = findRoomById(roomId);

        if (room.getAmenities() == null) {
            room.setAmenities(new ArrayList<>());
        }

        // Tránh trùng lặp
        amenities.stream()
                .filter(amenity -> !room.getAmenities().contains(amenity))
                .forEach(room.getAmenities()::add);

        room.setUpdatedDate(LocalDateTime.now());
        Room updatedRoom = iRoomRepository.save(room);

        log.info("Added amenities to room {}", room.getRoomNumber());
        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse removeAmenity(String roomId, String amenity) {
        Room room = findRoomById(roomId);

        if (room.getAmenities() != null && room.getAmenities().remove(amenity)) {
            room.setUpdatedDate(LocalDateTime.now());
            iRoomRepository.save(room);
            log.info("Removed amenity from room {}", room.getRoomNumber());
        }

        return roomMapper.toResponse(room);
    }


    @Override
    @Transactional
    public RoomResponse updatePrice(String roomId, Double newPrice) {
        Room room = findRoomById(roomId);
        room.setPricePerNight(newPrice);
        room.setUpdatedDate(LocalDateTime.now());

        Room updatedRoom = iRoomRepository.save(room);
        log.info("Updated price for room {} to {}", room.getRoomNumber(), newPrice);

        return roomMapper.toResponse(updatedRoom);
    }


    @Override
    @Transactional(readOnly = true)
    public RoomStatistics getRoomStatistics() {
        List<Room> activeRooms = iRoomRepository.findByIsActiveTrue();

        return RoomStatistics.builder()
                .totalRooms(activeRooms.size())
                .availableRooms(countRoomsByStatusInList(activeRooms, RoomStatus.AVAILABLE))
                .occupiedRooms(countRoomsByStatusInList(activeRooms, RoomStatus.OCCUPIED))
                .maintenanceRooms(countRoomsByStatusInList(activeRooms, RoomStatus.MAINTENANCE))
                .cleaningRooms(countRoomsByStatusInList(activeRooms, RoomStatus.CLEANING))
                .averagePrice(calculateAveragePrice(activeRooms))
                .highestPrice(findMaxPrice(activeRooms))
                .lowestPrice(findMinPrice(activeRooms))
                .averageRating(calculateAverageRating(activeRooms))
                .totalBookings(calculateTotalBookings(activeRooms))
                .roomTypeStats(generateRoomTypeStats(activeRooms))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Long countRoomsByStatus(RoomStatus status) {
        return iRoomRepository.countByStatusAndIsActiveTrue(status);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countRoomsByType(RoomType type) {
        return iRoomRepository.countByType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAveragePrice() {
        return iRoomRepository.findByIsActiveTrue().stream()
                .mapToDouble(Room::getPricePerNight)
                .average()
                .orElse(0.0);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRoomAvailable(String roomId) {
        Room room = findRoomById(roomId);
        return room.getIsActive() && room.getStatus() == RoomStatus.AVAILABLE;
    }


    private Room findRoomById(String roomId) {
        return iRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phòng với ID: " + roomId));
    }

    private void validateRoomNumberUnique(String roomNumber) {
        if (iRoomRepository.existsByRoomNumber(roomNumber)) {
            throw new DuplicateResourceException("Số phòng " + roomNumber + " đã tồn tại");
        }
    }

    private List<String> filterApprovedReviews(List<String> reviewIds) {
        if (reviewIds == null || reviewIds.isEmpty()) {
            return new ArrayList<>();
        }

        return reviewIds.stream()
                .map(reviewId -> {
                    try {
                        return iReviewRepository.findById(reviewId).orElse(null);
                    } catch (Exception e) {
                        log.error("Error loading review {}: {}", reviewId, e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .filter(review -> review.getStatus() == ReviewStatus.APPROVED)
                .map(Review::getId)
                .collect(Collectors.toList());
    }

    private Page<RoomResponse> createPageFromList(List<Room> rooms, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), rooms.size());

        List<RoomResponse> pageContent = rooms.subList(start, end).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, rooms.size());
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return PageRequest.of(page, size, sort);
    }

    private Pageable createPageableFromRequest(RoomSearchRequest request) {
        int page = Optional.ofNullable(request.getPage()).orElse(0);
        int size = Optional.ofNullable(request.getSize()).orElse(10);
        String sortBy = Optional.ofNullable(request.getSortBy()).orElse("createdDate");
        String sortOrder = Optional.ofNullable(request.getSortOrder()).orElse("desc");

        return createPageable(page, size, sortBy, sortOrder);
    }

    private Integer countRoomsByStatusInList(List<Room> rooms, RoomStatus status) {
        return (int) rooms.stream().filter(r -> r.getStatus() == status).count();
    }

    private Double calculateAveragePrice(List<Room> rooms) {
        return rooms.stream().mapToDouble(Room::getPricePerNight).average().orElse(0.0);
    }

    private Double findMaxPrice(List<Room> rooms) {
        return rooms.stream().mapToDouble(Room::getPricePerNight).max().orElse(0.0);
    }

    private Double findMinPrice(List<Room> rooms) {
        return rooms.stream().mapToDouble(Room::getPricePerNight).min().orElse(0.0);
    }

    private Double calculateAverageRating(List<Room> rooms) {
        return rooms.stream().mapToDouble(Room::getAverageRating).average().orElse(0.0);
    }

    private Integer calculateTotalBookings(List<Room> rooms) {
        return rooms.stream().mapToInt(Room::getTotalBookings).sum();
    }

    private List<RoomTypeStats> generateRoomTypeStats(List<Room> rooms) {
        return Arrays.stream(RoomType.values())
                .map(type -> {
                    List<Room> roomsByType = rooms.stream()
                            .filter(r -> r.getType() == type)
                            .collect(Collectors.toList());

                    if (roomsByType.isEmpty()) return null;

                    return RoomTypeStats.builder()
                            .type(type)
                            .count(roomsByType.size())
                            .available((int) roomsByType.stream()
                                    .filter(r -> r.getStatus() == RoomStatus.AVAILABLE)
                                    .count())
                            .averagePrice(calculateAveragePrice(roomsByType))
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}