package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Messages;
import com.anmory.aiagent.model.Sessions;
import com.anmory.aiagent.model.SessionsMessages;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.MessageService;
import com.anmory.aiagent.service.SessionsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午7:43
 */

@RestController
@RequestMapping("/his")
public class HistoryController {
    @Autowired
    MessageService messageService;

    @Autowired
    SessionsService sessionsService;
    @RequestMapping("/getHistory")
    public List<Messages> getHistory(HttpServletRequest request,
                                     @RequestParam String sessionId){
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        return messageService.getHistoryBySessionIdAndSenderId(Integer.parseInt(sessionId), user.getUserId());
    }

    @RequestMapping("/getSessionsMessages")
    public List<SessionsMessages> getSessionsMessages(HttpServletRequest request){
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        List<Sessions> sessions = sessionsService.getSessionsByUserId(user.getUserId());
        List<SessionsMessages> sessionsMessages = new ArrayList<>();
        for (Sessions session1 : sessions) {
            List<Messages> messages = messageService.getHistoryBySessionIdAndSenderId(session1.getSessionId(), user.getUserId());
            sessionsMessages.add(new SessionsMessages(session1.getSessionId(), messages));
        }
        return sessionsMessages;
    }
}
