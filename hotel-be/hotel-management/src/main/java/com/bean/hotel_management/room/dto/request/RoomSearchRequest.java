package com.bean.hotel_management.room.dto.request;

import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.model.RoomType;
import com.bean.hotel_management.room.model.RoomView;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomSearchRequest {

    private RoomType type;
    private RoomStatus status;
    private RoomView view;

    @Min(value = 0, message = "Giá tối thiểu phải >= 0")
    private Double minPrice;

    @Min(value = 0, message = "Giá tối đa phải >= 0")
    private Double maxPrice;

    @Min(value = 1, message = "Số người phải >= 1")
    private Integer minOccupancy;

    private Integer floor;
    private Boolean isFeatured;
    private Boolean allowSmoking;
    private Boolean hasBalcony;

    private String keyword; // Search in name, description

    private String sortBy; // price, rating, size, roomNumber
    private String sortOrder; // asc, desc

    @Min(value = 0, message = "Page phải >= 0")
    private Integer page;

    @Min(value = 1, message = "Size phải >= 1")
    @Max(value = 100, message = "Size tối đa 100")
    private Integer size;
}