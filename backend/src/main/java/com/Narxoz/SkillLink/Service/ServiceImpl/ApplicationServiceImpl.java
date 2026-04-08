package com.Narxoz.SkillLink.Service.ServiceImpl;


import com.Narxoz.SkillLink.Dto.ApplicationDto;
import com.Narxoz.SkillLink.Mapper.ApplicationMapper;
import com.Narxoz.SkillLink.Model.ProjectApplication;
import com.Narxoz.SkillLink.Model.ApplicationStatus;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ApplicationRepo;
import com.Narxoz.SkillLink.Repo.ProjectRepo;
import com.Narxoz.SkillLink.Service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepo applicationRepo;
    private final ProjectRepo projectRepo;
    private final ApplicationMapper applicationMapper;

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
    public void createApplication(Long projectId, User student) {

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        ProjectApplication projectApplication = new ProjectApplication();
        projectApplication.setStudent(student);
        projectApplication.setProject(project);
        projectApplication.setStatus(ApplicationStatus.PENDING);

        applicationRepo.save(projectApplication);
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