package com.bean.hotel_management.room.specification;

import com.bean.hotel_management.room.dto.request.RoomSearchRequest;
import com.bean.hotel_management.room.model.Room;
import org.springframework.stereotype.Component;

import java.util.function.Predicate;

@Component
public class RoomSpecification {

    public Predicate<Room> createPredicate(RoomSearchRequest request) {
        return room -> matchesAllCriteria(room, request);
    }


    private boolean matchesAllCriteria(Room room, RoomSearchRequest request) {
        return matchesType(room, request)
                && matchesStatus(room, request)
                && matchesView(room, request)
                && matchesPriceRange(room, request)
                && matchesOccupancy(room, request)
                && matchesFloor(room, request)
                && matchesFeatured(room, request)
                && matchesSmoking(room, request)
                && matchesBalcony(room, request);
    }

    private boolean matchesType(Room room, RoomSearchRequest request) {
        return request.getType() == null || room.getType() == request.getType();
    }

    private boolean matchesStatus(Room room, RoomSearchRequest request) {
        return request.getStatus() == null || room.getStatus() == request.getStatus();
    }

    private boolean matchesView(Room room, RoomSearchRequest request) {
        return request.getView() == null || room.getView() == request.getView();
    }

    private boolean matchesPriceRange(Room room, RoomSearchRequest request) {
        boolean matchesMin = request.getMinPrice() == null
                || room.getPricePerNight() >= request.getMinPrice();
        boolean matchesMax = request.getMaxPrice() == null
                || room.getPricePerNight() <= request.getMaxPrice();
        return matchesMin && matchesMax;
    }

    private boolean matchesOccupancy(Room room, RoomSearchRequest request) {
        return request.getMinOccupancy() == null
                || room.getMaxOccupancy() >= request.getMinOccupancy();
    }

    private boolean matchesFloor(Room room, RoomSearchRequest request) {
        return request.getFloor() == null
                || request.getFloor().equals(room.getFloor());
    }

    private boolean matchesFeatured(Room room, RoomSearchRequest request) {
        return request.getIsFeatured() == null
                || request.getIsFeatured().equals(room.getIsFeatured());
    }

    private boolean matchesSmoking(Room room, RoomSearchRequest request) {
        return request.getAllowSmoking() == null
                || request.getAllowSmoking().equals(room.getAllowSmoking());
    }

    private boolean matchesBalcony(Room room, RoomSearchRequest request) {
        return request.getHasBalcony() == null
                || request.getHasBalcony().equals(room.getHasBalcony());
    }
}