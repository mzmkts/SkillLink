package com.Narxoz.SkillLink.Mapper;

import com.Narxoz.SkillLink.Dto.ResumeDto;
import com.Narxoz.SkillLink.Model.Resume;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ResumeMapper {

    ResumeDto toDTO(Resume resume);

    Resume toEntity(ResumeDto dto);

    List<ResumeDto> toDTOList(List<Resume> list);
}