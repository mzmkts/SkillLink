package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ResumeDto;
import com.Narxoz.SkillLink.Model.Resume;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ResumeMapper {

    @Mapping(target = "userDto", ignore = true)
    ResumeDto toDTO(Resume resume);

    @Mapping(target = "user", ignore = true)
    Resume toEntity(ResumeDto dto);

    List<ResumeDto> toDTOList(List<Resume> list);
}