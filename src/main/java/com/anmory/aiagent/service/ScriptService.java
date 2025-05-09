package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.ScriptsMapper;
import com.anmory.aiagent.model.Scripts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
