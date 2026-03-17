package com.bean.hotel_management.auth.service.impl;

import com.bean.hotel_management.user.model.AuthProvider;
import com.bean.hotel_management.user.model.Role;
import com.bean.hotel_management.user.model.User;
import com.bean.hotel_management.user.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${hotel.admin.username}")
    private String adminUsername;

    @Value("${hotel.admin.email}")
    private String adminEmail;

    @Value("${hotel.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .username(adminUsername)
                    .fullName("The Hotel Moonelia")
                    .cccdNumber("000000000")
                    .phoneNumber("0000000000")
                    .address("Admin Address")
                    .password(passwordEncoder.encode(adminPassword))
                    .avatarUrl("https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/1a/ea/54/hotel-presidente-4s.jpg?w=1400&h=800&s=1")
                    .role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .isActive(true)
                    .isLocked(false)
                    .createdDate(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            log.info("Admin account created: {}", adminEmail);
        }
    }
}