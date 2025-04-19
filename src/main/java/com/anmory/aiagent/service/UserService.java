package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.UserMapper;
import com.anmory.aiagent.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:37
 */

@Service
public class UserService {
    @Autowired
    UserMapper userMapper;
    public List<User> getAllUsers() {
        return userMapper.getAllUsers();
    }

    public int updateUserName(int userId, String userName) {
        return userMapper.updateUserName(userId, userName);
    }

    public int updatePassword(int userId, String password) {
        return userMapper.updatePassword(userId, password);
    }

    public int updateEmail(int userId, String email) {
        return userMapper.updateEmail(userId, email);
    }

    public int getAge(int userId) {
        return userMapper.getAge(userId);
    }

    public User getUserById(int userId) {
        return userMapper.getUserById(userId);
    }

    public int insertUser(String userName, String password, Date birth, int sex, String email) {
        return userMapper.insertUser(userName, password, birth, sex, email);
    }

    public User getUserByName(String userName) {
        return userMapper.getUserByName(userName);
    }
}
