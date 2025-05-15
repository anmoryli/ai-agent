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
}
