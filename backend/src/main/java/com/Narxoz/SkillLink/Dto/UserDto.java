package com.Narxoz.SkillLink.Dto;

import com.Narxoz.SkillLink.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long userIdDto;
    private String firstNameDto;
    private String lastNameDto;
    private String passwordDto;
    private String emailDto;
    private String school;
    private List<String> skills;
    private List<Role> roles;
}
