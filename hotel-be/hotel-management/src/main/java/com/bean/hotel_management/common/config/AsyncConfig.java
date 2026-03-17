package com.bean.hotel_management.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;


@Configuration
@EnableAsync
public class AsyncConfig {
    // Spring Boot sẽ tự động cấu hình ThreadPoolTaskExecutor
    // dựa trên properties: spring.task.execution.*
}