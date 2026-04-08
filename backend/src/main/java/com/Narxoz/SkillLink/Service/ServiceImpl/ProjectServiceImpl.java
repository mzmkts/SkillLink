package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Mapper.ProjectMapper;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ProjectRepo;
import com.Narxoz.SkillLink.Service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectRepo projectRepo;

    @Override
    public List<ProjectDto> getProjects() {
        List<Project> projects = projectRepo.findAll();
        List<ProjectDto> projectDtos = projectMapper.toDtoList(projects);
        return projectDtos;
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        return  projectMapper.toDto(projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found with id: " + id)));
    }

    public void createProject(ProjectDto projectDto, User owner) {
        Project project = projectMapper.toEntity(projectDto);
        project.setOwner(owner);
        projectRepo.save(project);
    }

    @Override
    public void updateProject(Long id, ProjectDto projectDto, User owner) {

        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setTitle(projectDto.getTitle());
        project.setDescription(projectDto.getDescription());
        project.setCategory(projectDto.getCategory());

        project.setOwner(owner);

        projectRepo.save(project);
    }
    @Override
    public void deleteProject(Long id) {
        if (!projectRepo.existsById(id)) {
            throw new RuntimeException("Project not found with id: " + id);
        }

        projectRepo.deleteById(id);
    }
}
