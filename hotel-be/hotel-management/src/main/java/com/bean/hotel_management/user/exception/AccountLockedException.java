package com.bean.hotel_management.user.exception;

import com.bean.hotel_management.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class AccountLockedException extends BaseException {
    public AccountLockedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
