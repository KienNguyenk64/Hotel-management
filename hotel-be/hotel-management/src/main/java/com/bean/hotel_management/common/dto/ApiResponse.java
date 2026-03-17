package com.bean.hotel_management.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
    private String status;      // "success" or "fail"
    private String message;
    private Object data;

    public static ApiResponse success(String message, Object data) {
        return new ApiResponse("success", message, data);
    }

    public static ApiResponse fail(String message) {
        return new ApiResponse("fail", message, null);
    }

    public static ApiResponse fail(String message, Object errors) {
        return new ApiResponse("fail", message, errors);
    }
}