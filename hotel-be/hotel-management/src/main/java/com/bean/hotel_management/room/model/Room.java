package com.bean.hotel_management.room.model;

import com.bean.hotel_management.room.dto.request.UpdateRoomRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Document(collection = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    private String id;

    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    @NotBlank(message = "Tên phòng không được để trống")
    private String name;

    @NotNull(message = "Loại phòng không được để trống")
    private RoomType type;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotNull(message = "Giá phòng không được để trống")
    @Min(value = 0, message = "Giá phòng phải lớn hơn 0")
    private Double pricePerNight;

    @NotNull(message = "Diện tích không được để trống")
    @Min(value = 1, message = "Diện tích phải lớn hơn 0")
    private Integer size;

    @NotNull(message = "Số lượng giường không được để trống")
    @Min(value = 1, message = "Số lượng giường phải lớn hơn 0")
    private Integer bedCount;

    private BedType bedType;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
    private Integer maxOccupancy;

    private Integer floor;
    private RoomView view;
    private List<String> amenities;
    private List<String> images;
    private String thumbnailImage;

    @NotNull(message = "Trạng thái không được để trống")
    private RoomStatus status;

    private Boolean isActive;
    private Boolean isFeatured;
    private Boolean allowSmoking;
    private Boolean hasBathroom;
    private Boolean hasBalcony;
    private Boolean hasKitchen;

    @Builder.Default
    private List<String> reviewIds = new ArrayList<>();
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalBookings;
    private LocalDateTime lastBookedDate;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String createdBy;
    private String notes;

    /**
     * Update room với data từ request (không bao gồm images)
     * @return List các URL ảnh cũ cần xóa
     */
    public List<String> updateBasicFields(UpdateRoomRequest request) {
        List<String> oldImagesToDelete = new ArrayList<>();

        // Update basic fields
        Optional.ofNullable(request.getName()).ifPresent(this::setName);
        Optional.ofNullable(request.getDescription()).ifPresent(this::setDescription);
        Optional.ofNullable(request.getPricePerNight()).ifPresent(this::setPricePerNight);
        Optional.ofNullable(request.getFloor()).ifPresent(this::setFloor);
        Optional.ofNullable(request.getView()).ifPresent(this::setView);
        Optional.ofNullable(request.getAllowSmoking()).ifPresent(this::setAllowSmoking);
        Optional.ofNullable(request.getHasBalcony()).ifPresent(this::setHasBalcony);
        Optional.ofNullable(request.getHasKitchen()).ifPresent(this::setHasKitchen);
        Optional.ofNullable(request.getIsFeatured()).ifPresent(this::setIsFeatured);
        Optional.ofNullable(request.getNotes()).ifPresent(this::setNotes);

        // Update amenities
        if (request.getAmenities() != null) {
            this.amenities = request.getAmenities();
        }

        this.updatedDate = LocalDateTime.now();

        return oldImagesToDelete;
    }

    /**
     * Cập nhật images và thu thập ảnh cũ cần xóa
     * @param newImageUrls Danh sách URL ảnh mới
     * @return List URL ảnh cũ cần xóa khỏi Cloudinary
     */
    public List<String> updateImages(List<String> newImageUrls) {
        if (newImageUrls == null || newImageUrls.isEmpty()) {
            return new ArrayList<>();
        }

        // Lưu lại ảnh cũ để xóa
        List<String> oldImages = new ArrayList<>();
        if (this.images != null) {
            oldImages.addAll(this.images);
        }

        // Set ảnh mới
        this.images = newImageUrls;

        // Nếu thumbnail cũ không có trong danh sách ảnh mới, thêm vào list cần xóa
        if (this.thumbnailImage != null && !newImageUrls.contains(this.thumbnailImage)) {
            oldImages.add(this.thumbnailImage);
        }

        // Set thumbnail mới là ảnh đầu tiên
        this.thumbnailImage = newImageUrls.get(0);

        return oldImages;
    }

    /**
     * Cập nhật thumbnail và trả về thumbnail cũ nếu cần xóa
     * @param newThumbnailUrl URL thumbnail mới
     * @return URL thumbnail cũ cần xóa (null nếu thumbnail cũ nằm trong images)
     */
    public String updateThumbnail(String newThumbnailUrl) {
        String oldThumbnail = this.thumbnailImage;
        this.thumbnailImage = newThumbnailUrl;

        // Thêm thumbnail mới vào đầu list images nếu chưa có
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        if (!this.images.contains(newThumbnailUrl)) {
            this.images.add(0, newThumbnailUrl);
        }

        // Chỉ trả về thumbnail cũ để xóa nếu nó không nằm trong images
        if (oldThumbnail != null && !this.images.contains(oldThumbnail)) {
            return oldThumbnail;
        }

        return null;
    }
}