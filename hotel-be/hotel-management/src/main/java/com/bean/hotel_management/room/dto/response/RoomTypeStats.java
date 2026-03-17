package com.bean.hotel_management.room.dto.response;

import com.bean.hotel_management.room.model.RoomType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeStats {
    private RoomType type;
    private Integer count;
    private Integer available;
    private Double averagePrice;
}