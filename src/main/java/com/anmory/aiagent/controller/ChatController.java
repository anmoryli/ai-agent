package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Messages;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-17 上午11:04
 */

@Slf4j
@RestController
@RequestMapping("/ai")
public class ChatController {

    @Autowired
    MessageService messageService;

    private final OpenAiChatModel openAiChatModel;

    public ChatController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    @ResponseBody
    @GetMapping(value = "/chat",produces = MediaType.APPLICATION_JSON_VALUE)
//    @GetMapping(value = "/stream",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Messages chat(@RequestParam(value = "message",defaultValue = "你是谁") String message,
                             @RequestParam String sessionId,
                             @RequestParam String role,
                             HttpServletRequest request) {
        Messages messages = new Messages();
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        log.info("[AiResponse]用户名为:"+user.getUserName()+"，发送的消息为:"+message);
        String senderType = "agent";
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,sessionId,100);
        ChatClient chatClient = ChatClient.builder(openAiChatModel)
                .defaultSystem(role)
                .defaultAdvisors(messageChatMemoryAdvisor)
                .build();
        String result = chatClient.prompt()
                .user(message)
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
        messageService.insert(Integer.parseInt(sessionId),senderType,user.getUserId(),result);
        Messages lastMessage = messageService.getLastMessageId();
        messages.setMessageId(lastMessage.getMessageId());
        messages.setSenderId(user.getUserId());
        messages.setMessage(result);
        messages.setSenderType(senderType);
        messages.setSessionId(Integer.parseInt(sessionId));
        messages.setCreateTime(lastMessage.getCreateTime());
        messages.setUpdateTime(lastMessage.getUpdateTime());
        System.out.println(messages);
        return messages;
    }

    @GetMapping(value = "/stream",produces = "text/stream;charset=utf-8")
//    @GetMapping(value = "/stream",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(@RequestParam(value = "message",defaultValue = "你是谁") String message,
                                                @RequestParam String sessionId) {
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,sessionId,100);
        ChatClient chatClient = ChatClient.builder(openAiChatModel)
                .defaultSystem("你是一只可爱的玉桂狗")
                .defaultAdvisors(messageChatMemoryAdvisor)
                .build();
        return chatClient.prompt()
                .user(message)
                .advisors(messageChatMemoryAdvisor)
                .stream()
                .content();
    }
}
