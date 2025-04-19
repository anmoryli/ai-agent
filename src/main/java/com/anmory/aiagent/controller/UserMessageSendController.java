package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Messages;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午8:21
 */

@RestController
@RequestMapping("/userMsg")
public class UserMessageSendController {
    @Autowired
    MessageService messageService;
    @RequestMapping("/getUserSend")
    public Messages getUserMsg(HttpServletRequest request,
                               @RequestParam String sessionId,
                               @RequestParam String message) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        messageService.insert(Integer.parseInt(sessionId),"user", user.getUserId(), message);
        Messages messages = new Messages();
        messages.setSenderId(user.getUserId());
        messages.setMessage(message);
        messages.setSenderType("user");
        messages.setSessionId(Integer.parseInt(sessionId));
        return messages;
    }
}
