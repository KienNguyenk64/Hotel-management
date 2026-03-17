package com.bean.hotel_management.auth.exception;

import com.bean.hotel_management.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidOperationException extends BaseException {

    public InvalidOperationException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
