package com.Narxoz.SkillLink.Service.ServiceImpl;

import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Mapper.UserMapper;
import com.Narxoz.SkillLink.Model.Role;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Repo.RoleRepo;
import com.Narxoz.SkillLink.Repo.UserRepo;
import com.Narxoz.SkillLink.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private UserRepo userRepo;
    private UserMapper userMapper;
    private RoleRepo roleRepo;


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
        if (check == null){
            User user = new User();
            List<Role> roles = List.of(roleRepo.getRoleByName("user"));
            user.setFirstName(userDto.getFirstNameDto());
            user.setLastName(userDto.getLastNameDto());
            user.setEmail(userDto.getEmailDto());
            user.setPassword(userDto.getPasswordDto());
            user.setRoles(roles);
            userRepo.save(user);
        }
    }

    @Override
    public void updateUser(Long id, User user) {

    }

    @Override
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }
}
