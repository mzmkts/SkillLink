package com.Narxoz.SkillLink.Service;


import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;

import java.util.List;

public interface ProjectService {
    List<ProjectDto> getProjects(String title, String category);
    ProjectDto getProjectById(Long id);
    void createProject(ProjectDto projectCreateDto);
    void updateProject(Long id,ProjectDto projectDto);
    void deleteProject(Long id);
    List<ProjectDto> getProjectsByUserId(Long userId);
}
