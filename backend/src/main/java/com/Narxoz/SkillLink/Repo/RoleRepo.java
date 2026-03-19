package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepo extends JpaRepository<Role, Long> {
    Role getRoleByName(String name);
}
