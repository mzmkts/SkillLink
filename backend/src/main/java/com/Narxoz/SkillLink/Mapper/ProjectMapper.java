package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(source = "owner.userId", target = "ownerId")
    @Mapping(source = "owner.email", target = "ownerName")
    @Mapping(source = "status", target = "status")
    ProjectDto toDto(Project project);

    @Mapping(target = "owner", ignore = true)
    Project toEntity(ProjectDto dto);

    List<ProjectDto> toDtoList(List<Project> projects);
}