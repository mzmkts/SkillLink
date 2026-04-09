package com.Narxoz.SkillLink.Config;

import com.Narxoz.SkillLink.Model.Project;
import org.springframework.data.jpa.domain.Specification;

public class ProjectSpecification {

    public static Specification<Project> hasTitle(String title) {
        return (root, query, cb) ->
                title == null ? null :
                        cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Project> hasCategory(String category) {
        return (root, query, cb) ->
                category == null ? null :
                        cb.equal(root.get("category"), category);
    }

    public static Specification<Project> hasOwner(Long ownerId) {
        return (root, query, cb) ->
                ownerId == null ? null :
                        cb.equal(root.get("owner").get("userId"), ownerId);
    }
}