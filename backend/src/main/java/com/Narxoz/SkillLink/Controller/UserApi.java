package com.Narxoz.SkillLink.Controller;

import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Model.User;
import com.Narxoz.SkillLink.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserApi {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String name,
                                    @RequestParam(required = false) String surname,
                                    @RequestParam(required = false) String school,
                                    @RequestParam(required = false) String skill){
        return new ResponseEntity<>(userService.getAll(name, surname, school, skill), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id){
        return new ResponseEntity<>(userService.getById(id), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserDto userDto){
        userService.updateUser(id, userDto);
        return new  ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id){
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
