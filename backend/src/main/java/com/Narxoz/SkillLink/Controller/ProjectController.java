package com.Narxoz.SkillLink.Controller;

import com.Narxoz.SkillLink.Dto.ProjectDto;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectDto> getAllProjects(@RequestParam(required = false) String title,
                                           @RequestParam(required = false) String category) {
        return projectService.getProjects(title, category);
    }

    @GetMapping("/{id}")
    public ProjectDto getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @PostMapping
    public void createProject(@RequestBody ProjectDto projectDto) {
        // ⚠️ временно (пока нет auth)
        User owner = new User();
        owner.setUserId(projectDto.getOwnerId());

        projectService.createProject(projectDto, owner);
    }

    @PutMapping("/{id}")
    public void updateProject(@PathVariable Long id,
                              @RequestBody ProjectDto projectDto) {

        User owner = new User();
        owner.setUserId(projectDto.getOwnerId());

        projectService.updateProject(id, projectDto, owner);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}