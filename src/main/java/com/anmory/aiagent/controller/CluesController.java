package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Clues;
import com.anmory.aiagent.service.CluesService;
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

    @RequestMapping("/getCluesBySessionId")
    public List<Clues> getCluesBySessionId(int sessionId) {
        return cluesService.getCluesBySessionId(sessionId);
    }

    @RequestMapping("/getCluesByScriptId")
    public List<Clues> getCluesByScriptId(int scriptId) {
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
}
