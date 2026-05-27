package com.Narxoz.SkillLink.Controller;

import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SkillController {
    private final SkillService skillService;

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.findAll();
    }
}