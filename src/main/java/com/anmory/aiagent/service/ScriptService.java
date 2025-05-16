package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.ScriptsMapper;
import com.anmory.aiagent.model.Scripts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:48
 */

@Service
public class ScriptService {
    @Autowired
    ScriptsMapper scriptsMapper;

    public Scripts selectScriptsBySessionName(String scriptName) {
        return scriptsMapper.selectScriptsBySessionName(scriptName);
    }

    public Scripts selectLastScripts() {
        return scriptsMapper.selectLastScripts();
    }

    public List<Scripts> getScripts() {
        return scriptsMapper.getScripts();
    }

    public int insertScripts(int sessionId, String scriptName, String scriptContent, String result) {
        return scriptsMapper.insertScripts(sessionId, scriptName, scriptContent, result);
    }

    public int deleteScript(String scriptName) {
        return scriptsMapper.deleteScript(scriptName);
    }

    public int insertScriptToSession(int scriptId, int sessionId, String scriptName, String scriptContent, String result) {
        return scriptsMapper.insertScriptToSession(scriptId, sessionId, scriptName, scriptContent, result);
    }
}
