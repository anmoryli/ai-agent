package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Clues;
import com.anmory.aiagent.model.Scripts;
import com.anmory.aiagent.service.CluesService;
import com.anmory.aiagent.service.ScriptService;
import com.anmory.aiagent.service.SessionsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-15 上午8:58
 */

@Slf4j
@RestController
@RequestMapping("/clues")
public class CluesController {
    @Autowired
    CluesService cluesService;
    @Autowired
    ChatController chatController;
    @Autowired
    SessionsService sessionsService;
    @Autowired
    ScriptService scriptService;

    @RequestMapping("/getCluesBySessionId")
    public List<Clues> getCluesBySessionId(int sessionId) {
        log.info("获取线索成功"+sessionId);
        return cluesService.getCluesBySessionId(sessionId);
    }

    @RequestMapping("/getCluesByScriptId")
    public List<Clues> getCluesByScriptId(String scriptName) {
        log.info("获取剧本名称成功"+scriptName);
        Integer scriptId = cluesService.getScriptsByScriptName(scriptName).getScriptId();
        if(scriptId == null) {
            return null;
        }
        return cluesService.getCluesByScriptId(scriptId);
    }

    @RequestMapping("/unlockClues")
    public List<Clues> unlockClues(List<Clues> clues) {
        for (Clues clue : clues) {
            cluesService.updateLock(clue.getClueId());
        }
        return clues;
    }

    @RequestMapping("/lockAllClues")
    public int lockAllClues() {
        log.info("清空线索状态成功");
        return cluesService.locakAllClues();
    }

    @RequestMapping("/checkClueUnlocked")
    public List<Clues> checkClueUnlocked(List<Clues> clues) {
        for (Clues clue : clues) {
            if (clue.getIsLocked() == 0) {
                cluesService.updateLock(clue.getClueId());
            }
        }
        return clues;
    }

    @RequestMapping("/clearAllClues")
    public int clearAllClues() {
        log.info("清空线索状态成功");
        return cluesService.locakAllClues();
    }

    @RequestMapping("/addCluesToSession")
    public List<Clues> addCluesToSession(String scriptName, String sessionId) {
        Scripts scripts = scriptService.selectScriptsBySessionName(scriptName);
        List<Clues> clues = getCluesByScriptId(scriptName);
        scriptService.insertScriptToSession(scripts.getScriptId(),  Integer.parseInt(sessionId),
                    scripts.getScriptName(), scripts.getScriptContent(), scripts.getResult());
        return clues;
    }
}
