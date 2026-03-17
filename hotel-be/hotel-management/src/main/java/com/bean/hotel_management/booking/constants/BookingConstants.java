package com.bean.hotel_management.booking.constants;


public final class BookingConstants {

    private BookingConstants() {
        throw new AssertionError("Cannot instantiate constants class");
    }

    // Pricing
    public static final class Pricing {
        public static final double TAX_RATE = 0.10; // 10% VAT
        public static final double SERVICE_CHARGE_RATE = 0.05; // 5% service charge

        private Pricing() {}
    }

    // Cancellation Policy
    public static final class Cancellation {
        public static final int FREE_CANCELLATION_HOURS = 24; // Free cancel before 24h
        public static final double CANCELLATION_FEE_RATE = 0.20; // 20% cancellation fee

        private Cancellation() {}
    }

    // Booking Number
    public static final class BookingNumber {
        public static final String PREFIX = "BK";
        public static final int SEQUENCE_LENGTH = 8;

        private BookingNumber() {}
    }

    // Check-In and Check-Out
    public static final class CheckInOut {
        public static final int CHECK_IN_HOUR = 14; // 2 PM
        public static final int CHECK_OUT_HOUR = 12; // 12 PM
        public static final int EARLY_CHECK_IN_FEE = 100_000; // 100k VND
        public static final int LATE_CHECK_OUT_FEE = 100_000; // 100k VND

        private CheckInOut() {}
    }

    // Validation
    public static final class Validation {
        public static final int MIN_NIGHTS = 1;
        public static final int MAX_NIGHTS = 30;
        public static final int MAX_ADVANCE_BOOKING_DAYS = 365; // 1 year

        private Validation() {}
    }

    // Messages
    public static final class Messages {

        // Success
        public static final String BOOKING_CREATED = "Đặt phòng thành công";
        public static final String BOOKING_UPDATED = "Cập nhật đặt phòng thành công";
        public static final String BOOKING_CANCELLED = "Hủy đặt phòng thành công";
        public static final String BOOKING_CONFIRMED = "Xác nhận đặt phòng thành công";
        public static final String CHECK_IN_SUCCESS = "Check-in thành công";
        public static final String CHECK_OUT_SUCCESS = "Check-out thành công";
        public static final String PAYMENT_SUCCESS = "Thanh toán thành công";

        // Error
        public static final String BOOKING_NOT_FOUND = "Không tìm thấy đặt phòng với ID: %s";
        public static final String BOOKING_NUMBER_NOT_FOUND = "Không tìm thấy đặt phòng với mã: %s";
        public static final String ROOM_NOT_AVAILABLE = "Phòng không khả dụng trong thời gian này";
        public static final String INVALID_DATE_RANGE = "Ngày check-out phải sau ngày check-in";
        public static final String PAST_CHECK_IN_DATE = "Ngày check-in không thể là quá khứ";
        public static final String CANNOT_CANCEL = "Không thể hủy đặt phòng này";
        public static final String CANNOT_CHECK_IN = "Chưa đến thời gian check-in";
        public static final String CANNOT_CHECK_OUT = "Chưa check-in hoặc đã check-out";
        public static final String ALREADY_PAID = "Đặt phòng đã được thanh toán";
        public static final String EXCEEDS_MAX_OCCUPANCY = "Số lượng khách vượt quá sức chứa của phòng";

        private Messages() {}
    }

    // Services
    public static final class Services {
        public static final String EARLY_CHECK_IN = "Check-in sớm";
        public static final String LATE_CHECK_OUT = "Check-out muộn";
        public static final String AIRPORT_TRANSFER = "Đưa đón sân bay";
        public static final String BREAKFAST = "Bữa sáng";
        public static final String EXTRA_BED = "Giường phụ";
        public static final String BABY_COT = "Nôi cho em bé";

        private Services() {}
    }
}