package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserMapperTest {
    @Autowired
    UserMapper userMapper;
    @Test
    void insertUser() {
        User user = new User();
        user.setUserName("test");
        user.setPassword("test");
        user.setBirth(new Date());
        user.setSex(1);
        user.setEmail("test@test.com");
        System.out.println(userMapper.insertUser(user));
    }
}