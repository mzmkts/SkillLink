package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ProjectCreateDto;
import com.Narxoz.SkillLink.Dto.ProjectResponseDto;
import com.Narxoz.SkillLink.Model.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "OPEN")
    @Mapping(target = "owner", ignore = true)
    Project toEntity(ProjectCreateDto dto);

    @Mapping(target = "ownerName", source = "owner.name")
    @Mapping(target = "status", expression = "java(project.getStatus().name())")
    ProjectResponseDto toDto(Project project);
}