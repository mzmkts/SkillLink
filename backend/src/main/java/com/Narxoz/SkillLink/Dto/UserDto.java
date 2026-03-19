package com.Narxoz.SkillLink.Dto;

import com.Narxoz.SkillLink.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


public class UserDto {
    private String userIdDto;
    private String firstNameDto;
    private String lastNameDto;
    private String passwordDto;
    private String emailDto;
    private List<Role> roles;
}
