package com.Narxoz.SkillLink.Controller;

import com.Narxoz.SkillLink.Dto.ResumeDto;
import com.Narxoz.SkillLink.Model.Resume;
import com.Narxoz.SkillLink.Service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/{userId}")
    public ResumeDto create(@PathVariable Long userId,
                            @RequestBody ResumeDto dto) {
        return resumeService.createResume(userId, dto);
    }

    @GetMapping("/{id}")
    public ResumeDto getById(@PathVariable Long id) {
        return resumeService.getById(id);
    }

    @GetMapping("/user/{userId}")
    public List<ResumeDto> getByUser(@PathVariable Long userId) {
        return resumeService.getAllByUserId(userId);
    }

    @PutMapping("/{id}")
    public ResumeDto update(@PathVariable Long id,
                            @RequestBody ResumeDto dto) {
        return resumeService.updateResume(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        resumeService.deleteResume(id);
    }
}