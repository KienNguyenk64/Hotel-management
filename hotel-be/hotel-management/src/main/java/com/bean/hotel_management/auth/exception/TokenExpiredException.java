package com.bean.hotel_management.auth.exception;

import com.bean.hotel_management.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class TokenExpiredException extends BaseException {

    public TokenExpiredException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
