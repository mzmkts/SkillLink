package com.Narxoz.SkillLink.Service;


import com.Narxoz.SkillLink.Dto.ApplicationDto;
import com.Narxoz.SkillLink.Model.User;

import java.util.List;

public interface ApplicationService {

    List<ApplicationDto> getApplications();

    ApplicationDto getApplicationById(Long id);

    void createApplication(Long projectId, User student);

    void updateApplicationStatus(Long id, String status);

    void deleteApplication(Long id);
}