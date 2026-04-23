package com.Narxoz.SkillLink.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class ResumeDto {
    private Long id;
    private String title;
    private String content;
}