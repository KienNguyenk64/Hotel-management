package com.bean.hotel_management.room.dto.request;

import com.bean.hotel_management.room.model.RoomView;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoomRequest {

    @Size(min = 3, max = 100, message = "Tên phòng từ 3-100 ký tự")
    private String name;

    @Size(min = 10, max = 1000, message = "Mô tả từ 10-1000 ký tự")
    private String description;

    private Integer floor;

    @Min(value = 100000, message = "Giá phòng phải từ 100,000 VNĐ")
    @Max(value = 100000000, message = "Giá phòng tối đa 100,000,000 VNĐ")
    private Double pricePerNight;

    private RoomView view;

    private List<String> amenities;

    private List<MultipartFile> images;

    private MultipartFile thumbnailImage;

    // Danh sách URL ảnh cũ muốn GIỮ LẠI (không xóa)
    private List<String> keepImageUrls;

    private Boolean allowSmoking;

    private Boolean hasBalcony;

    private Boolean hasKitchen;

    private Boolean isFeatured;

    private String notes;
}