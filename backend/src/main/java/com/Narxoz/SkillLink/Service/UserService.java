package com.Narxoz.SkillLink.Service;


import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Model.User;

import java.util.List;

public interface UserService {
    List<UserDto> getAll();

    UserDto getById(Long id);

    void register(UserDto userDto);

    void updateUser(Long id, User user);

    void deleteUser(Long id);
}
