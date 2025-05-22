package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-19 下午10:54
 */

@Data
public class ScriptsAgents {
    int scriptId;
    int agentId;
    Date joinedTime;
}
