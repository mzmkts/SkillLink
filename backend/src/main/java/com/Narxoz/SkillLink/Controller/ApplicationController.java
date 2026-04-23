package com.Narxoz.SkillLink.Controller;

import com.Narxoz.SkillLink.Dto.ApplicationDto;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public List<ApplicationDto> getAllApplications() {
        return applicationService.getApplications();
    }

    @GetMapping("/{id}")
    public ApplicationDto getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id);
    }

    @PostMapping
    public void createApplication(@RequestParam Long projectId) {
        applicationService.createApplication(projectId);
    }
    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id,
                             @RequestParam String status) {

        applicationService.updateApplicationStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
    }
}