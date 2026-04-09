package com.Narxoz.SkillLink.Repo;


import com.Narxoz.SkillLink.Model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillRepo extends JpaRepository<Skill, Long> {
    Optional<Skill> findByName(String name);
}
