package com.Narxoz.SkillLink.Service;


import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Model.User;

import java.util.List;

public interface UserService {

    List<UserDto> getAll(String name, String surname, String school, String skill);

    UserDto getById(Long id);

    void register(UserDto userDto);

    void updateUser(Long id, UserDto userDto);

    void deleteUser(Long id);

    UserDto login(String email, String password);
}
