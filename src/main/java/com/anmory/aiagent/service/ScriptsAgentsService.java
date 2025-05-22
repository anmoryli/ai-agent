package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.ScriptsAgentsMapper;
import com.anmory.aiagent.model.ScriptsAgents;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-19 下午10:57
 */

@Service
public class ScriptsAgentsService {
    @Autowired
    ScriptsAgentsMapper scriptsAgentsMapper;

    public int insert(int scriptId, int agentId) {
        return scriptsAgentsMapper.insert(scriptId, agentId);
    }

    public ScriptsAgents getLastScriptAgentId() {
        return scriptsAgentsMapper.getLastScriptAgentId();
    }

    public List<ScriptsAgents> getAllScriptAgents(int scriptId) {
        return scriptsAgentsMapper.getAllScriptAgents(scriptId);
    }

    public int deleteAllAgentsOfScript(int scriptId) {
        return scriptsAgentsMapper.deleteAllAgentsOfScript(scriptId);
    }
}
