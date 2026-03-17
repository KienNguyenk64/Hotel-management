package com.bean.hotel_management.chatbot.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntentStats {
    private String intent;
    private Integer count;
    private Double averageConfidence;
}
