package com.Narxoz.SkillLink.Config;

import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Model.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> hasSchool(String school) {
        return (root, query, cb) ->
                school == null ? null :
                        cb.equal(cb.lower(root.get("school")), school.toLowerCase());
    }

    public static Specification<User> hasFirstName(String firstName) {
        return (root, query, cb) ->
                firstName == null ? null :
                        cb.like(cb.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%");
    }

    public static Specification<User> hasLastName(String lastName) {
        return (root, query, cb) ->
                lastName == null ? null :
                        cb.like(cb.lower(root.get("lastName")), "%" + lastName.toLowerCase() + "%");
    }

    public static Specification<User> hasSkill(String skill) {
        return (root, query, cb) -> {
            if (skill == null) return null;

            Join<User, Skill> join = root.join("skills", JoinType.LEFT);

            return cb.like(cb.lower(join.get("name")),
                    "%" + skill.toLowerCase() + "%");
        };
    }

    public static Specification<User> search(String name, String surname, String school, String skill) {
        return Specification.where(hasFirstName(name))
                .and(hasLastName(surname))
                .and(hasSchool(school))
                .and(hasSkill(skill));
    }
}