package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.SessionAgentsMapper;
import com.anmory.aiagent.model.SessionAgents;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午10:03
 */

@Service
public class SessionAgentsService {
    @Autowired
    SessionAgentsMapper sessionAgentsMapper;

    public int insert(int sessionId, int agentId) {
        return sessionAgentsMapper.insert(sessionId, agentId);
    }

    public SessionAgents getLastSessionAgentId() {
        return sessionAgentsMapper.getLastSessionAgentId();
    }

    public int deleteBySessionId(int sessionId) {
        return sessionAgentsMapper.deleteBySessionId(sessionId);
    }

    public List<SessionAgents> getAllSessionAgents(int sessionId) {
        return sessionAgentsMapper.getAllSessionAgents(sessionId);
    }
}
