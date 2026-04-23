package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepo extends JpaRepository<Resume, Long> {
    List<Resume> findAllByUserUserId(Long userId);
}
