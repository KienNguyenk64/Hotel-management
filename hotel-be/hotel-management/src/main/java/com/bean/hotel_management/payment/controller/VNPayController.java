package com.bean.hotel_management.payment.controller;

import com.bean.hotel_management.booking.dto.request.PaymentRequest;
import com.bean.hotel_management.booking.dto.response.BookingResponse;
import com.bean.hotel_management.booking.model.PaymentMethod;
import com.bean.hotel_management.booking.service.IBookingService;
import com.bean.hotel_management.common.dto.ApiResponse;
import com.bean.hotel_management.payment.config.VNPayConfig;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    private final VNPayConfig vnPayConfig;
    private final IBookingService bookingService;

    @PostMapping("/create-url")
    public ResponseEntity<ApiResponse> createPaymentUrl(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {

        String bookingId = payload.get("bookingId");
        if (bookingId == null || bookingId.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Booking ID rỗng hoặc không hợp lệ."));
        }

        // Lấy thông tin Booking từ DB để lấy số tiền chính xác
        BookingResponse booking = bookingService.getBookingById(bookingId);
        long amount = (long) (booking.getTotalAmount() * 100); // VNPay yêu cầu số tiền * 100

        String vnp_Version = vnPayConfig.getVersion();
        String vnp_Command = vnPayConfig.getCommand();
        String orderType = "other";
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8) + "-" + bookingId;
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);

        String vnp_TmnCode = vnPayConfig.getTmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don dat phong " + booking.getBookingNumber());
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;

        Map<String, String> responseData = new HashMap<>();
        responseData.put("vnpayUrl", paymentUrl);

        return ResponseEntity.ok(ApiResponse.success("URL thanh toán tạo thành công", responseData));
    }

    @GetMapping("/return")
    public ResponseEntity<Void> paymentReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }
        String signValue = VNPayConfig.hashAllFields(fields, vnPayConfig.getSecretKey());

        // Extract bookingId (TxnRef contains logic: RandomNumber-BookingId)
        String txnRef = request.getParameter("vnp_TxnRef");
        String bookingId = null;
        if (txnRef != null && txnRef.contains("-")) {
            bookingId = txnRef.substring(txnRef.indexOf("-") + 1);
        }

        HttpHeaders headers = new HttpHeaders();
        String frontendRedirectUrl = "http://localhost:5173/my-bookings";

        try {
            if (signValue.equals(vnp_SecureHash)) {
                if ("00".equals(request.getParameter("vnp_ResponseCode"))) {
                    // Cập nhật trạng thái
                    PaymentRequest paymentReq = PaymentRequest.builder()
                            .paymentMethod(PaymentMethod.E_WALLET)
                            .paymentTransactionId(request.getParameter("vnp_TransactionNo"))
                            .build();

                    if (bookingId != null) {
                        bookingService.processPayment(bookingId, paymentReq);
                    }

                    // Thành công
                    headers.setLocation(URI.create(frontendRedirectUrl + "?paymentStatus=success&bookingId=" + bookingId));
                } else {
                    // Thất bại
                    headers.setLocation(URI.create(frontendRedirectUrl + "?paymentStatus=failed&bookingId=" + bookingId));
                }
            } else {
                // Invalid signature
                headers.setLocation(URI.create(frontendRedirectUrl + "?paymentStatus=invalid&bookingId=" + bookingId));
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý trả về VNPay: {}", e.getMessage());
            headers.setLocation(URI.create(frontendRedirectUrl + "?paymentStatus=error&bookingId=" + bookingId));
        }

        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
