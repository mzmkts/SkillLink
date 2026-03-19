package com.Narxoz.SkillLink.Repo;

import com.Narxoz.SkillLink.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User getByEmail(String email);
}
