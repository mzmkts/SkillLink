package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepo extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    Project getProjectByTitle(String title);
    List<Project> findByOwner_UserId(Long userId);
}
