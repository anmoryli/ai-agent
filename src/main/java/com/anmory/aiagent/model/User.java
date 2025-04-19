package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:14
 */

@Data
public class User {
    private int userId;
    private String userName;
    private String password;
    private Date birth;
    private int sex;
    private String email;
    private Date createTime;
    private Date updateTime;
}
