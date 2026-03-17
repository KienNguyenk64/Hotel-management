package com.bean.hotel_management.common.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class BusinessException extends BaseException{

    public BusinessException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
