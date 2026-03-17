package com.bean.hotel_management.room.constants;

public final class RoomConstants {

    private RoomConstants() {
        throw new AssertionError("Cannot instantiate constants class");
    }

    // Validation constraints
    public static final class Validation {
        public static final int ROOM_NUMBER_MIN_LENGTH = 3;
        public static final int ROOM_NUMBER_MAX_LENGTH = 4;
        public static final String ROOM_NUMBER_PATTERN = "^[0-9]{3,4}$";

        public static final int NAME_MIN_LENGTH = 3;
        public static final int NAME_MAX_LENGTH = 100;

        public static final int DESCRIPTION_MIN_LENGTH = 10;
        public static final int DESCRIPTION_MAX_LENGTH = 1000;

        public static final double MIN_PRICE = 100_000;
        public static final double MAX_PRICE = 100_000_000;

        public static final int MIN_SIZE = 15;
        public static final int MAX_SIZE = 500;

        public static final int MIN_BED_COUNT = 1;
        public static final int MAX_BED_COUNT = 5;

        public static final int MIN_OCCUPANCY = 1;
        public static final int MAX_OCCUPANCY = 10;

        public static final int MIN_FLOOR = 1;
        public static final int MAX_FLOOR = 50;

        private Validation() {}
    }

    // Messages for operations

    public static final class Messages {
        // Success messages
        public static final String ROOM_CREATED = "Tạo phòng thành công";
        public static final String ROOM_UPDATED = "Cập nhật phòng thành công";
        public static final String ROOM_DELETED = "Xóa phòng thành công";
        public static final String ROOM_FOUND = "Lấy thông tin phòng thành công";
        public static final String ROOMS_FOUND = "Lấy danh sách phòng thành công";
        public static final String STATUS_UPDATED = "Cập nhật trạng thái phòng thành công";
        public static final String PRICE_UPDATED = "Cập nhật giá thành công";
        public static final String IMAGES_ADDED = "Thêm ảnh thành công";
        public static final String IMAGE_REMOVED = "Xóa ảnh thành công";
        public static final String AMENITIES_ADDED = "Thêm tiện nghi thành công";
        public static final String AMENITY_REMOVED = "Xóa tiện nghi thành công";
        public static final String ROOM_AVAILABLE = "Phòng còn trống";
        public static final String ROOM_UNAVAILABLE = "Phòng không khả dụng";

        // Error messages
        public static final String ROOM_NOT_FOUND = "Không tìm thấy phòng với ID: %s";
        public static final String ROOM_NUMBER_NOT_FOUND = "Không tìm thấy phòng số %s";
        public static final String ROOM_NUMBER_EXISTS = "Số phòng %s đã tồn tại";

        private Messages() {}
    }

    // Amenities constants
    public static final class Amenities {
        public static final String WIFI = "WiFi miễn phí";
        public static final String TV = "TV màn hình phẳng";
        public static final String AIR_CONDITIONER = "Điều hòa nhiệt độ";
        public static final String MINIBAR = "Minibar";
        public static final String SAFE = "Két an toàn";
        public static final String HAIR_DRYER = "Máy sấy tóc";
        public static final String BATHTUB = "Bồn tắm";
        public static final String SHOWER = "Vòi sen";
        public static final String COFFEE_MAKER = "Máy pha cà phê";
        public static final String IRON = "Bàn là";
        public static final String BALCONY = "Ban công";
        public static final String WORK_DESK = "Bàn làm việc";
        public static final String TELEPHONE = "Điện thoại";
        public static final String SLIPPERS = "Dép đi trong phòng";
        public static final String BATHROBE = "Áo choàng tắm";
        public static final String TOILETRIES = "Đồ vệ sinh cá nhân";
        public static final String ROOM_SERVICE = "Dịch vụ phòng 24/7";
        public static final String SOUNDPROOF = "Cách âm";

        private Amenities() {}
    }
}