package com.bean.hotel_management.booking.service.impl;

import com.bean.hotel_management.booking.dto.response.BookingResponse;
import com.bean.hotel_management.booking.dto.response.BookingStatistics;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import com.bean.hotel_management.booking.dto.request.*;
import com.bean.hotel_management.booking.mapper.BookingMapper;
import com.bean.hotel_management.booking.model.*;
import com.bean.hotel_management.booking.repository.IBookingRepository;
import com.bean.hotel_management.booking.service.IBookingService;
import com.bean.hotel_management.common.exception.*;
import com.bean.hotel_management.room.model.Room;
import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.repository.IRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.bean.hotel_management.booking.constants.BookingConstants.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {

    private final IBookingRepository bookingRepository;
    private final IRoomRepository roomRepository;
    private final IUserRepository userRepository;

    private final BookingMapper bookingMapper;
    private final BookingEmailService bookingEmailService;


    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {
        // Validate dates
        validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());

        // Get user and room
        User user = findUserByEmail(userEmail);
        Room room = findRoomById(request.getRoomId());

        // Validate room availability
        validateRoomAvailability(room, request.getCheckInDate(), request.getCheckOutDate());

        // Validate occupancy
        validateOccupancy(room, request.getNumberOfGuests());

        // Generate booking number
        String bookingNumber = generateBookingNumber();

        // Create booking
        Booking booking = bookingMapper.toEntity(request, user, room, bookingNumber);

        // Set guest information
        booking.setPrimaryGuest(request.getPrimaryGuest());
        booking.setAdditionalGuests(request.getAdditionalGuests());

        // Set booking source
        booking.setBookingSource(request.getBookingSource() != null
                ? request.getBookingSource() : "WEBSITE");
        booking.setCreatedBy(user.getId());

        // Handle early/late requests
        if (Boolean.TRUE.equals(request.getIsEarlyCheckIn())) {
            booking.setIsEarlyCheckIn(true);
            // Fee will be set when admin approves
        }
        if (Boolean.TRUE.equals(request.getIsLateCheckOut())) {
            booking.setIsLateCheckOut(true);
            // Fee will be set when admin approves
        }

        // Calculate deposit (30% of total)
        booking.setDepositAmount(booking.getTotalAmount() * 0.3);
        booking.setDepositPaid(false);

        Booking savedBooking = bookingRepository.save(booking);

        // Update room statistics
        room.setTotalBookings(room.getTotalBookings() + 1);
        room.setLastBookedDate(LocalDateTime.now());
        roomRepository.save(room);

        // Send confirmation email asynchronously
        try {
            bookingEmailService.sendBookingConfirmation(savedBooking);
            savedBooking.setConfirmationEmailSent(true);
            bookingRepository.save(savedBooking);
        } catch (Exception e) {
            log.error("Failed to send confirmation email: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email xác nhận đặt phòng");
        }

        log.info("Booking created: {} for user: {}", bookingNumber, userEmail);
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional
    public List<BookingResponse> createGroupBooking(GroupBookingRequest request, String userEmail) {
        // Validate dates
        validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());

        User user = findUserByEmail(userEmail);

        // Generate group booking ID
        String groupBookingId = "GRP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        List<BookingResponse> bookings = new ArrayList<>();

        // Validate all rooms are available first
        for (String roomId : request.getRoomIds()) {
            Room room = findRoomById(roomId);
            validateRoomAvailability(room, request.getCheckInDate(), request.getCheckOutDate());
        }

        // Create bookings for each room
        for (int i = 0; i < request.getRoomBookings().size(); i++) {
            CreateBookingRequest roomRequest = request.getRoomBookings().get(i);
            roomRequest.setCheckInDate(request.getCheckInDate());
            roomRequest.setCheckOutDate(request.getCheckOutDate());

            BookingResponse booking = createBooking(roomRequest, userEmail);

            // Update with group info
            Booking savedBooking = findBookingById(booking.getId());
            savedBooking.setGroupBookingId(groupBookingId);
            savedBooking.setIsGroupBooking(true);
            bookingRepository.save(savedBooking);

            bookings.add(bookingMapper.toResponse(savedBooking));
        }

        log.info("Group booking created: {} with {} rooms", groupBookingId, bookings.size());
        return bookings;
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(String bookingId, UpdateBookingRequest request, String userEmail) {
        Booking booking = findBookingById(bookingId);

        // Check ownership
        validateBookingOwnership(booking, userEmail);

        // Check if booking can be updated
        if (booking.getStatus() != BookingStatus.PENDING &&
                booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidCredentialsException(
                    "Không thể cập nhật booking với trạng thái: " + booking.getStatus());
        }

        // Update fields if provided
        boolean needsPriceRecalculation = false;

        if (request.getCheckInDate() != null || request.getCheckOutDate() != null) {
            LocalDate newCheckIn = request.getCheckInDate() != null
                    ? request.getCheckInDate() : booking.getCheckInDate();
            LocalDate newCheckOut = request.getCheckOutDate() != null
                    ? request.getCheckOutDate() : booking.getCheckOutDate();

            validateBookingDates(newCheckIn, newCheckOut);
            validateRoomAvailabilityForUpdate(
                    booking.getRoomId(), newCheckIn, newCheckOut, bookingId);

            booking.setCheckInDate(newCheckIn);
            booking.setCheckOutDate(newCheckOut);
            needsPriceRecalculation = true;
        }

        if (request.getNumberOfGuests() != null) {
            Room room = findRoomById(booking.getRoomId());
            validateOccupancy(room, request.getNumberOfGuests());
            booking.setNumberOfGuests(request.getNumberOfGuests());
        }

        if (request.getNumberOfChildren() != null) {
            booking.setNumberOfChildren(request.getNumberOfChildren());
        }

        if (request.getSpecialRequests() != null) {
            booking.setSpecialRequests(request.getSpecialRequests());
        }

        if (request.getAddedServices() != null) {
            booking.setAddedServices(request.getAddedServices());
        }

        // Recalculate pricing if dates changed
        if (needsPriceRecalculation) {
            recalculatePricing(booking);
        }

        booking.setUpdatedDate(LocalDateTime.now());
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Booking updated: {} by user: {}", booking.getBookingNumber(), userEmail);
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(
            String bookingId, CancelBookingRequest request, String userEmail) {

        Booking booking = findBookingById(bookingId);
        validateBookingOwnership(booking, userEmail);

        // check trạng thái có thể hủy
        if (booking.getStatus() != BookingStatus.PENDING &&
                booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidCredentialsException(Messages.CANNOT_CANCEL);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(request.getCancellationReason());
        booking.setCancelledBy(booking.getUserId());
        booking.setUpdatedDate(LocalDateTime.now());

        // Calculate cancellation fee if applicable
        applyCancellationFee(booking);

        Booking cancelledBooking = bookingRepository.save(booking);

        // Update room status back to available if needed
        updateRoomStatusAfterCancellation(booking.getRoomId());

        log.info("Booking cancelled: {} by user: {}", booking.getBookingNumber(), userEmail);

        return bookingMapper.toResponse(cancelledBooking);
    }

    @Override
    public BookingResponse getBookingById(String bookingId) {
        return bookingMapper.toResponse(findBookingById(bookingId));
    }

    @Override
    public BookingResponse getBookingByNumber(String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(Messages.BOOKING_NUMBER_NOT_FOUND, bookingNumber)));
        return bookingMapper.toResponse(booking);
    }


    @Override
    public Page<BookingResponse> getUserBookings(
            String userEmail, int page, int size, String sortBy, String sortOrder) {

        User user = findUserByEmail(userEmail);
        Pageable pageable = createPageable(page, size, sortBy, sortOrder);

        return bookingRepository.findByUserId(user.getId(), pageable)
                .map(bookingMapper::toResponse);
    }

    @Override
    public List<BookingResponse> getUserBookingHistory(String userEmail) {
        User user = findUserByEmail(userEmail);
        return bookingRepository.findUserBookingHistory(user.getId()).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getUpcomingBookings(String userEmail) {
        User user = findUserByEmail(userEmail);
        LocalDate today = LocalDate.now();

        return bookingRepository.findUpcomingBookingsByUser(user.getId(), today).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> searchByCccdNumber(String cccdNumber) {
        return bookingRepository.findByAnyCccdNumber(cccdNumber).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<BookingResponse> searchBookings(BookingSearchRequest request) {
        Pageable pageable = createPageableFromRequest(request);

        // If keyword is provided, use keyword search
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            return bookingRepository.searchByKeyword(request.getKeyword(), pageable)
                    .map(bookingMapper::toResponse);
        }

        // If CCCD is provided, search by CCCD
        if (request.getCccdNumber() != null && !request.getCccdNumber().isBlank()) {
            List<Booking> bookings = bookingRepository.findByAnyCccdNumber(request.getCccdNumber());
            return createPageFromList(bookings, pageable);
        }

        // Otherwise use advanced filter
        List<Booking> filteredBookings = bookingRepository.findAll().stream()
                .filter(booking -> matchesSearchCriteria(booking, request))
                .collect(Collectors.toList());

        return createPageFromList(filteredBookings, pageable);
    }

    @Override
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByRoom(String roomId) {
        return bookingRepository.findByRoomId(roomId).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getGroupBookings(String groupBookingId) {
        return bookingRepository.findByGroupBookingId(groupBookingId).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    public boolean checkAvailability(CheckAvailabilityRequest request) {
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        return overlappingBookings.isEmpty();
    }

    @Override
    public Map<String, Boolean> checkMultipleRoomsAvailability(
            List<String> roomIds, LocalDate checkIn, LocalDate checkOut) {

        Map<String, Boolean> availability = new HashMap<>();

        for (String roomId : roomIds) {
            CheckAvailabilityRequest request = CheckAvailabilityRequest.builder()
                    .roomId(roomId)
                    .checkInDate(checkIn)
                    .checkOutDate(checkOut)
                    .build();
            availability.put(roomId, checkAvailability(request));
        }

        return availability;
    }

    @Override
    public List<LocalDate> getUnavailableDates(
            String roomId, LocalDate startDate, LocalDate endDate) {

        List<Booking> bookings = bookingRepository.findByRoomId(roomId).stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING ||
                        b.getStatus() == BookingStatus.CONFIRMED ||
                        b.getStatus() == BookingStatus.CHECKED_IN)
                .toList();

        Set<LocalDate> unavailableDates = new HashSet<>();

        for (Booking booking : bookings) {
            LocalDate date = booking.getCheckInDate();
            while (!date.isAfter(booking.getCheckOutDate())) {
                if (!date.isBefore(startDate) && !date.isAfter(endDate)) {
                    unavailableDates.add(date);
                }
                date = date.plusDays(1);
            }
        }

        return new ArrayList<>(unavailableDates);
    }


    @Override
    @Transactional
    public BookingResponse confirmBooking(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể xác nhận booking ở trạng thái PENDING");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedDate(LocalDateTime.now());
        booking.setUpdatedDate(LocalDateTime.now());

        Booking confirmedBooking = bookingRepository.save(booking);
        log.info("Booking confirmed: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(confirmedBooking);
    }

    @Override
    @Transactional
    public BookingResponse checkIn(String bookingId, CheckInRequest request) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidCredentialsException(Messages.CANNOT_CHECK_IN);
        }

        LocalDate today = LocalDate.now();
        if (booking.getCheckInDate().isAfter(today)) {
            throw new InvalidCredentialsException(Messages.CANNOT_CHECK_IN);
        }

        // Verify guest information
        if (request.getGuestVerification() != null) {
            // Validate CCCD matches
            if (!request.getGuestVerification().getCccdNumber()
                    .equals(booking.getPrimaryGuest().getCccdNumber())) {
                throw new InvalidCredentialsException("CCCD không khớp với thông tin đặt phòng");
            }
        }

        // Process deposit if not paid
        if (!Boolean.TRUE.equals(booking.getDepositPaid())) {
            booking.setDepositPaid(true);
            booking.setDepositPaidDate(LocalDateTime.now());
            booking.setDepositTransactionId(request.getDepositTransactionId());
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setActualCheckInTime(LocalDateTime.now());
        booking.setUpdatedDate(LocalDateTime.now());

        // Update room status
        Room room = findRoomById(booking.getRoomId());
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        Booking checkedInBooking = bookingRepository.save(booking);
        log.info("Booking checked in: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(checkedInBooking);
    }

    @Override
    @Transactional
    public BookingResponse checkOut(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new InvalidCredentialsException(Messages.CANNOT_CHECK_OUT);
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setActualCheckOutTime(LocalDateTime.now());
        booking.setUpdatedDate(LocalDateTime.now());
        booking.setRoomCleanedAfterCheckout(false);

        // Update room status
        Room room = findRoomById(booking.getRoomId());
        room.setStatus(RoomStatus.CLEANING);
        roomRepository.save(room);

        Booking checkedOutBooking = bookingRepository.save(booking);
        log.info("Booking checked out: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(checkedOutBooking);
    }

    @Override
    @Transactional
    public BookingResponse markAsNoShow(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể đánh dấu no-show cho booking đã xác nhận");
        }

        booking.setStatus(BookingStatus.NO_SHOW);
        booking.setUpdatedDate(LocalDateTime.now());

        // Update room status back to available
        updateRoomStatusAfterCancellation(booking.getRoomId());

        Booking noShowBooking = bookingRepository.save(booking);
        log.info("Booking marked as no-show: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(noShowBooking);
    }

    @Override
    @Transactional
    public BookingResponse completeBooking(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_OUT) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể hoàn thành booking đã check-out");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setUpdatedDate(LocalDateTime.now());

        Booking completedBooking = bookingRepository.save(booking);
        log.info("Booking completed: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(completedBooking);
    }


    @Override
    @Transactional
    public BookingResponse processPayment(String bookingId, PaymentRequest request) {
        Booking booking = findBookingById(bookingId);

        if (booking.getPaymentStatus() == BookingPaymentStatus.PAID) {
            throw new InvalidCredentialsException(Messages.ALREADY_PAID);
        }

        booking.setPaymentStatus(BookingPaymentStatus.PAID);
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setPaymentTransactionId(request.getPaymentTransactionId());
        booking.setPaymentDate(LocalDateTime.now());
        booking.setUpdatedDate(LocalDateTime.now());

        Booking paidBooking = bookingRepository.save(booking);
        log.info("Payment processed for booking: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(paidBooking);
    }

    @Override
    @Transactional
    public BookingResponse processDepositPayment(String bookingId, PaymentRequest request) {
        Booking booking = findBookingById(bookingId);

        if (Boolean.TRUE.equals(booking.getDepositPaid())) {
            throw new InvalidCredentialsException("Đặt cọc đã được thanh toán");
        }

        booking.setDepositPaid(true);
        booking.setDepositPaidDate(LocalDateTime.now());
        booking.setDepositTransactionId(request.getPaymentTransactionId());
        booking.setUpdatedDate(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Deposit paid for booking: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse refundPayment(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getPaymentStatus() != BookingPaymentStatus.PAID) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể hoàn tiền cho booking đã thanh toán");
        }

        if (booking.getStatus() != BookingStatus.CANCELLED) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể hoàn tiền cho booking đã hủy");
        }

        booking.setPaymentStatus(BookingPaymentStatus.REFUNDED);
        booking.setUpdatedDate(LocalDateTime.now());

        Booking refundedBooking = bookingRepository.save(booking);
        log.info("Payment refunded for booking: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(refundedBooking);
    }


    @Override
    @Transactional
    public BookingResponse addServiceCharge(String bookingId, AddServiceChargeRequest request) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN &&
                booking.getStatus() != BookingStatus.CHECKED_OUT) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể thêm phí dịch vụ cho booking đã check-in");
        }

        ServiceCharge charge = ServiceCharge.builder()
                .serviceType(request.getServiceType())
                .description(request.getDescription())
                .amount(request.getAmount())
                .quantity(request.getQuantity())
                .chargeDate(LocalDateTime.now())
                .build();

        if (booking.getAdditionalCharges() == null) {
            booking.setAdditionalCharges(new ArrayList<>());
        }
        booking.getAdditionalCharges().add(charge);

        // Recalculate total
        Double chargesTotal = booking.getAdditionalCharges().stream()
                .mapToDouble(c -> c.getAmount() * c.getQuantity())
                .sum();
        booking.setAdditionalChargesTotal(chargesTotal);
        booking.setTotalAmount(booking.getSubtotal() + booking.getTaxAmount() +
                booking.getServiceCharge() + chargesTotal -
                (booking.getDiscount() != null ? booking.getDiscount() : 0.0));

        booking.setUpdatedDate(LocalDateTime.now());
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Service charge added to booking: {}", booking.getBookingNumber());
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse removeServiceCharge(String bookingId, int chargeIndex) {
        Booking booking = findBookingById(bookingId);

        if (booking.getAdditionalCharges() == null ||
                chargeIndex >= booking.getAdditionalCharges().size()) {
            throw new InvalidCredentialsException("Service charge không tồn tại");
        }

        booking.getAdditionalCharges().remove(chargeIndex);

        // Recalculate total
        Double chargesTotal = booking.getAdditionalCharges().stream()
                .mapToDouble(c -> c.getAmount() * c.getQuantity())
                .sum();
        booking.setAdditionalChargesTotal(chargesTotal);
        recalculatePricing(booking);

        booking.setUpdatedDate(LocalDateTime.now());
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Service charge removed from booking: {}", booking.getBookingNumber());
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public List<ServiceCharge> getBookingServiceCharges(String bookingId) {
        Booking booking = findBookingById(bookingId);
        return booking.getAdditionalCharges() != null
                ? booking.getAdditionalCharges()
                : new ArrayList<>();
    }

    @Override
    public Double calculateTotalServiceCharges(String bookingId) {
        Booking booking = findBookingById(bookingId);
        return booking.getAdditionalCharges() != null
                ? booking.getAdditionalCharges().stream()
                .mapToDouble(c -> c.getAmount() * c.getQuantity())
                .sum()
                : 0.0;
    }


    @Override
    public BookingStatistics getBookingStatistics() {
        List<Booking> allBookings = bookingRepository.findAll();

        Integer totalBookings = allBookings.size();
        Integer pendingBookings = countBookingsByStatus(allBookings, BookingStatus.PENDING);
        Integer confirmedBookings = countBookingsByStatus(allBookings, BookingStatus.CONFIRMED);
        Integer checkedInBookings = countBookingsByStatus(allBookings, BookingStatus.CHECKED_IN);
        Integer completedBookings = countBookingsByStatus(allBookings, BookingStatus.COMPLETED);
        Integer cancelledBookings = countBookingsByStatus(allBookings, BookingStatus.CANCELLED);

        List<Booking> paidBookings = allBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .collect(Collectors.toList());

        Double totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED ||
                        b.getStatus() == BookingStatus.CHECKED_OUT)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double paidRevenue = paidBookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double unpaidRevenue = totalRevenue - paidRevenue;

        LocalDate today = LocalDate.now();
        Integer todayCheckIns = (int) allBookings.stream()
                .filter(b -> b.getCheckInDate().equals(today))
                .count();

        Integer todayCheckOuts = (int) allBookings.stream()
                .filter(b -> b.getCheckOutDate().equals(today))
                .count();

        Double averageBookingValue = allBookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .average()
                .orElse(0.0);

        Double cancellationRate = totalBookings > 0
                ? (cancelledBookings.doubleValue() / totalBookings) * 100
                : 0.0;

        return BookingStatistics.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .checkedInBookings(checkedInBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .paidRevenue(paidRevenue)
                .unpaidRevenue(unpaidRevenue)
                .todayCheckIns(todayCheckIns)
                .todayCheckOuts(todayCheckOuts)
                .averageBookingValue(averageBookingValue)
                .cancellationRate(cancellationRate)
                .build();
    }

    @Override
    public List<BookingResponse> getTodayCheckIns() {
        LocalDate today = LocalDate.now();
        return bookingRepository.findTodayCheckIns(today).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getTodayCheckOuts() {
        LocalDate today = LocalDate.now();
        return bookingRepository.findTodayCheckOuts(today).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getTotalRevenue() {
        return bookingRepository.findCompletedPaidBookings().stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();
    }

    @Override
    public Map<String, Double> getRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Booking> bookings = bookingRepository.findPaidBookingsByDateRange(start, end);

        Double totalRevenue = bookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Double roomRevenue = bookings.stream()
                .mapToDouble(Booking::getSubtotal)
                .sum();

        Double serviceChargesRevenue = bookings.stream()
                .mapToDouble(b -> b.getAdditionalChargesTotal() != null
                        ? b.getAdditionalChargesTotal() : 0.0)
                .sum();

        Map<String, Double> result = new HashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("roomRevenue", roomRevenue);
        result.put("serviceChargesRevenue", serviceChargesRevenue);
        result.put("bookingCount", (double) bookings.size());

        return result;
    }

    @Override
    public Map<String, Long> getBookingsBySource() {
        List<Booking> allBookings = bookingRepository.findAll();

        return allBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getBookingSource() != null ? b.getBookingSource() : "UNKNOWN",
                        Collectors.counting()
                ));
    }

    @Override
    public Double getOccupancyRate(LocalDate startDate, LocalDate endDate) {
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate);
        long totalRooms = roomRepository.findByIsActiveTrue().size();
        long totalRoomDays = totalDays * totalRooms;

        List<Booking> bookingsInRange = bookingRepository.findByCheckInDateBetween(startDate, endDate);

        long occupiedRoomDays = bookingsInRange.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .mapToLong(Booking::getNumberOfNights)
                .sum();

        return totalRoomDays > 0
                ? ((double) occupiedRoomDays / totalRoomDays) * 100
                : 0.0;
    }


    @Override
    @Transactional
    public BookingResponse addAdminNotes(String bookingId, String notes) {
        Booking booking = findBookingById(bookingId);
        booking.setAdminNotes(notes);
        booking.setUpdatedDate(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Admin notes added to booking: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse applyDiscount(String bookingId, Double discountAmount) {
        Booking booking = findBookingById(bookingId);

        if (discountAmount < 0 || discountAmount > booking.getSubtotal()) {
            throw new InvalidCredentialsException("Discount amount không hợp lệ");
        }

        booking.setDiscount(discountAmount);
        recalculatePricing(booking);
        booking.setUpdatedDate(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Discount applied to booking: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse approveEarlyCheckIn(String bookingId, Double fee) {
        Booking booking = findBookingById(bookingId);

        if (!Boolean.TRUE.equals(booking.getIsEarlyCheckIn())) {
            throw new InvalidCredentialsException("Booking không yêu cầu early check-in");
        }

        booking.setEarlyCheckInFee(fee);
        recalculatePricing(booking);
        booking.setUpdatedDate(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Early check-in approved for booking: {} with fee: {}",
                booking.getBookingNumber(), fee);

        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse approveLateCheckOut(String bookingId, Double fee) {
        Booking booking = findBookingById(bookingId);

        if (!Boolean.TRUE.equals(booking.getIsLateCheckOut())) {
            throw new InvalidCredentialsException("Booking không yêu cầu late check-out");
        }

        booking.setLateCheckOutFee(fee);
        recalculatePricing(booking);
        booking.setUpdatedDate(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Late check-out approved for booking: {} with fee: {}",
                booking.getBookingNumber(), fee);

        return bookingMapper.toResponse(updatedBooking);
    }


    @Override
    public void sendBookingConfirmationEmail(String bookingId) {
        Booking booking = findBookingById(bookingId);

        try {
            bookingEmailService.sendBookingConfirmation(booking);
            booking.setConfirmationEmailSent(true);
            bookingRepository.save(booking);

            log.info("Confirmation email sent for booking: {}", booking.getBookingNumber());
        } catch (Exception e) {
            log.error("Không thể gửi email: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email xác nhận");
        }
    }

    @Override
    public void sendCheckInReminder(String bookingId) {
        Booking booking = findBookingById(bookingId);

        try {
            bookingEmailService.sendCheckInReminder(booking);
            booking.setReminderEmailSent(true);
            bookingRepository.save(booking);

            log.info("Reminder email sent for booking: {}", booking.getBookingNumber());
        } catch (Exception e) {
            log.error("Failed to send reminder email: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email nhắc nhở");
        }
    }

    @Override
    @Transactional
    public void sendBulkReminders() {
        // Send reminders for bookings checking in tomorrow
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate dayAfterTomorrow = tomorrow.plusDays(1);

        List<Booking> bookingsNeedingReminder = bookingRepository
                .findBookingsNeedingReminder(tomorrow, dayAfterTomorrow);

        int sentCount = 0;
        for (Booking booking : bookingsNeedingReminder) {
            try {
                bookingEmailService.sendCheckInReminder(booking);
                booking.setReminderEmailSent(true);
                bookingRepository.save(booking);
                sentCount++;
            } catch (Exception e) {
                log.error("Failed to send reminder for booking {}: {}",
                        booking.getBookingNumber(), e.getMessage());
            }
        }

        log.info("Sent {} reminder emails", sentCount);
    }


    @Override
    public List<BookingResponse> getRoomsNeedingCleaning() {
        return bookingRepository.findRoomsNeedingCleaning().stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse markRoomAsCleaned(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_OUT) {
            throw new InvalidCredentialsException(
                    "Chỉ có thể đánh dấu cleaned cho booking đã check-out");
        }

        booking.setRoomCleanedAfterCheckout(true);
        booking.setUpdatedDate(LocalDateTime.now());

        // Update room status back to available
        Room room = findRoomById(booking.getRoomId());
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Room marked as cleaned for booking: {}", booking.getBookingNumber());

        return bookingMapper.toResponse(updatedBooking);
    }


    @Override
    public Map<String, Object> getDailyOperationsReport(LocalDate date) {
        Map<String, Object> report = new HashMap<>();

        // Check-ins
        List<Booking> checkIns = bookingRepository.findTodayCheckIns(date);
        report.put("expectedCheckIns", checkIns.size());
        report.put("checkInsList", checkIns.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList()));

        // Check-outs
        List<Booking> checkOuts = bookingRepository.findTodayCheckOuts(date);
        report.put("expectedCheckOuts", checkOuts.size());
        report.put("checkOutsList", checkOuts.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList()));

        // Revenue
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        List<Booking> paidToday = bookingRepository.findPaidBookingsByDateRange(startOfDay, endOfDay);

        Double dailyRevenue = paidToday.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();
        report.put("dailyRevenue", dailyRevenue);
        report.put("paymentsCount", paidToday.size());

        // Occupancy
        long totalRooms = roomRepository.findByIsActiveTrue().size();
        long occupiedRooms = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN &&
                        !b.getCheckInDate().isAfter(date) &&
                        !b.getCheckOutDate().isBefore(date))
                .count();

        Double occupancyRate = totalRooms > 0
                ? ((double) occupiedRooms / totalRooms) * 100
                : 0.0;
        report.put("occupancyRate", occupancyRate);
        report.put("occupiedRooms", occupiedRooms);
        report.put("totalRooms", totalRooms);

        // Rooms needing cleaning
        List<Booking> needsCleaning = bookingRepository.findRoomsNeedingCleaning();
        report.put("roomsNeedingCleaning", needsCleaning.size());

        return report;
    }

    @Override
    public Map<String, Object> getMonthlyReport(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        Map<String, Object> report = new HashMap<>();

        // Get all bookings in the month
        List<Booking> monthlyBookings = bookingRepository
                .findByCheckInDateBetween(startDate, endDate);

        // Total bookings
        report.put("totalBookings", monthlyBookings.size());

        // Bookings by status
        Map<BookingStatus, Long> byStatus = monthlyBookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
        report.put("bookingsByStatus", byStatus);

        // Revenue
        Double totalRevenue = monthlyBookings.stream()
                .filter(b -> b.getPaymentStatus() == BookingPaymentStatus.PAID)
                .mapToDouble(Booking::getTotalAmount)
                .sum();
        report.put("totalRevenue", totalRevenue);

        // Average booking value
        Double avgBookingValue = monthlyBookings.isEmpty() ? 0.0 :
                monthlyBookings.stream()
                        .mapToDouble(Booking::getTotalAmount)
                        .average()
                        .orElse(0.0);
        report.put("averageBookingValue", avgBookingValue);

        // Occupancy rate
        Double occupancyRate = getOccupancyRate(startDate, endDate);
        report.put("occupancyRate", occupancyRate);

        // Cancellation rate
        long cancelled = monthlyBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();
        Double cancellationRate = monthlyBookings.isEmpty() ? 0.0 :
                ((double) cancelled / monthlyBookings.size()) * 100;
        report.put("cancellationRate", cancellationRate);

        // Bookings by source
        Map<String, Long> bySource = monthlyBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getBookingSource() != null ? b.getBookingSource() : "UNKNOWN",
                        Collectors.counting()
                ));
        report.put("bookingsBySource", bySource);

        // Top rooms
        Map<String, Long> topRooms = monthlyBookings.stream()
                .collect(Collectors.groupingBy(Booking::getRoomNumber, Collectors.counting()));
        report.put("topRooms", topRooms);

        return report;
    }


    private Booking findBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(Messages.BOOKING_NOT_FOUND, bookingId)));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy user với email: " + email));
    }

    private Room findRoomById(String roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phòng với ID: " + roomId));
    }

    private void validateBookingDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new InvalidCredentialsException(Messages.PAST_CHECK_IN_DATE);
        }

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new InvalidCredentialsException(Messages.INVALID_DATE_RANGE);
        }

        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        if (nights < Validation.MIN_NIGHTS || nights > Validation.MAX_NIGHTS) {
            throw new InvalidCredentialsException(
                    "Số đêm phải từ " + Validation.MIN_NIGHTS +
                            " đến " + Validation.MAX_NIGHTS);
        }
    }

    private void validateRoomAvailability(
            Room room, LocalDate checkInDate, LocalDate checkOutDate) {

        if (!room.getIsActive() || room.getStatus() != RoomStatus.AVAILABLE) {
            throw new InvalidCredentialsException(Messages.ROOM_NOT_AVAILABLE);
        }

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                room.getId(), checkInDate, checkOutDate);

        if (!overlappingBookings.isEmpty()) {
            throw new InvalidCredentialsException(Messages.ROOM_NOT_AVAILABLE);
        }
    }

    private void validateRoomAvailabilityForUpdate(
            String roomId, LocalDate checkInDate, LocalDate checkOutDate, String excludeBookingId) {

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                        roomId, checkInDate, checkOutDate).stream()
                .filter(b -> !b.getId().equals(excludeBookingId))
                .collect(Collectors.toList());

        if (!overlappingBookings.isEmpty()) {
            throw new InvalidCredentialsException(Messages.ROOM_NOT_AVAILABLE);
        }
    }

    private void validateOccupancy(Room room, Integer numberOfGuests) {
        if (numberOfGuests > room.getMaxOccupancy()) {
            throw new InvalidCredentialsException(Messages.EXCEEDS_MAX_OCCUPANCY);
        }
    }

    private void validateBookingOwnership(Booking booking, String userEmail) {
        User user = findUserByEmail(userEmail);
        if (!booking.getUserId().equals(user.getId()) && user.getRole().name().equals("USER")) {
            throw new InvalidCredentialsException(
                    "Bạn không có quyền thao tác với booking này");
        }
    }

    private String generateBookingNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        return BookingNumber.PREFIX + dateStr + randomStr;
    }

    private void recalculatePricing(Booking booking) {
        int numberOfNights = (int) ChronoUnit.DAYS.between(
                booking.getCheckInDate(), booking.getCheckOutDate());

        double subtotal = booking.getRoomPricePerNight() * numberOfNights;
        double taxAmount = subtotal * Pricing.TAX_RATE;
        double serviceCharge = subtotal * Pricing.SERVICE_CHARGE_RATE;

        // Add early/late fees
        double additionalFees = 0.0;
        if (booking.getEarlyCheckInFee() != null) {
            additionalFees += booking.getEarlyCheckInFee();
        }
        if (booking.getLateCheckOutFee() != null) {
            additionalFees += booking.getLateCheckOutFee();
        }

        // Add service charges
        double serviceChargesTotal = booking.getAdditionalCharges() != null
                ? booking.getAdditionalCharges().stream()
                .mapToDouble(c -> c.getAmount() * c.getQuantity())
                .sum()
                : 0.0;

        double totalAmount = subtotal + taxAmount + serviceCharge + additionalFees +
                serviceChargesTotal - (booking.getDiscount() != null ? booking.getDiscount() : 0.0);

        booking.setNumberOfNights(numberOfNights);
        booking.setSubtotal(subtotal);
        booking.setTaxAmount(taxAmount);
        booking.setServiceCharge(serviceCharge);
        booking.setAdditionalChargesTotal(serviceChargesTotal);
        booking.setTotalAmount(totalAmount);
    }

    private void applyCancellationFee(Booking booking) {
        long hoursUntilCheckIn = ChronoUnit.HOURS.between(
                LocalDateTime.now(),
                booking.getCheckInDate().atStartOfDay()
        );

        if (hoursUntilCheckIn < Cancellation.FREE_CANCELLATION_HOURS) {
            double fee = booking.getTotalAmount() * Cancellation.CANCELLATION_FEE_RATE;
            booking.setCancellationFee(fee);
            booking.setTotalAmount(booking.getTotalAmount() - fee);
        } else {
            booking.setCancellationFee(0.0);
        }
    }

    private void updateRoomStatusAfterCancellation(String roomId) {
        Room room = findRoomById(roomId);

        // Check if room has any active bookings
        List<Booking> activeBookings = bookingRepository.findByRoomId(roomId).stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED ||
                        b.getStatus() == BookingStatus.CHECKED_IN)
                .collect(Collectors.toList());

        if (activeBookings.isEmpty() && room.getStatus() != RoomStatus.AVAILABLE) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return PageRequest.of(page, size, sort);
    }

    private Pageable createPageableFromRequest(BookingSearchRequest request) {
        int page = Optional.ofNullable(request.getPage()).orElse(0);
        int size = Optional.ofNullable(request.getSize()).orElse(10);
        String sortBy = Optional.ofNullable(request.getSortBy()).orElse("createdDate");
        String sortOrder = Optional.ofNullable(request.getSortOrder()).orElse("desc");

        return createPageable(page, size, sortBy, sortOrder);
    }

    private boolean matchesSearchCriteria(Booking booking, BookingSearchRequest request) {
        return Optional.ofNullable(request.getUserId())
                .map(id -> id.equals(booking.getUserId())).orElse(true)
                && Optional.ofNullable(request.getRoomId())
                .map(id -> id.equals(booking.getRoomId())).orElse(true)
                && Optional.ofNullable(request.getRoomNumber())
                .map(num -> num.equals(booking.getRoomNumber())).orElse(true)
                && Optional.ofNullable(request.getStatus())
                .map(status -> status == booking.getStatus()).orElse(true)
                && Optional.ofNullable(request.getPaymentStatus())
                .map(status -> status == booking.getPaymentStatus()).orElse(true)
                && Optional.ofNullable(request.getIsGroupBooking())
                .map(isGroup -> isGroup.equals(booking.getIsGroupBooking())).orElse(true)
                && Optional.ofNullable(request.getBookingSource())
                .map(source -> source.equals(booking.getBookingSource())).orElse(true);
    }

    private Page<BookingResponse> createPageFromList(
            List<Booking> bookings, Pageable pageable) {

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), bookings.size());

        List<BookingResponse> pageContent = bookings.subList(start, end).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, bookings.size());
    }

    private Integer countBookingsByStatus(List<Booking> bookings, BookingStatus status) {
        return (int) bookings.stream()
                .filter(b -> b.getStatus() == status)
                .count();
    }
}