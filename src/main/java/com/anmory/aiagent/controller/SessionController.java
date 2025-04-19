package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Sessions;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.SessionsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午9:43
 */

@RestController
@RequestMapping("/session")
public class SessionController {
    @Autowired
    SessionsService sessionsService;
    @RequestMapping("/createSession")
    public Sessions createSession(HttpServletRequest request,
                                  @RequestParam String title){
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        sessionsService.insertSession(user.getUserId(), title);
        Sessions lastSession = sessionsService.getLastSessionId();
        Sessions sessions = new Sessions();
        sessions.setTitle(title);
        sessions.setSessionId(lastSession.getSessionId());
        sessions.setUserId(user.getUserId());
        sessions.setCreateTime(lastSession.getCreateTime());
        sessions.setUpdateTime(lastSession.getUpdateTime());
        return sessions;
    }

    @RequestMapping("/getAllSessions")
    public List<Sessions> getAllSessions(HttpServletRequest request){
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        List<Sessions> sessions = sessionsService.getSessionsByUserId(user.getUserId());
        return sessions;
    }
}
