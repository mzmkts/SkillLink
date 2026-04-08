package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ApplicationCreateDto;
import com.Narxoz.SkillLink.Dto.ApplicationResponseDto;
import com.Narxoz.SkillLink.Model.Application;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "student", source = "student")
    @Mapping(target = "project", source = "project")
    Application toEntity(ApplicationCreateDto dto, User student, Project project);

    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "projectTitle", source = "project.title")
    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    ApplicationResponseDto toDto(Application application);
}
