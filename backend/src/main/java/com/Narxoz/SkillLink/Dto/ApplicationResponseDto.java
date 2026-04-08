package com.Narxoz.SkillLink.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {
    private Long id;
    private String studentName;
    private String projectTitle;
    private String status;
}
