package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepo extends JpaRepository<Project, Long> {
    Project getProjectByTitle(String title);
}
