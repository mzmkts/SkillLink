package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Dto.ResumeDto;
import com.Narxoz.SkillLink.Mapper.ResumeMapper;
import com.Narxoz.SkillLink.Model.Resume;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ResumeRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepo resumeRepo;
    private final UserRepo userRepo;
    private final ResumeMapper resumeMapper;

    @Override
    public ResumeDto createResume(Long userId, ResumeDto dto) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeMapper.toEntity(dto);
        resume.setUser(user);

        return resumeMapper.toDTO(resumeRepo.save(resume));
    }

    @Override
    public ResumeDto getById(Long id) {
        Resume resume = resumeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        return resumeMapper.toDTO(resume);
    }

    @Override
    public List<ResumeDto> getAllByUserId(Long userId) {
        return resumeMapper.toDTOList(
                resumeRepo.findAllByUserUserId(userId)
        );
    }

    @Override
    public ResumeDto updateResume(Long id, ResumeDto dto) {

        Resume existing = resumeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent());

        return resumeMapper.toDTO(resumeRepo.save(existing));
    }

    @Override
    public void deleteResume(Long id) {
        resumeRepo.deleteById(id);
    }
}