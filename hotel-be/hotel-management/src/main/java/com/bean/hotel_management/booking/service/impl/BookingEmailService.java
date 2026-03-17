package com.bean.hotel_management.booking.service.impl;

import com.bean.hotel_management.booking.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.hotel.name:Luxury Hotel}")
    private String hotelName;

    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            String subject = "Xác nhận đặt phòng #" + booking.getBookingNumber();
            String htmlContent = buildBookingConfirmationEmail(booking);

            sendHtmlEmail(booking.getUserEmail(), subject, htmlContent);
            log.info("Booking confirmation email sent: {}", booking.getBookingNumber());
        } catch (Exception e) {
            log.error("Failed to send booking confirmation: {}", e.getMessage());
        }
    }

    @Async
    public void sendCheckInReminder(Booking booking) {
        try {
            String subject = "Nhắc nhở check-in - " + hotelName;
            String content = String.format(
                    "Kính gửi %s,\n\nĐây là lời nhắc check-in cho booking #%s vào ngày %s.\n\nTrân trọng,\n%s",
                    booking.getUserFullName(),
                    booking.getBookingNumber(),
                    booking.getCheckInDate(),
                    hotelName
            );

            sendHtmlEmail(booking.getUserEmail(), subject, content);
        } catch (Exception e) {
            log.error("Failed to send reminder: {}", e.getMessage());
        }
    }

    private String buildBookingConfirmationEmail(Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        return String.format("""
                        <!DOCTYPE html>
                        <html>
                        <body style='font-family: Arial, sans-serif;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                                <h2 style='color: #2c3e50;'>Xác nhận đặt phòng</h2>
                                <p>Kính gửi %s,</p>
                                <p>Cảm ơn bạn đã đặt phòng tại %s!</p>
                        
                                <div style='background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                                    <h3>Thông tin đặt phòng</h3>
                                    <p><strong>Mã đặt phòng:</strong> %s</p>
                                    <p><strong>Phòng:</strong> %s - %s</p>
                                    <p><strong>Check-in:</strong> %s</p>
                                    <p><strong>Check-out:</strong> %s</p>
                                    <p><strong>Số đêm:</strong> %d</p>
                                    <p><strong>Số khách:</strong> %d người</p>
                                    <p><strong>Tổng tiền:</strong> %,.0f VNĐ</p>
                                </div>
                        
                                <p>Vui lòng mang theo CMND/CCCD khi check-in.</p>
                                <p>Trân trọng,<br>%s</p>
                            </div>
                        </body>
                        </html>
                        """,
                booking.getUserFullName(),
                hotelName,
                booking.getBookingNumber(),
                booking.getRoomNumber(),
                booking.getRoomName(),
                booking.getCheckInDate().format(dateFormatter),
                booking.getCheckOutDate().format(dateFormatter),
                booking.getNumberOfNights(),
                booking.getNumberOfGuests(),
                booking.getTotalAmount(),
                hotelName
        );
    }

    private void sendHtmlEmail(String to, String subject, String content)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }
}