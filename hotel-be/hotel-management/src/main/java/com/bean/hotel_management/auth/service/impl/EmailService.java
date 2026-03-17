package com.bean.hotel_management.auth.service.impl;

import com.bean.hotel_management.common.constants.EmailTemplates;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Gửi email xác thực tài khoản (async)
    @Async
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            String verificationLink = frontendUrl + "/#/verify-email?token=" + verificationToken;
            String htmlContent = EmailTemplates.getVerificationEmailTemplate(verificationLink);

            sendHtmlEmail(toEmail, "Xác thực tài khoản - Hotel Management", htmlContent);

            log.info("Verification email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực");
        }
    }

    // Gửi email đặt lại mật khẩu (async)
    @Async
    public void sendResetPasswordEmail(String toEmail, String resetToken) {
        try {
            String resetLink = frontendUrl + "/#/reset-password?token=" + resetToken;
            String htmlContent = EmailTemplates.getResetPasswordEmailTemplate(resetLink);

            sendHtmlEmail(toEmail, "Đặt lại mật khẩu - Hotel Management", htmlContent);

            log.info("Reset password email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send reset password email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email reset mật khẩu");
        }
    }

    // Phương thức gửi email HTML
    private void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}