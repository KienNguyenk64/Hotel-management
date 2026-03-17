package com.bean.hotel_management.auth.exception;

import com.bean.hotel_management.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class OAuthProviderException extends BaseException {

    public OAuthProviderException(String message) {
        super(HttpStatus.BAD_GATEWAY, message);
    }
}
