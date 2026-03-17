package com.bean.hotel_management.room.dto.request;

import com.bean.hotel_management.room.model.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomRequest {


    @NotBlank(message = "Số phòng không được để trống")
    @Pattern(regexp = "^[0-9]{3,4}$", message = "Số phòng phải là 3-4 chữ số")
    private String roomNumber;

    @NotBlank(message = "Tên phòng không được để trống")
    @Size(min = 3, max = 100, message = "Tên phòng từ 3-100 ký tự")
    private String name;

    @NotNull(message = "Loại phòng không được để trống")
    private RoomType type;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(min = 10, max = 1000, message = "Mô tả từ 10-1000 ký tự")
    private String description;


    @NotNull(message = "Giá phòng không được để trống")
    @Min(value = 100000, message = "Giá phòng phải từ 100,000 VNĐ")
    @Max(value = 100000000, message = "Giá phòng tối đa 100,000,000 VNĐ")
    private Double pricePerNight;

    @NotNull(message = "Diện tích không được để trống")
    @Min(value = 15, message = "Diện tích tối thiểu 15m²")
    @Max(value = 500, message = "Diện tích tối đa 500m²")
    private Integer size;

    @NotNull(message = "Số lượng giường không được để trống")
    @Min(value = 1, message = "Tối thiểu 1 giường")
    @Max(value = 5, message = "Tối đa 5 giường")
    private Integer bedCount;

    @NotNull(message = "Loại giường không được để trống")
    private BedType bedType;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu 1 người")
    @Max(value = 10, message = "Sức chứa tối đa 10 người")
    private Integer maxOccupancy;


    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Tầng tối thiểu là 1")
    @Max(value = 50, message = "Tầng tối đa là 50")
    private Integer floor;

    private RoomView view;


    @NotEmpty(message = "Phải có ít nhất 1 tiện nghi")
    private List<String> amenities;

    @Builder.Default
    private Boolean allowSmoking = false;

    @Builder.Default
    private Boolean hasBathroom = true;

    @Builder.Default
    private Boolean hasBalcony = false;

    @Builder.Default
    private Boolean hasKitchen = false;


    @NotEmpty(message = "Phải upload ít nhất 1 ảnh")
    private List<MultipartFile> imageFiles;

    private MultipartFile thumbnailImage;


    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String notes;


    public void validate() {
        validatePriceRange();
        validateOccupancy();
        validateImages();
    }

    private void validatePriceRange() {
        if (pricePerNight != null && pricePerNight < 100000) {
            throw new IllegalArgumentException("Giá phòng phải từ 100,000 VNĐ");
        }
    }

    private void validateOccupancy() {
        if (maxOccupancy != null && bedCount != null && maxOccupancy > bedCount * 2) {
            throw new IllegalArgumentException(
                    "Sức chứa không hợp lý với số giường (tối đa " + (bedCount * 2) + " người)"
            );
        }
    }

    private void validateImages() {
        if ((imageFiles == null || imageFiles.isEmpty()) &&
                (thumbnailImage == null || thumbnailImage.isEmpty())) {
            throw new IllegalArgumentException("Phải upload ít nhất 1 ảnh");
        }
    }


    public boolean hasImages() {
        return (imageFiles != null && !imageFiles.isEmpty()) ||
                (thumbnailImage != null && !thumbnailImage.isEmpty());
    }

    public int getTotalImages() {
        int count = 0;
        if (imageFiles != null) count += imageFiles.size();
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) count += 1;
        return count;
    }
}