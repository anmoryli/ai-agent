package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.SessionsMapper;
import com.anmory.aiagent.model.Sessions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午9:46
 */

@Service
public class SessionsService {
    @Autowired
    SessionsMapper sessionsMapper;

    public List<Sessions> getSessionsByUserId(int userId) {
        return sessionsMapper.getSessionsByUserId(userId);
    }

    public int insertSession(int userId, String title) {
        return sessionsMapper.insertSession(userId, title);
    }

    public Sessions getLastSessionId() {
        return sessionsMapper.getLastSessionId();
    }

    public int insertSessionScript(int userId, int sessionId, int scriptId) {
        return sessionsMapper.insertSessionScript(userId, sessionId, scriptId);
    }
}
