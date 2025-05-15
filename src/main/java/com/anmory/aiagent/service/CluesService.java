package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.CluesMapper;
import com.anmory.aiagent.model.Clues;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-15 上午9:09
 */

@Service
public class CluesService {
    @Autowired
    CluesMapper clusterMapper;

    public List<Clues> getCluesBySessionId(int sessionId) {
        return clusterMapper.getCluesBySessionId(sessionId);
    }

    public List<Clues> getCluesByScriptId(int scriptId) {
        return clusterMapper.getCluesByScriptId(scriptId);
    }

    public int updateLock(int clueId) {
        return clusterMapper.updateLock(clueId);
    }
}
