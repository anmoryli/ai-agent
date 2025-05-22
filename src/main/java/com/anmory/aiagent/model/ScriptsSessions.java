package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-19 下午11:44
 */

@Data
public class ScriptsSessions {
    private int scriptId;
    private int sessionId;
    private Date joinedTime;
}
