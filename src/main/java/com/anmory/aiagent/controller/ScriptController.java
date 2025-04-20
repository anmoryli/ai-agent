package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Scripts;
import com.anmory.aiagent.model.Sessions;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.ScriptService;
import com.anmory.aiagent.service.SessionsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:44
 */

@RestController
@RequestMapping("/script")
public class ScriptController {
    @Autowired
    ScriptService scriptService;

    @Autowired
    SessionsService sessionsService;
    @RequestMapping("/chooseScript")
    public Scripts chooseScript(@RequestParam String scriptName,
                                HttpServletRequest request) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        Scripts script = scriptService.selectLastScripts();
        Sessions sessions = sessionsService.getLastSessionId();
        // 把剧本更新到会话中
        sessionsService.insertSessionScript(user.getUserId(),sessions.getSessionId(), script.getScriptId());
        return script;
    }
}
