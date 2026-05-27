package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Config.ProjectSpecification;
import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Mapper.ProjectMapper;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.ProjectStatus;
import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ProjectRepo;
import com.Narxoz.SkillLink.Repo.SkillRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectRepo projectRepo;
    private final UserRepo userRepo;
    private final SkillRepo skillRepo;

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

        if (dto.getSkills() != null) {
            List<Skill> skills = dto.getSkills().stream()
                    .map(skillDto -> skillRepo.findById(skillDto.getId())
                            .orElseThrow(() -> new RuntimeException("Skill not found with id: " + skillDto.getId())))
                    .collect(Collectors.toList()); // Собираем в List
            project.setSkills(skills);
        }

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

        if (!project.getOwner().getUserId().equals(userId)) {
            throw new RuntimeException("No access");
        }

        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus()));

        if (dto.getSkills() != null) {
            List<Skill> updatedSkills = dto.getSkills().stream()
                    .map(skillDto -> skillRepo.findById(skillDto.getId())
                            .orElseThrow(() -> new RuntimeException("Skill not found with id: " + skillDto.getId())))
                    .collect(Collectors.toList()); // Собираем в List
            project.setSkills(updatedSkills);
        } else {
            project.getSkills().clear();
        }

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

    @Override
    public List<ProjectDto> getProjectsByUserId(Long userId) {
        List<Project> projects = projectRepo.findByOwner_UserId(userId);

        return projects.stream()
                .map(project -> {
                    ProjectDto dto = new ProjectDto();
                    dto.setId(project.getId());
                    dto.setTitle(project.getTitle());
                    dto.setDescription(project.getDescription());
                    dto.setStatus(project.getStatus().name());
                    dto.setOwnerId(project.getOwner().getUserId());
                    dto.setOwnerName(project.getOwner().getFirstName() + " " + project.getOwner().getLastName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
