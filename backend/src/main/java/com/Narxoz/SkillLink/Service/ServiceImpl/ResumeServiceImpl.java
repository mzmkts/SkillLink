package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Dto.ResumeDto;
import com.Narxoz.SkillLink.Dto.SkillDto;
import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Mapper.ResumeMapper;
import com.Narxoz.SkillLink.Model.Resume;
import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.ResumeRepo;
import com.Narxoz.SkillLink.Repo.SkillRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.ResumeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepo resumeRepo;
    private final UserRepo userRepo;
    private final SkillRepo skillRepo;
    private final ResumeMapper resumeMapper;


    @Override
    public List<ResumeDto> getAllResumes() {
        List<Resume> resumes = resumeRepo.findAll();

        return resumes.stream()
                .map(resume -> {
                    ResumeDto dto = new ResumeDto();
                    dto.setId(resume.getId());
                    dto.setTitle(resume.getTitle());
                    dto.setContent(resume.getContent());

                    if (resume.getUser() != null) {
                        UserDto userDto = new UserDto();

                        userDto.setUserIdDto(resume.getUser().getUserId());
                        userDto.setFirstNameDto(resume.getUser().getFirstName());
                        userDto.setLastNameDto(resume.getUser().getLastName());
                        userDto.setSchool(resume.getUser().getSchool());

                        dto.setUserDto(userDto);
                    }

                    // Маппим привязанные к резюме навыки
                    if (resume.getSkills() != null) {
                        List<SkillDto> skillDtos = resume.getSkills().stream()
                                .map(skill -> new SkillDto(skill.getId(), skill.getName()))
                                .collect(Collectors.toList());
                        dto.setSkills(skillDtos);
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResumeDto createResume(Long userId, ResumeDto dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeMapper.toEntity(dto);
        resume.setUser(user);

        if (dto.getSkills() != null) {
            List<Long> skillIds = dto.getSkills().stream()
                    .map(skillDto -> skillDto.getId())
                    .filter(skillId -> skillId != null)
                    .toList();

            List<Skill> dbSkills = skillRepo.findAllById(skillIds);
            resume.setSkills(dbSkills);
        }

        Resume savedResume = resumeRepo.save(resume);
        ResumeDto resultDto = resumeMapper.toDTO(savedResume);

        if (user != null) {
            UserDto userDto = new UserDto();
            userDto.setUserIdDto(user.getUserId());
            userDto.setFirstNameDto(user.getFirstName());
            userDto.setLastNameDto(user.getLastName());
            userDto.setSchool(user.getSchool());
            resultDto.setUserDto(userDto);
        }

        return resultDto;
    }

    @Override
    public ResumeDto getById(Long id) {
        Resume resume = resumeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        ResumeDto dto = resumeMapper.toDTO(resume);

        if (dto.getUserDto() == null && resume.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setUserIdDto(resume.getUser().getUserId()); // ИСПРАВЛЕНО: getUserId() вместо getId()
            userDto.setFirstNameDto(resume.getUser().getFirstName());
            userDto.setLastNameDto(resume.getUser().getLastName());
            userDto.setSchool(resume.getUser().getSchool());
            dto.setUserDto(userDto);
        }

        return dto;
    }

    @Override
    public List<ResumeDto> getAllByUserId(Long userId) {
        List<Resume> resumes = resumeRepo.findAllByUserUserId(userId);
        List<ResumeDto> dtoList = resumeMapper.toDTOList(resumes);

        for (int i = 0; i < resumes.size(); i++) {
            Resume resume = resumes.get(i);
            ResumeDto dto = dtoList.get(i);
            if (dto.getUserDto() == null && resume.getUser() != null) {
                UserDto userDto = new UserDto();
                userDto.setUserIdDto(resume.getUser().getUserId());
                userDto.setFirstNameDto(resume.getUser().getFirstName());
                userDto.setLastNameDto(resume.getUser().getLastName());
                userDto.setSchool(resume.getUser().getSchool());
                dto.setUserDto(userDto);
            }
        }
        return dtoList;
    }

    @Override
    @Transactional
    public ResumeDto updateResume(Long id, ResumeDto dto) {
        Resume existing = resumeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (dto.getSkills() != null) {
            List<Long> skillIds = dto.getSkills().stream()
                    .map(skillDto -> skillDto.getId())
                    .filter(skillId -> skillId != null)
                    .toList();

            List<Skill> dbSkills = skillRepo.findAllById(skillIds);

            existing.setSkills(dbSkills);
        }

        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent());

        Resume savedResume = resumeRepo.save(existing);

        ResumeDto resultDto = resumeMapper.toDTO(savedResume);

        if (resultDto.getUserDto() == null && existing.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setUserIdDto(existing.getUser().getUserId());
            userDto.setFirstNameDto(existing.getUser().getFirstName());
            userDto.setLastNameDto(existing.getUser().getLastName());
            userDto.setSchool(existing.getUser().getSchool());
            resultDto.setUserDto(userDto);
        }

        return resultDto;
    }
    @Override
    public void deleteResume(Long id) {
        resumeRepo.deleteById(id);
    }

    @Transactional
    public void addSkillToResume(Long resumeId, Long skillId) {
        Resume resume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Резюме не найдено с id: " + resumeId));

        Skill skill = skillRepo.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Навык не найден с id: " + skillId));

        if (!resume.getSkills().contains(skill)) {
            resume.getSkills().add(skill);
            resumeRepo.save(resume);
        }
    }

    @Transactional
    public void removeSkillFromResume(Long resumeId, Long skillId) {
        Resume resume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Резюме не найдено с id: " + resumeId));

        Skill skill = skillRepo.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Навык не найден с id: " + skillId));

        resume.getSkills().remove(skill);
        resumeRepo.save(resume);
    }

    @Transactional
    public void updateResumeSkills(Long resumeId, List<Long> skillIds) {
        Resume resume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Резюме не найдено с id: " + resumeId));

        List<Skill> newSkills = skillRepo.findAllById(skillIds);

        resume.setSkills(newSkills);
        resumeRepo.save(resume);
    }
}