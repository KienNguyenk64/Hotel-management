package com.bean.hotel_management.review.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReviewRequest {

    @Max(5) @Min(1)
    private int rating;

    @NotBlank(message = "comment không được để trống")
    private String comment;

    @NotBlank(message = "roomID không được để trống")
    private String roomId;
}
