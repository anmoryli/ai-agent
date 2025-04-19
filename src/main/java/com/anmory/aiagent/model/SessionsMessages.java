package com.anmory.aiagent.model;

import lombok.Data;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午10:29
 */

@Data
public class SessionsMessages {
    private int sessionId;
    private List<Messages> lists;

    public SessionsMessages(int i, List<Messages> lists) {
        this.sessionId = i;
        this.lists = lists;
    }
}
