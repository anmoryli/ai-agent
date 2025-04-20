package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.AgentsMapper;
import com.anmory.aiagent.model.Agents;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:49
 */

@Service
public class AgentsService {
    @Autowired
    AgentsMapper agentsMapper;

    public int insertAgent(int userId, String agentName, String agentRole, String description) {
        return agentsMapper.insertAgent(userId, agentName, agentRole, description);
    }

    public int updateAgent(int agentId, String agentName, String agentRole, String description) {
        return agentsMapper.updateAgent(agentId, agentName, agentRole, description);
    }

    public int deleteAgent(int agentId) {
        return agentsMapper.deleteAgent(agentId);
    }

    public Agents getLastAgentId() {
        return agentsMapper.getLastAgentId();
    }

    public List<Agents> getAllAgentsOfScript(int scriptId) {
        return agentsMapper.getAllAgentsOfScript(scriptId);
    }
}
