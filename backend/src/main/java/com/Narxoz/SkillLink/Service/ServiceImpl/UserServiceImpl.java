package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Config.UserSpecification;
import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Mapper.UserMapper;
import com.Narxoz.SkillLink.Model.Role;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.RoleRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.UserService;
import jakarta.transaction.Transactional;
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
            user.setRoles(roles);
            user.setAbout(userDto.getAbout());

            userRepo.save(user);
        } else {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
    }

    @Override
    @Transactional
    public void updateUser(Long id, UserDto userDto) {
        User existingUser = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setFirstName(userDto.getFirstNameDto());
        existingUser.setLastName(userDto.getLastNameDto());
        existingUser.setSchool(userDto.getSchool());
        existingUser.setAbout(userDto.getAbout());

        if (userDto.getEmailDto() != null) {
            existingUser.setEmail(userDto.getEmailDto());
        }

        userRepo.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    @Override
    public UserDto login(String email, String password) {
        User user = userRepo.getByEmail(email);

        if (user == null) {
            throw new RuntimeException("Пользователь с email " + email + " не найден");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Неверный пароль");
        }

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