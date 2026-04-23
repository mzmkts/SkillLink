package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Config.ProjectSpecification;
import com.Narxoz.SkillLink.Config.UserSpecification;
import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Mapper.UserMapper;
import com.Narxoz.SkillLink.Model.Project;
import com.Narxoz.SkillLink.Model.Role;
import com.Narxoz.SkillLink.Model.Skill;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.RoleRepo;
import com.Narxoz.SkillLink.Repo.SkillRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final SkillRepo skillRepo;

    @Override
    public List<UserDto> getAll(String name, String surname, String school, String skill) {
        Specification<User> spec = Specification.where(UserSpecification
                .hasFirstName(name)
                .and(UserSpecification.hasLastName(surname))
                .and(UserSpecification.hasSchool(school))
                .and(UserSpecification.hasSkill(skill)));
        List<User> users = userRepo.findAll(spec);
        return userMapper.toDtoList(users);
    }

    @Override
    public UserDto getById(Long id) {
        return userMapper.toDto(userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id)));
    }

    @Override
    public void register(UserDto userDto) {
        User check = userRepo.getByEmail(userDto.getEmailDto());
        if (check == null) {
            String encodedPassword = passwordEncoder.encode(userDto.getPasswordDto());
            User user = new User();
            List<Role> roles = List.of(roleRepo.getRoleByName("ROLE_STUDENT"));
            user.setFirstName(userDto.getFirstNameDto());
            user.setLastName(userDto.getLastNameDto());
            user.setEmail(userDto.getEmailDto());
            user.setPassword(encodedPassword);
            user.setSchool(userDto.getSchool());
            List<Skill> skills = new java.util.ArrayList<>();
            if (userDto.getSkills() != null && !userDto.getSkills().isEmpty()) {
                skills = userDto.getSkills().stream()
                        .map(name -> skillRepo.findByName(name)
                                .orElseGet(() -> {
                                    Skill s = new Skill();
                                    s.setName(name);
                                    return skillRepo.save(s);
                                }))
                        .toList();
            }
            user.setSkills(skills);
            user.setRoles(roles);
            userRepo.save(user);
        } else {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
    }

    @Override
    public void updateUser(Long id, UserDto userDto) {
        User existingUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        existingUser.setFirstName(userDto.getFirstNameDto());
        existingUser.setLastName(userDto.getLastNameDto());
        existingUser.setEmail(userDto.getEmailDto());
        existingUser.setPassword(passwordEncoder.encode(userDto.getPasswordDto()));
        existingUser.setRoles(userDto.getRoles());
        existingUser.setSchool(userDto.getSchool());
        List<Skill> skills = new java.util.ArrayList<>();
        if (userDto.getSkills() != null && !userDto.getSkills().isEmpty()) {
            skills = userDto.getSkills().stream()
                    .map(name -> skillRepo.findByName(name)
                            .orElseGet(() -> {
                                Skill s = new Skill();
                                s.setName(name);
                                return skillRepo.save(s);
                            }))
                    .toList();
        }

        existingUser.setSkills(skills);
        userRepo.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    @Override
    public UserDto login(String email, String password) {
        User user = userRepo.getByEmail(email);

        // 1. Проверяем, существует ли пользователь
        if (user == null) {
            throw new RuntimeException("Пользователь с email " + email + " не найден");
        }

        // 2. Проверяем пароль (сравниваем чистый пароль из формы с зашифрованным в БД)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Неверный пароль");
        }

        // 3. Возвращаем UserDto с помощью твоего маппера
        return userMapper.toDto(user);
    }

    @Override
    public User loadUserByUsername(String email) {
        User user = userRepo.getByEmail(email);
        if (Objects.nonNull(user)) {
            return user;
        }
        throw new UsernameNotFoundException("User not found with email: " + email);
    }
    @Override
    public void updateAvatar(Long id, String avatarUrl) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAvatarUrl(avatarUrl);
        userRepo.save(user);
    }
}