package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Config.ProjectSpecification;
import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Mapper.ProjectMapper;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.ProjectStatus;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ProjectRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectRepo projectRepo;
    private final UserRepo userRepo;

    @Override
    public List<ProjectDto> getProjects(String title, String category) {
        Specification<Project> spec = Specification.where(ProjectSpecification.hasTitle(title)).and(ProjectSpecification.hasCategory(category));
        List<Project> projects = projectRepo.findAll(spec);
        List<ProjectDto> projectDtos = projectMapper.toDtoList(projects);
        return projectDtos;
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        return  projectMapper.toDto(projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found with id: " + id)));
    }

    @Override
    public void createProject(ProjectDto dto) {

        Long userId = ((User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal())
                .getUserId();

        User owner = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        project.setOwner(owner);

        projectRepo.save(project);
    }

    @Override
    public void updateProject(Long id, ProjectDto dto) {

        Long userId = ((User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal())
                .getUserId();

        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 🔐 защита: только владелец
        if (!project.getOwner().getUserId().equals(userId)) {
            throw new RuntimeException("No access");
        }

        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));

        projectRepo.save(project);
    }
    @Override
    public void deleteProject(Long id) {

        Long userId = ((User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal())
                .getUserId();

        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getUserId().equals(userId)) {
            throw new RuntimeException("No access");
        }

        projectRepo.delete(project);
    }
}
