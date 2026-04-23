package com.Narxoz.SkillLink.Service.ServiceImpl;


import com.Narxoz.SkillLink.Application;
import com.Narxoz.SkillLink.Dto.ApplicationDto;
import com.Narxoz.SkillLink.Mapper.ApplicationMapper;
import com.Narxoz.SkillLink.Model.ProjectApplication;
import com.Narxoz.SkillLink.Model.ApplicationStatus;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ApplicationRepo;
import com.Narxoz.SkillLink.Repo.ProjectRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepo applicationRepo;
    private final ProjectRepo projectRepo;
    private final ApplicationMapper applicationMapper;
    private final UserRepo userRepo;

    @Override
    public List<ApplicationDto> getApplications() {
        List<ProjectApplication> projectApplications = applicationRepo.findAll();
        List<ApplicationDto> applicationDtos = applicationMapper.toDtoList(projectApplications);
        return applicationDtos;
    }

    @Override
    public ApplicationDto getApplicationById(Long id) {
        ProjectApplication projectApplication = applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        return applicationMapper.toDto(projectApplication);
    }

    @Override
    public void createApplication(Long projectId) {
        Long userId = ((User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal())
                .getUserId();

        User student = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (applicationRepo.existsByStudent_UserIdAndProject_Id(
                student.getUserId(), projectId)) {

            throw new RuntimeException("You already applied to this project");
        }


        ProjectApplication application = new ProjectApplication();
        application.setStudent(student);
        application.setProject(project);
        application.setStatus(ApplicationStatus.PENDING);

        applicationRepo.save(application);
    }

    @Override
    public void updateApplicationStatus(Long id, String status) {

        ProjectApplication projectApplication = applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        projectApplication.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));

        applicationRepo.save(projectApplication);
    }

    @Override
    public void deleteApplication(Long id) {

        if (!applicationRepo.existsById(id)) {
            throw new RuntimeException("Application not found with id: " + id);
        }

        applicationRepo.deleteById(id);
    }
}