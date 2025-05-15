package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Clues;
import com.anmory.aiagent.model.Messages;
import com.anmory.aiagent.model.Scripts;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.CluesService;
import com.anmory.aiagent.service.MessageService;
import com.anmory.aiagent.service.MessageSingleService;
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

import java.util.List;

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
    @Autowired
    CluesService cluesService;
    @Autowired
    MessageSingleService messageSingleService;

    private final OpenAiChatModel openAiChatModel;

    public ChatController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    @ResponseBody
    @GetMapping(value = "/chatSingle",produces = MediaType.APPLICATION_JSON_VALUE)
//    @GetMapping(value = "/stream",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Messages chatSingle(@RequestParam(value = "message",defaultValue = "你是谁") String message,
                         @RequestParam String sessionId,
                         @RequestParam String role,
                         @RequestParam String conId,
                         HttpServletRequest request) {
        log.info("[AiResponse]角色信息是:" + role);
        log.info("会话id:" + sessionId);
        Messages messages = new Messages();
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        log.info("[AiResponse]用户名为:"+user.getUserName()+"，发送的消息为:"+message);
        String senderType = "agent";
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,conId,1000);
        ChatClient chatClient = ChatClient.builder(openAiChatModel)
                .defaultSystem(role)
                .defaultAdvisors(messageChatMemoryAdvisor)
                .build();
        String result = chatClient.prompt()
                .user(message)
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
        // 验证 sessionId 格式
        Integer numericSessionId;
        if (sessionId.startsWith("agent_chat_")) {
            // 提取时间戳或其他逻辑
            String timestamp = sessionId.replace("agent_chat_", "");
            try {
                Long.parseLong(timestamp); // 验证时间戳
                // 假设需要映射到 scripts.session_id
                numericSessionId = mapToScriptSessionId(sessionId); // 需实现此方法
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid sessionId format: " + sessionId);
            }
        } else {
            try {
                numericSessionId = Integer.parseInt(sessionId);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("sessionId must be a valid integer: " + sessionId);
            }
        }
        messageSingleService.insert(user.getUserId(),Integer.parseInt(conId),result);
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

    @ResponseBody
    @GetMapping(value = "/chat",produces = MediaType.APPLICATION_JSON_VALUE)
//    @GetMapping(value = "/stream",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Messages chat(@RequestParam(value = "message",defaultValue = "你是谁") String message,
                             @RequestParam String sessionId,
                             String scriptName,
                             @RequestParam String role,
                             HttpServletRequest request) {
        Scripts scripts = cluesService.getScriptsByScriptName(scriptName);
        List<Clues> clues = cluesService.getCluesBySessionId(Integer.parseInt(sessionId));
        role = " 你是一个智能剧本杀引导助手，这个剧情是："+role + ",剧情的结果是" + scripts.getResult() +
                ",你需要先向用户介绍这个剧情，然后问用户是否想开始游戏，并且你只能问一次，不能问第二次，你应该记住你之前说的什么，" +
                "你要根据用户的具体回复来智能判断用户是否选择开始，比如用户回复好，那么代表准备好了，或者回复是的也是准备好了，你要聪明一点，" +
                "不要一直问有没有准备好，" +
                "面对用户的无理要求，你应尽量回应但还是要回到剧本杀上来，之后你需要根据用户的消息智能决断剧情的走向，当你认为剧情结束了，那么你应该返回剧情结束" +
                "你必须严格返回剧情结束这四个字，字符串，不能带任何格式，不能带markdown，" +
                "但是你和用户交互是允许markdwon并且鼓励使用markdown的，此外你还需要分析这个剧情的线索" +
                "线索是" + clues + "，你需要根据用户的行为决定是否解锁这个线索，难度不应该太高，当用户的选择和这个线索有关的时候你就应该发送解锁线索的信息了，" +
                "你不能等用户说解锁线索你才解锁，这是严格禁止的，即使用户回复的是数字你也应该根据这个数字对应的内容判断用户是否解锁线索，" +
                "如果线索一旦解锁，那么你应该返回的格式是：解锁线索: + '线索的名称'，必须严格返回字符串，线索名称两边的单引号一定不能少，必须有," +
                "在游戏过程中你应该提供1，2，3这样的选项让用户选择，你应该根据线索和剧本内容来推进游戏";
        log.info("[AiResponse]角色信息是:" + role);
        log.info("会话id:" + sessionId);
        Messages messages = new Messages();
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        log.info("[AiResponse]用户名为:"+user.getUserName()+"，发送的消息为:"+message);
        String senderType = "agent";
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,sessionId,1000);
        ChatClient chatClient = ChatClient.builder(openAiChatModel)
                .defaultSystem(role)
                .defaultAdvisors(messageChatMemoryAdvisor)
                .build();
        String result = chatClient.prompt()
                .user(message)
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
        // 验证 sessionId 格式
        Integer numericSessionId;
        if (sessionId.startsWith("agent_chat_")) {
            // 提取时间戳或其他逻辑
            String timestamp = sessionId.replace("agent_chat_", "");
            try {
                Long.parseLong(timestamp); // 验证时间戳
                // 假设需要映射到 scripts.session_id
                numericSessionId = mapToScriptSessionId(sessionId); // 需实现此方法
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid sessionId format: " + sessionId);
            }
        } else {
            try {
                numericSessionId = Integer.parseInt(sessionId);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("sessionId must be a valid integer: " + sessionId);
            }
        }
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
        // 更新线索状态
        if (result.contains("解锁线索")) {
            try {
                // 提取线索名称，格式为：解锁线索: '线索名称'
                String clueName = extractClueName(result);
                log.info("[AiResponse] 线索名称为: {}", clueName);
                Clues clue = cluesService.getCluesByName(clueName);
                if (clue == null) {
                    log.warn("线索未找到: {}", clueName);
                } else {
                    log.info("[AiResponse] 线索为: {}, 线索id为: {}", clue, clue.getClueId());
                    cluesService.updateLock(clue.getClueId());
                }
            } catch (IllegalArgumentException e) {
                log.error("无法提取线索名称: {}", result, e);
            }
        }
        return messages;
    }

    // 提取线索名称
    private String extractClueName(String result) {
        // 查找 "解锁线索: '线索名称'" 格式
        String prefix = "解锁线索: '";
        int startIndex = result.indexOf(prefix);
        if (startIndex == -1) {
            throw new IllegalArgumentException("无效的线索解锁格式: " + result);
        }
        startIndex += prefix.length();
        int endIndex = result.indexOf("'", startIndex);
        if (endIndex == -1) {
            throw new IllegalArgumentException("线索名称缺少结束单引号: " + result);
        }
        return result.substring(startIndex, endIndex);
    }

    // 示例：将字符串 sessionId 映射到 scripts.session_id
    private Integer mapToScriptSessionId(String sessionId) {
        // 实现逻辑：查询数据库或缓存，找到对应的 scripts.session_id
        // 例如：假设 sessionId 存储在某表中
        // 这里返回一个默认值，需根据实际业务实现
        return 1; // 替换为实际逻辑
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
