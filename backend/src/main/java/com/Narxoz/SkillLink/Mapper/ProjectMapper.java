package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Dto.SkillDto;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.Skill;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(source = "owner.userId", target = "ownerId")
    @Mapping(source = "owner.email", target = "ownerName")
    @Mapping(source = "status", target = "status")
    @Mapping(target = "skills", expression = "java(mapSkills(project.getSkills()))")
    ProjectDto toDto(Project project);

    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "skills", ignore = true)
    Project toEntity(ProjectDto dto);

    List<ProjectDto> toDtoList(List<Project> projects);

    default List<SkillDto> mapSkills(List<Skill> skills) {
        if (skills == null) return null;
        return skills.stream()
                .map(this::skillToSkillDto)
                .collect(Collectors.toList());
    }

    default SkillDto skillToSkillDto(Skill skill) {
        if (skill == null) return null;
        SkillDto dto = new SkillDto();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        return dto;
    }
}