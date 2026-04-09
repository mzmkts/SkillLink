package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "userIdDto", source = "userId")
    @Mapping(target = "firstNameDto", source = "firstName")
    @Mapping(target = "lastNameDto", source = "lastName")
    @Mapping(target = "passwordDto", source = "password")
    @Mapping(target = "emailDto", source = "email")
    @Mapping(target = "roles", source = "roles")
    @Mapping(target = "skills", expression = "java(mapSkills(user.getSkills()))")
    UserDto toDto(User user);

    @Mapping(target = "userId", source = "userIdDto")
    @Mapping(target = "firstName", source = "firstNameDto")
    @Mapping(target = "lastName", source = "lastNameDto")
    @Mapping(target = "password", source = "passwordDto")
    @Mapping(target = "email", source = "emailDto")
    @Mapping(target = "roles", source = "roles")
    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    User toEntity(UserDto userDto);

    List<UserDto> toDtoList(List<User> users);

    default List<String> mapSkills(List<Skill> skills) {
        if (skills == null) return null;
        return skills.stream()
                .map(Skill::getName)
                .toList();
    }
}
