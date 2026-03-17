package com.bean.hotel_management.common.exception;

import org.springframework.http.HttpStatus;

public class ImageUploadException extends BaseException {

    public ImageUploadException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
}
