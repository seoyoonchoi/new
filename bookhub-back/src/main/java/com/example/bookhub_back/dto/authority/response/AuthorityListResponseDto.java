package com.example.bookhub_back.dto.authority.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorityListResponseDto {
    private Long authorityId;
    private String authorityName;
}
