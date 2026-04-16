package com.bean.hotel_management.dashboard.service.impl;

import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.booking.model.Booking;
import com.bean.hotel_management.booking.model.BookingPaymentStatus;
import com.bean.hotel_management.booking.model.BookingStatus;
import com.bean.hotel_management.booking.repository.IBookingRepository;
import com.bean.hotel_management.common.exception.ResourceNotFoundException;
import com.bean.hotel_management.dashboard.dto.*;
import com.bean.hotel_management.dashboard.service.IDashboardService;
import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.model.RoomType;
import com.bean.hotel_management.room.repository.IRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements IDashboardService {

    private final IBookingRepository bookingRepository;
    private final IRoomRepository roomRepository;
    private final IUserRepository userRepository;


    @Override
    public AdminDashboardResponse getAdminDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        return getAdminDashboard(DashboardFilterRequest.builder()
                .period("MONTH")
                .startDate(monthStart)
                .endDate(today)
                .build());
    }

    @Override
    public AdminDashboardResponse getAdminDashboard(DashboardFilterRequest filter) {
        LocalDate startDate = filter.getStartDate() != null
                ? filter.getStartDate() : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = filter.getEndDate() != null
                ? filter.getEndDate() : LocalDate.now();

        return AdminDashboardResponse.builder()
                .overviewStats(getOverviewStats())
                .bookingStats(getBookingStats(startDate, endDate))
                .roomStats(getRoomStats())
                .revenueStats(getRevenueStats(startDate, endDate))
                .recentBookings(getRecentBookings(10))
                .todayActivities(getTodayActivities())
                .revenueChart(getRevenueChart(startDate, endDate, "DAY"))
                .bookingTrendChart(getBookingTrendChart(startDate, endDate, "DAY"))
                .roomOccupancyChart(getRoomOccupancyChart(startDate, endDate))
                .build();
    }

    @Override
    public OverviewStats getOverviewStats() {
        List<Room> allRooms = roomRepository.findByIsActiveTrue();
        LocalDate today = LocalDate.now();

        int totalRooms = allRooms.size();
        Integer availableRooms = (int) allRooms.stream()
                .filter(r -> r.getStatus() == RoomStatus.AVAILABLE)
                .count();
        Integer occupiedRooms = (int) allRooms.stream()
                .filter(r -> r.getStatus() == RoomStatus.OCCUPIED)
                .count();

        double occupancyRate = totalRooms > 0
                ? (occupiedRooms.doubleValue() / totalRooms) * 100
                : 0.0;

        List<Booking> todayCheckIns = bookingRepository.findTodayCheckIns(today);
        List<Booking> todayCheckOuts = bookingRepository.findTodayCheckOuts(today);
        Long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);

        Double todayRevenue = bookingRepository.findByCheckInDate(today).stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        return OverviewStats.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .todayCheckIns(todayCheckIns.size())
                .todayCheckOuts(todayCheckOuts.size())
                .pendingBookings(pendingBookings.intValue())
                .todayRevenue(todayRevenue)
                .build();
    }

    @Override
    public BookingStats getBookingStats(LocalDate startDate, LocalDate endDate) {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> periodBookings = filterBookingsByDateRange(allBookings, startDate, endDate);

        // Previous period for comparison
        long daysDiff = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDate prevStart = startDate.minusDays(daysDiff);
        LocalDate prevEnd = startDate.minusDays(1);
        List<Booking> prevPeriodBookings = filterBookingsByDateRange(allBookings, prevStart, prevEnd);

        Integer totalBookings = allBookings.size();
        Integer thisMonthBookings = periodBookings.size();
        Integer pendingBookings = countByStatus(periodBookings, BookingStatus.PENDING);
        Integer confirmedBookings = countByStatus(periodBookings, BookingStatus.CONFIRMED);
        Integer cancelledBookings = countByStatus(periodBookings, BookingStatus.CANCELLED);

        Double cancellationRate = thisMonthBookings > 0
                ? (cancelledBookings.doubleValue() / thisMonthBookings) * 100
                : 0.0;

        Double averageBookingValue = periodBookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .average()
                .orElse(0.0);

        Double averageStayDuration = periodBookings.stream()
                .mapToInt(Booking::getNumberOfNights)
                .average()
                .orElse(0.0);

        // Growth calculation
        Double bookingGrowthRate = prevPeriodBookings.size() > 0
                ? ((thisMonthBookings - prevPeriodBookings.size())
                / (double) prevPeriodBookings.size()) * 100
                : 0.0;

        return BookingStats.builder()
                .totalBookings(totalBookings)
                .thisMonthBookings(thisMonthBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .cancellationRate(Math.round(cancellationRate * 100.0) / 100.0)
                .averageBookingValue(Math.round(averageBookingValue * 100.0) / 100.0)
                .averageStayDuration(averageStayDuration.intValue())
                .bookingGrowthRate(Math.round(bookingGrowthRate * 100.0) / 100.0)
                .bookingGrowthCount(thisMonthBookings - prevPeriodBookings.size())
                .build();
    }

    @Override
    public RoomStats getRoomStats() {
        List<Room> allRooms = roomRepository.findByIsActiveTrue();

        Integer totalRooms = allRooms.size();
        Integer availableRooms = countRoomsByStatus(allRooms, RoomStatus.AVAILABLE);
        Integer occupiedRooms = countRoomsByStatus(allRooms, RoomStatus.OCCUPIED);
        Integer maintenanceRooms = countRoomsByStatus(allRooms, RoomStatus.MAINTENANCE);
        Integer cleaningRooms = countRoomsByStatus(allRooms, RoomStatus.CLEANING);

        Double occupancyRate = totalRooms > 0
                ? (occupiedRooms.doubleValue() / totalRooms) * 100
                : 0.0;

        Double averageRoomPrice = allRooms.stream()
                .mapToDouble(Room::getPricePerNight)
                .average()
                .orElse(0.0);

        // Find most booked room
        Room mostBookedRoom = allRooms.stream()
                .max(Comparator.comparing(Room::getTotalBookings))
                .orElse(null);

//  THÊM NULL CHECK
        String mostBookedRoomId = mostBookedRoom != null ? mostBookedRoom.getId() : null;
        String mostBookedRoomName = mostBookedRoom != null ? mostBookedRoom.getName() : null;

// Room type distribution
        List<RoomTypeDistribution> distribution = Arrays.stream(RoomType.values())
                .map(type -> {
                    List<Room> roomsOfType = allRooms.stream()
                            .filter(r -> r.getType() == type)
                            .collect(Collectors.toList());

                    if (roomsOfType.isEmpty()) return null;

                    int total = roomsOfType.size();
                    int available = (int) roomsOfType.stream()
                            .filter(r -> r.getStatus() == RoomStatus.AVAILABLE)
                            .count();
                    double typeOccupancy = total > 0
                            ? ((total - available) / (double) total) * 100
                            : 0.0;
                    double avgPrice = roomsOfType.stream()
                            .mapToDouble(Room::getPricePerNight)
                            .average()
                            .orElse(0.0);

                    return RoomTypeDistribution.builder()
                            .roomType(type.getVietnameseName())
                            .totalRooms(total)
                            .availableRooms(available)
                            .occupancyRate(Math.round(typeOccupancy * 100.0) / 100.0)
                            .averagePrice(avgPrice)
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return RoomStats.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .maintenanceRooms(maintenanceRooms)
                .cleaningRooms(cleaningRooms)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .averageRoomPrice((double) Math.round(averageRoomPrice))
                .mostBookedRoomId(mostBookedRoomId)
                .mostBookedRoomName(mostBookedRoomName)
                .roomTypeDistribution(distribution)
                .build();
    }

    @Override
    public RevenueStats getRevenueStats(LocalDate startDate, LocalDate endDate) {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> periodBookings = filterBookingsByDateRange(allBookings, startDate, endDate);

        // Previous period
        long daysDiff = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDate prevStart = startDate.minusDays(daysDiff);
        LocalDate prevEnd = startDate.minusDays(1);
        List<Booking> prevPeriodBookings = filterBookingsByDateRange(allBookings, prevStart, prevEnd);

        Double totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED ||
                        b.getStatus() == BookingStatus.CHECKED_OUT)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double thisMonthRevenue = periodBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        LocalDate yearStart = LocalDate.now().withDayOfYear(1);
        Double thisYearRevenue = allBookings.stream()
                .filter(b -> b.getCreatedDate().toLocalDate().isAfter(yearStart.minusDays(1)))
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double todayRevenue = bookingRepository.findByCheckInDate(LocalDate.now()).stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double averageDailyRevenue = daysDiff > 0
                ? thisMonthRevenue / daysDiff
                : 0.0;

        Double paidRevenue = periodBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double unpaidRevenue = periodBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.UNPAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        // Growth calculation
        Double prevRevenue = prevPeriodBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double revenueGrowthRate = prevRevenue > 0
                ? ((thisMonthRevenue - prevRevenue) / prevRevenue) * 100
                : 0.0;

        // Revenue by payment method
        Map<String, Double> revenueByPaymentMethod = periodBookings.stream()
                .filter(b -> b.getPaymentMethod() != null)
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .collect(Collectors.groupingBy(
                        b -> b.getPaymentMethod().getVietnameseName(),
                        Collectors.summingDouble(Booking::getTotalAmount)
                ));

        return RevenueStats.builder()
                .totalRevenue(totalRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .thisYearRevenue(thisYearRevenue)
                .todayRevenue(todayRevenue)
                .averageDailyRevenue((double) Math.round(averageDailyRevenue))
                .paidRevenue(paidRevenue)
                .unpaidRevenue(unpaidRevenue)
                .revenueGrowthRate(Math.round(revenueGrowthRate * 100.0) / 100.0)
                .revenueGrowthAmount(thisMonthRevenue - prevRevenue)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .build();
    }

    @Override
    public List<RecentBooking> getRecentBookings(Integer limit) {
        return bookingRepository.findAll().stream()
                .sorted(Comparator.comparing(Booking::getCreatedDate).reversed())
                .limit(limit)
                .map(this::mapToRecentBooking)
                .collect(Collectors.toList());
    }

    @Override
    public List<TodayActivity> getTodayActivities() {
        LocalDate today = LocalDate.now();
        List<TodayActivity> activities = new ArrayList<>();

        // Check-ins today
        bookingRepository.findTodayCheckIns(today).forEach(booking -> {
            activities.add(TodayActivity.builder()
                    .type("CHECK_IN")
                    .bookingNumber(booking.getBookingNumber())
                    .roomNumber(booking.getRoomNumber())
                    .guestName(booking.getUserFullName())
                    .time(booking.getActualCheckInTime() != null
                            ? booking.getActualCheckInTime().format(
                            DateTimeFormatter.ofPattern("HH:mm"))
                            : "Chưa check-in")
                    .status(booking.getStatus().getVietnameseName())
                    .build());
        });

        // Check-outs today
        bookingRepository.findTodayCheckOuts(today).forEach(booking -> {
            activities.add(TodayActivity.builder()
                    .type("CHECK_OUT")
                    .bookingNumber(booking.getBookingNumber())
                    .roomNumber(booking.getRoomNumber())
                    .guestName(booking.getUserFullName())
                    .time(booking.getActualCheckOutTime() != null
                            ? booking.getActualCheckOutTime().format(
                            DateTimeFormatter.ofPattern("HH:mm"))
                            : "Chưa check-out")
                    .status(booking.getStatus().getVietnameseName())
                    .build());
        });

        // New bookings today
        bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedDate().toLocalDate().equals(today))
                .forEach(booking -> {
                    activities.add(TodayActivity.builder()
                            .type("NEW_BOOKING")
                            .bookingNumber(booking.getBookingNumber())
                            .roomNumber(booking.getRoomNumber())
                            .guestName(booking.getUserFullName())
                            .time(booking.getCreatedDate().format(
                                    DateTimeFormatter.ofPattern("HH:mm")))
                            .status(booking.getStatus().getVietnameseName())
                            .build());
                });

        return activities.stream()
                .sorted(Comparator.comparing(TodayActivity::getTime).reversed())
                .collect(Collectors.toList());
    }


    private List<Booking> filterBookingsByDateRange(
            List<Booking> bookings, LocalDate startDate, LocalDate endDate) {
        return bookings.stream()
                .filter(b -> !b.getCreatedDate().toLocalDate().isBefore(startDate))
                .filter(b -> !b.getCreatedDate().toLocalDate().isAfter(endDate))
                .collect(Collectors.toList());
    }

    private Integer countByStatus(List<Booking> bookings, BookingStatus status) {
        return (int) bookings.stream()
                .filter(b -> b.getStatus() == status)
                .count();
    }

    private Integer countRoomsByStatus(List<Room> rooms, RoomStatus status) {
        return (int) rooms.stream()
                .filter(r -> r.getStatus() == status)
                .count();
    }

    private RecentBooking mapToRecentBooking(Booking booking) {
        return RecentBooking.builder()
                .bookingId(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .roomName(booking.getRoomName())
                .roomNumber(booking.getRoomNumber())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .status(booking.getStatus().getVietnameseName())
                .totalAmount(booking.getTotalAmount())
                .guestName(booking.getUserFullName())
                .guestEmail(booking.getUserEmail())
                .build();
    }


    @Override
    public List<ChartData> getRevenueChart(
            LocalDate startDate, LocalDate endDate, String groupBy) {

        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> !b.getCreatedDate().toLocalDate().isBefore(startDate))
                .filter(b -> !b.getCreatedDate().toLocalDate().isAfter(endDate))
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .collect(Collectors.toList());

        if ("DAY".equalsIgnoreCase(groupBy)) {
            return groupByDay(bookings, startDate, endDate);
        } else if ("WEEK".equalsIgnoreCase(groupBy)) {
            return groupByWeek(bookings);
        } else {
            return groupByMonth(bookings);
        }
    }

    @Override
    public List<ChartData> getBookingTrendChart(
            LocalDate startDate, LocalDate endDate, String groupBy) {

        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> !b.getCreatedDate().toLocalDate().isBefore(startDate))
                .filter(b -> !b.getCreatedDate().toLocalDate().isAfter(endDate))
                .collect(Collectors.toList());

        Map<String, Long> bookingsByDate = bookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedDate().toLocalDate().toString(),
                        Collectors.counting()
                ));

        return bookingsByDate.entrySet().stream()
                .map(entry -> ChartData.builder()
                        .label(entry.getKey())
                        .count(entry.getValue().intValue())
                        .value(entry.getValue().doubleValue())
                        .build())
                .sorted(Comparator.comparing(ChartData::getLabel))
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartData> getRoomOccupancyChart(LocalDate startDate, LocalDate endDate) {
        List<Room> rooms = roomRepository.findByIsActiveTrue();

        return Arrays.stream(RoomType.values())
                .map(type -> {
                    List<Room> roomsOfType = rooms.stream()
                            .filter(r -> r.getType() == type)
                            .collect(Collectors.toList());

                    if (roomsOfType.isEmpty()) return null;

                    int total = roomsOfType.size();
                    int available = (int) roomsOfType.stream()
                            .filter(r -> r.getStatus() == RoomStatus.AVAILABLE)
                            .count();
                    double occupancyRate = total > 0
                            ? ((total - available) / (double) total) * 100
                            : 0.0;

                    return ChartData.builder()
                            .label(type.getVietnameseName())
                            .value(Math.round(occupancyRate * 100.0) / 100.0)
                            .count(total - available)
                            .category(type.name())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartData> getRevenueByRoomType(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings = filterBookingsByDateRange(
                bookingRepository.findAll(), startDate, endDate);

        // Get room type for each booking
        Map<String, Double> revenueByType = new HashMap<>();

        bookings.forEach(booking -> {
            roomRepository.findById(booking.getRoomId()).ifPresent(room -> {
                String roomType = room.getType().getVietnameseName();
                revenueByType.merge(roomType, booking.getTotalAmount(), Double::sum);
            });
        });

        return revenueByType.entrySet().stream()
                .map(entry -> ChartData.builder()
                        .label(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(ChartData::getValue).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartData> getBookingStatusDistribution() {
        List<Booking> allBookings = bookingRepository.findAll();

        return Arrays.stream(BookingStatus.values())
                .map(status -> {
                    long count = allBookings.stream()
                            .filter(b -> b.getStatus() == status)
                            .count();

                    return ChartData.builder()
                            .label(status.getVietnameseName())
                            .value((double) count)
                            .count((int) count)
                            .category(status.name())
                            .build();
                })
                .filter(data -> data.getCount() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartData> getPaymentMethodDistribution(
            LocalDate startDate, LocalDate endDate) {

        List<Booking> bookings = filterBookingsByDateRange(
                bookingRepository.findAll(), startDate, endDate);

        Map<String, Long> distribution = bookings.stream()
                .filter(b -> b.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getPaymentMethod().getVietnameseName(),
                        Collectors.counting()
                ));

        return distribution.entrySet().stream()
                .map(entry -> ChartData.builder()
                        .label(entry.getKey())
                        .value(entry.getValue().doubleValue())
                        .count(entry.getValue().intValue())
                        .build())
                .sorted(Comparator.comparing(ChartData::getValue).reversed())
                .collect(Collectors.toList());
    }


    @Override
    public UserDashboardResponse getUserDashboard(String userEmail) {
        User user = findUserByEmail(userEmail);

        return UserDashboardResponse.builder()
                .userStats(getUserStats(userEmail))
                .recentBookings(getUserRecentBookings(user.getId(), 5))
                .upcomingBookings(getUserUpcomingBookings(user.getId()))
                .recommendedRooms(getRecommendedRooms(userEmail))
                .activitySummary(getUserActivitySummary(userEmail))
                .build();
    }

    @Override
    public UserStats getUserStats(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Booking> userBookings = bookingRepository.findByUserId(user.getId());

        Integer totalBookings = userBookings.size();
        Integer upcomingBookings = (int) userBookings.stream()
                .filter(b -> b.getCheckInDate().isAfter(LocalDate.now()))
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .count();
        Integer completedBookings = (int) userBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();
        Integer cancelledBookings = (int) userBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        Double totalSpent = userBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double averageSpent = totalBookings > 0
                ? totalSpent / totalBookings
                : 0.0;

        // Simple loyalty points calculation (1 point per 10,000 VND spent)
        Integer loyaltyPoints = (int) (totalSpent / 10000);

        // Membership tier based on bookings
        String membershipTier = getMembershipTier(completedBookings);

        return UserStats.builder()
                .totalBookings(totalBookings)
                .upcomingBookings(upcomingBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalSpent(totalSpent)
                .averageSpent((double) Math.round(averageSpent))
                .loyaltyPoints(loyaltyPoints)
                .membershipTier(membershipTier)
                .build();
    }

    @Override
    public UserActivitySummary getUserActivitySummary(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Booking> completedBookings = bookingRepository.findUserBookingHistory(user.getId());

        Integer totalNightsStayed = completedBookings.stream()
                .mapToInt(Booking::getNumberOfNights)
                .sum();

        // Find favorite room type (most booked)
        String favoriteRoomType = completedBookings.stream()
                .map(Booking::getRoomId)
                .map(roomId -> roomRepository.findById(roomId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        room -> room.getType().getVietnameseName(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Chưa có");

        Double averageBookingValue = completedBookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .average()
                .orElse(0.0);

        LocalDate lastBookingDate = completedBookings.stream()
                .map(Booking::getCreatedDate)
                .max(Comparator.naturalOrder())
                .map(LocalDateTime::toLocalDate)
                .orElse(null);

        return UserActivitySummary.builder()
                .totalNightsStayed(totalNightsStayed)
                .favoriteRoomType(favoriteRoomType)
                .averageBookingValue((double) Math.round(averageBookingValue))
                .lastBookingDate(lastBookingDate)
                .memberSince(user.getCreatedDate().toLocalDate())
                .consecutiveBookings(completedBookings.size())
                .build();
    }

    @Override
    public List<RecommendedRoom> getRecommendedRooms(String userEmail) {
        User user = findUserByEmail(userEmail);

        // Get user's booking history to find preferences
        List<Booking> userBookings = bookingRepository.findUserBookingHistory(user.getId());

        // Find user's preferred room type
        Optional<RoomType> preferredType = userBookings.stream()
                .map(Booking::getRoomId)
                .map(roomId -> roomRepository.findById(roomId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Room::getType, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey);

        // Get featured rooms or rooms of preferred type
        List<Room> recommendedRooms = preferredType.isPresent()
                ? roomRepository.findByTypeAndIsActiveTrue(preferredType.get())
                : roomRepository.findByIsFeaturedTrue();

        return recommendedRooms.stream()
                .limit(6)
                .map(room -> RecommendedRoom.builder()
                        .roomId(room.getId())
                        .roomName(room.getName())
                        .roomNumber(room.getRoomNumber())
                        .roomType(room.getType().getVietnameseName())
                        .thumbnailImage(room.getThumbnailImage())
                        .pricePerNight(room.getPricePerNight())
                        .rating(room.getAverageRating())
                        .totalReviews(room.getTotalReviews())
                        .isFeatured(room.getIsFeatured())
                        .recommendationReason(preferredType.isPresent()
                                ? "Dựa trên lịch sử đặt phòng của bạn"
                                : "Phòng nổi bật")
                        .build())
                .collect(Collectors.toList());
    }


    @Override
    public List<ChartData> getTopPerformingRooms(Integer limit) {
        return roomRepository.findByIsActiveTrue().stream()
                .sorted(Comparator.comparing(Room::getTotalBookings).reversed())
                .limit(limit)
                .map(room -> ChartData.builder()
                        .label(room.getName())
                        .value((double) room.getTotalBookings())
                        .count(room.getTotalBookings())
                        .category(room.getRoomNumber())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartData> getPeakBookingTimes() {
        List<Booking> allBookings = bookingRepository.findAll();

        Map<Integer, Long> bookingsByHour = allBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedDate().getHour(),
                        Collectors.counting()
                ));

        return bookingsByHour.entrySet().stream()
                .map(entry -> ChartData.builder()
                        .label(entry.getKey() + ":00")
                        .value(entry.getValue().doubleValue())
                        .count(entry.getValue().intValue())
                        .build())
                .sorted(Comparator.comparing(ChartData::getLabel))
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageLengthOfStay(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings = filterBookingsByDateRange(
                bookingRepository.findAll(), startDate, endDate);

        return bookings.stream()
                .mapToInt(Booking::getNumberOfNights)
                .average()
                .orElse(0.0);
    }


    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy user với email: " + email));
    }

    private List<ChartData> groupByDay(
            List<Booking> bookings, LocalDate startDate, LocalDate endDate) {

        Map<LocalDate, Double> revenueByDay = new HashMap<>();

        // Initialize all days with 0
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            revenueByDay.put(current, 0.0);
            current = current.plusDays(1);
        }

        // Add actual revenue
        bookings.forEach(booking -> {
            LocalDate date = booking.getCreatedDate().toLocalDate();
            if (!date.isBefore(startDate) && !date.isAfter(endDate)) {
                revenueByDay.merge(date, booking.getTotalAmount(), Double::sum);
            }
        });

        return revenueByDay.entrySet().stream()
                .map(entry -> ChartData.builder()
                        .label(entry.getKey().format(DateTimeFormatter.ofPattern("dd/MM")))
                        .value(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(ChartData::getLabel))
                .collect(Collectors.toList());
    }

    private List<ChartData> groupByWeek(List<Booking> bookings) {
        // Implementation for weekly grouping
        return Collections.emptyList();
    }

    private List<ChartData> groupByMonth(List<Booking> bookings) {
        // Implementation for monthly grouping
        return Collections.emptyList();
    }

    private String getMembershipTier(Integer completedBookings) {
        if (completedBookings >= 20) return "Platinum";
        if (completedBookings >= 10) return "Gold";
        if (completedBookings >= 5) return "Silver";
        return "Bronze";
    }

    private List<RecentBooking> getUserRecentBookings(String userId, Integer limit) {
        return bookingRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Booking::getCreatedDate).reversed())
                .limit(limit)
                .map(this::mapToRecentBooking)
                .collect(Collectors.toList());
    }

    private List<UpcomingBooking> getUserUpcomingBookings(String userId) {
        LocalDate today = LocalDate.now();
        log.info("Today: {}", today);
        return bookingRepository.findByUserId(userId).stream()
                .filter(b -> !b.getCheckInDate().isBefore(today))
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .min(Comparator.comparing(Booking::getCheckInDate))
                .map(this::mapToUpcomingBooking)
                .map(List::of)
                .orElse(List.of());
//                .collect(Collectors.toList());
    }

    private UpcomingBooking mapToUpcomingBooking(Booking booking) {
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), booking.getCheckInDate());

        return UpcomingBooking.builder()
                .bookingId(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .roomName(booking.getRoomName())
                .roomNumber(booking.getRoomNumber())
                .roomImage(roomRepository.findById(booking.getRoomId())
                        .map(Room::getThumbnailImage)
                        .orElse(null))
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .daysUntilCheckIn((int) daysUntil)
                .status(booking.getStatus().getVietnameseName())
                .canCancel(booking.getStatus() == BookingStatus.PENDING ||
                        booking.getStatus() == BookingStatus.CONFIRMED)
                .build();
    }

    @Override
    public List<ChartData> getGuestDemographics() {
        // Placeholder - would need more user data
        return Collections.emptyList();
    }

    @Override
    public List<ChartData> getCancellationTrends(LocalDate startDate, LocalDate endDate) {
        List<Booking> cancelledBookings = bookingRepository.findByStatus(BookingStatus.CANCELLED)
                .stream()
                .filter(b -> b.getCancelledAt() != null)
                .filter(b -> !b.getCancelledAt().toLocalDate().isBefore(startDate))
                .filter(b -> !b.getCancelledAt().toLocalDate().isAfter(endDate))
                .collect(Collectors.toList());

        Map<String, Long> trendsByDate = cancelledBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCancelledAt().toLocalDate()
                                .format(DateTimeFormatter.ofPattern("dd/MM")),
                        Collectors.counting()
                ));

        return trendsByDate.entrySet().stream()
                .map(entry -> ChartData.builder()
                        .label(entry.getKey())
                        .value(entry.getValue().doubleValue())
                        .count(entry.getValue().intValue())
                        .build())
                .sorted(Comparator.comparing(ChartData::getLabel))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> comparePerformance(
            LocalDate period1Start, LocalDate period1End,
            LocalDate period2Start, LocalDate period2End) {
        // Implementation for performance comparison
        return Collections.emptyMap();
    }

    @Override
    public Map<String, Object> getYearOverYearComparison(Integer year) {
        // Implementation for YoY comparison
        return Collections.emptyMap();
    }
}