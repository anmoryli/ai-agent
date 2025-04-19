package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:16
 */

@Data
public class Agents {
    private int agentId;
    private int userId;
    private String agentName;
    private String agentRole;
    private String description;
    private Date createTime;
    private Date updateTime;
}
