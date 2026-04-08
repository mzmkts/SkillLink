package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepo extends JpaRepository<Application, Long> {
    Application getApplicationByName(String name);
}
