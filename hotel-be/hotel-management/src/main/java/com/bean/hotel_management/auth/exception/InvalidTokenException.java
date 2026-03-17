package com.bean.hotel_management.auth.exception;

import com.bean.hotel_management.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InvalidTokenException extends BaseException {

    public InvalidTokenException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
