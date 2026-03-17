package com.bean.hotel_management.user.utils;

import com.bean.hotel_management.common.exception.DuplicateResourceException;
import com.bean.hotel_management.common.exception.InvalidCredentialsException;
import com.bean.hotel_management.user.exception.AccountLockedException;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserUtils {

    private final IUserRepository iUserRepository;

    public void validateUserStatus(User user) {
        if (user.isLocked()) {
            throw new AccountLockedException("Tài khoản của bạn đã bị khóa");
        }

        if (!user.isActive()) {
            throw new InvalidCredentialsException(
                    "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản");
        }
    }

    public void validateDuplicateUser(String email, String username, String phoneNumber, String cccdNumber) {
        validateDuplicateEmail(email);
        validateDuplicateUsername(username);
        validateDuplicatePhoneNumber(phoneNumber);
        validateDuplicateCccdNumber(cccdNumber);
    }

    public void validateDuplicateEmail(String email) {
        if (iUserRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được sử dụng");
        }
    }

    public void validateDuplicateUsername(String username) {
        if (iUserRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Tên đăng nhập đã được sử dụng");
        }
    }

    public void validateDuplicatePhoneNumber(String phoneNumber) {
        if (iUserRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng");
        }
    }

    public void validateDuplicateCccdNumber(String cccdNumber) {
        if (iUserRepository.existsByCccdNumber(cccdNumber)) {
            throw new DuplicateResourceException("Số CCCD đã được sử dụng");
        }
    }
}
