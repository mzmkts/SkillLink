package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Mapper.UserMapper;
import com.Narxoz.SkillLink.Model.Role;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.RoleRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RoleRepo roleRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAll() {
        List<User> users = userRepo.findAll();
        List<UserDto> userDtos = userMapper.toDtoList(users);
        return userDtos;
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
            List<Role> roles = List.of(roleRepo.getRoleByName("ROLE_USER"));
            user.setFirstName(userDto.getFirstNameDto());
            user.setLastName(userDto.getLastNameDto());
            user.setEmail(userDto.getEmailDto());
            user.setPassword(encodedPassword);
            user.setRoles(roles);
            userRepo.save(user);
        }
    }

    public void updateUser(Long id, UserDto userDto) {
        User existingUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        existingUser.setFirstName(userDto.getFirstNameDto());
        existingUser.setLastName(userDto.getLastNameDto());
        existingUser.setEmail(userDto.getEmailDto());
        existingUser.setPassword(passwordEncoder.encode(userDto.getPasswordDto()));
        existingUser.setRoles(userDto.getRoles());
        userRepo.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    @Override
    public User loadUserByUsername(String email) {
        User user = userRepo.getByEmail(email);
        if (Objects.nonNull(user)) {
            return user;
        }
        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
