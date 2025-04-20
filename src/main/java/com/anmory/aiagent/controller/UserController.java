package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Scripts;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.UserService;
import com.anmory.aiagent.utils.StringToDate;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午8:34
 */

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    UserService userService;
    @RequestMapping("/login")
    public User login(@RequestParam String userName,
                      @RequestParam String password,
                      @RequestParam(defaultValue = "1") int sex,
                      String email,
                      HttpSession session) {
        if(!StringUtils.hasLength(userName) || !StringUtils.hasLength(password)) {
            log.error("用户名或密码为空");
            return null;
        }
        User user = userService.getUserByName(userName);
        if(user == null) {
            log.error("用户名不存在:{}", userName);
            return null;
        }
        session.setAttribute("session_user_key", user);
        if(user.getPassword().equals(password)) {
            log.info("登录成功");
            return user;
        }
        log.error("密码错误");
        return null;
    }

    @RequestMapping("/register")
    public User register(@RequestParam String userName,
                         @RequestParam String password,
                         @RequestParam(defaultValue = "2000-01-01") String birth,
                         @RequestParam(defaultValue = "1") int sex,
                         String email) {
        if(!StringUtils.hasLength(userName) || !StringUtils.hasLength(password)) {
            log.error("用户名或密码为空");
            return null;
        }
        if(userService.getUserByName(userName) != null) {
            log.error("用户名已存在:{}", userName);
            return null;
        }
        Date date = StringToDate.toDate(birth);
        userService.insertUser(userName, password, date, sex, email);
        log.info("注册成功");
        return userService.getUserByName(userName);
    }
}
