package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.ProjectApplication;
import com.Narxoz.SkillLink.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepo extends JpaRepository<ProjectApplication, Long> {
    List<ProjectApplication> findByStudentAndProject(User student, Project project);
}
