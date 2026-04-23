package com.Narxoz.SkillLink.Service;

import com.Narxoz.SkillLink.Dto.ResumeDto;
import com.Narxoz.SkillLink.Model.Resume;

import java.util.List;

public interface ResumeService {

    ResumeDto createResume(Long userId, ResumeDto dto);

    ResumeDto getById(Long id);

    List<ResumeDto> getAllByUserId(Long userId);

    ResumeDto updateResume(Long id, ResumeDto dto);

    void deleteResume(Long id);
}