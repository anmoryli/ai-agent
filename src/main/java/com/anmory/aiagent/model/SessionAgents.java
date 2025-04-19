package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:21
 */

@Data
public class SessionAgents {
    private int sessionId;
    private int agentId;
    private Date joinedTime;
}
