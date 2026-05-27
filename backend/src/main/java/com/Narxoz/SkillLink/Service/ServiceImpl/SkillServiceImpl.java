package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Repo.SkillRepo;
import com.Narxoz.SkillLink.Service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class SkillServiceImpl implements SkillService {
    private final SkillRepo skillRepo;

    public List<Skill> findAll() {
        return skillRepo.findAll();
    }
}
