package com.bean.hotel_management.chatbot.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryStats {
    private String category;
    private Integer count;
    private Double percentage;
}
