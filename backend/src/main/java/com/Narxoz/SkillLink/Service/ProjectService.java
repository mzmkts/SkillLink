package com.Narxoz.SkillLink.Service;


import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;

import java.util.List;

public interface ProjectService {
    List<ProjectDto> getProjects();
    ProjectDto getProjectById(Long id);
    void createProject(ProjectDto projectCreateDto, User owner);
    void updateProject(Long id, ProjectDto projectDto, User owner);
    void deleteProject(Long id);
}
