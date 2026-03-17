package com.bean.hotel_management.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterUserRequest {
    @Min(0)
    private int page;
    @Positive @Max(100)
    private Integer size;
    private String sortBy = "createdDate";
    private String sortOrder = "desc";
    private String keyword;
    private String role = "user";
    private Boolean isActive;
    private Boolean isLocked;

    public Integer getSize() {
        return size == null ? 10 : size;
    }

}
