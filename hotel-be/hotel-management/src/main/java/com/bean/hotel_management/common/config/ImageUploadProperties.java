package com.bean.hotel_management.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class ImageUploadProperties {
    private long maxFileSize;
    private List<String> allowedExtensions;
    private String defaultFolder;
    private String quality;
    private boolean autoFormat;
}
