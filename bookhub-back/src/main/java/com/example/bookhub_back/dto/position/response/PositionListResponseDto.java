package com.example.bookhub_back.dto.position.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionListResponseDto {
    private Long positionId;
    private String positionName;
}
