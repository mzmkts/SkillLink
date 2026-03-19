package com.Narxoz.SkillLink.Controller;

import com.Narxoz.SkillLink.Dto.UserDto;
import com.Narxoz.SkillLink.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class UserApi {
    private final UserService userService;

    @GetMapping("/user")
    public ResponseEntity<?> getAll(){
        return new ResponseEntity<>(userService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id){
        return new ResponseEntity<>(userService.getById(id), HttpStatus.OK);
    }

    @PostMapping("/user/register")
    public ResponseEntity<?> register(@RequestBody UserDto userDto){
        userService.register(userDto);
        return new  ResponseEntity<>(HttpStatus.OK);
    }
//    @PutMapping

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id){
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
