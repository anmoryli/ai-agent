package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.ScriptsSessionsMapper;
import com.anmory.aiagent.model.ScriptsSessions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-19 下午11:46
 */

@Service
public class ScriptsSessionsService {
    @Autowired
    ScriptsSessionsMapper scriptsSessionsMapper;

    public int insert(int scriptId, int sessionId) {
        return scriptsSessionsMapper.insert(scriptId, sessionId);
    }

    public int deleteBySessionId(int sessionId) {
        return scriptsSessionsMapper.deleteBySessionId(sessionId);
    }

    public ScriptsSessions getLastScriptSessionId() {
        return scriptsSessionsMapper.getLastScriptSessionId();
    }

    public List<ScriptsSessions> getAllScriptSessionId(int sessionId) {
        return scriptsSessionsMapper.getAllScriptSession(sessionId);
    }

    public List<ScriptsSessions> getAllScriptSession(int scriptId) {
        return scriptsSessionsMapper.getAllScriptSession(scriptId);
    }
}
