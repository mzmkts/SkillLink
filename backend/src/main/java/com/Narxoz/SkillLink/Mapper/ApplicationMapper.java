package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ApplicationDto;
import com.Narxoz.SkillLink.Model.ProjectApplication;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "student.email", target = "studentName")
    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "project.title", target = "projectTitle")
    @Mapping(source = "status", target = "status")
    ApplicationDto toDto(ProjectApplication application);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "project", ignore = true)
    ProjectApplication toEntity(ApplicationDto dto);

    List<ApplicationDto> toDtoList(List<ProjectApplication> applications);
}