package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.CluesMapper;
import com.anmory.aiagent.model.Clues;
import com.anmory.aiagent.model.Scripts;
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

    public int deleteCluesByScriptId(int scriptId) {
        return clusterMapper.deleteCluesByScriptId(scriptId);
    }

    public Clues getCluesByName(String clueName) {
        return clusterMapper.getCluesByName(clueName);
    }

    public int locakAllClues() {
        return clusterMapper.locakAllClues();
    }

    public Scripts getScriptsByScriptName(String scriptName) {
        return clusterMapper.getScriptsByScriptName(scriptName);
    }

    public Scripts getScriptsByClueId(int clueId) {
        return clusterMapper.getScriptsByClueId(clueId);
    }
}
