package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Scripts;
import com.anmory.aiagent.model.Sessions;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.ScriptService;
import com.anmory.aiagent.service.SessionsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:44
 */

@Slf4j
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
        sessionsService.insertSessionScript(user.getUserId(),sessions.getSessionId());
        return script;
    }

    @RequestMapping("/getScriptContent")
    public String getScriptContent(@RequestParam String scriptName) {
        Scripts script = scriptService.selectScriptsBySessionName(scriptName);
        log.info("[获取剧本内容]剧本内容:"+scriptName+",scriptContent:"+script.getScriptContent());
        return script.getScriptContent();
    }

    @RequestMapping("/getScriptSingle")
    public Scripts getScriptSingle(@RequestParam String scriptName) {
        Scripts script = scriptService.selectScriptsBySessionName(scriptName);
        log.info("[获取剧本内容]剧本内容:"+scriptName+",scriptContent:"+script.getScriptContent());
        return script;
    }

    @RequestMapping("/deleteScript")
    public int deleteScript(@RequestParam String scriptName) {
        return scriptService.deleteScript(scriptName);
    }

    @RequestMapping("/createScript")
    public int createScript(HttpServletRequest request,
                             @RequestParam int sessionId,
                           @RequestParam String scriptName,
                           @RequestParam String scriptContent,
                            @RequestParam String result) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        return scriptService.insertScripts(sessionId,scriptName,scriptContent,result);
    }

    @RequestMapping("/getScripts")
    public List<Scripts> getScripts() {
        return scriptService.getScripts();
    }
}
