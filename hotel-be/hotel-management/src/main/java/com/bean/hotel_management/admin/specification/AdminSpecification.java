package com.bean.hotel_management.admin.specification;

import com.bean.hotel_management.admin.dto.FilterUserRequest;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import org.springframework.stereotype.Component;

import java.util.function.Predicate;

@Component
public class AdminSpecification {

    public Predicate<User> createPredicate(FilterUserRequest request) {
        return user -> matchesAllCriteria(user, request);
    }

    private boolean matchesAllCriteria(User user, FilterUserRequest request) {
        if (user.getRole() == Role.ADMIN) {
            return false;
        }

        if (request == null) {
            return true;
        }

        return matchesRole(user, request)
                && matchesSearchTerm(user, request)
                && matchesActiveStatus(user, request)
                && matchesLockedStatus(user, request);
    }

    private boolean matchesRole(User user, FilterUserRequest request) {
        String role = request.getRole();
        if (role == null || role.isEmpty() || role.equalsIgnoreCase("all")) {
            return true;
        }
        return user.getRole() != null
                && user.getRole().name().equalsIgnoreCase(role);
    }


    private boolean matchesSearchTerm(User user, FilterUserRequest request) {
        String keyword = request.getKeyword();
        if (keyword == null || keyword.isEmpty()) {
            return true;
        }

        String lowerCaseTerm = keyword.toLowerCase();
        return (user.getFullName() != null && user.getFullName().toLowerCase().contains(lowerCaseTerm))
                || (user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerCaseTerm))
                || (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowerCaseTerm))
                || (user.getCccdNumber() != null && user.getCccdNumber().toLowerCase().contains(lowerCaseTerm))
                || (user.getPhoneNumber() != null && user.getPhoneNumber().toLowerCase().contains(lowerCaseTerm));
    }

    private boolean matchesActiveStatus(User user, FilterUserRequest request) {
        Boolean active = request.getIsActive();
        if (active == null) {
            return true;
        }
        return user.isActive() == active;
    }

    private boolean matchesLockedStatus(User user, FilterUserRequest request) {
        Boolean locked = request.getIsLocked();
        if (locked == null) {
            return true;
        }
        return user.isLocked() == locked;
    }
}