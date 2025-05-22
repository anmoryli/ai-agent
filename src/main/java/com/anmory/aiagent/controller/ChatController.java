package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.*;
import com.anmory.aiagent.service.AgentsService;
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
    @Autowired
    AgentsService agentsService;

    private final OpenAiChatModel openAiChatModel;

    public ChatController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    @ResponseBody
    @GetMapping(value = "/chatSingle",produces = MediaType.APPLICATION_JSON_VALUE)
//    @GetMapping(value = "/stream",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public MessageSingle chatSingle(@RequestParam(value = "message",defaultValue = "你是谁") String message,
                         @RequestParam String sessionId,
                         @RequestParam String role,
                         @RequestParam String conId,
                         HttpServletRequest request) {
        log.info("[AiResponse]角色信息是:" + role);
        role = "你是一个智能聊天助手，完全扮演以下角色：'" + role + "'。以下是你的任务和规则：" +
                "\n\n### 1. 角色扮演" +
                "\n- **角色定位**：你必须始终以 '" + role + "' 的身份、语气和风格与用户互动，保持角色的一致性。" +
                "\n- **背景融入**：根据角色的背景和个性，自然回应用户的消息，模拟真实的对话体验。" +
                "\n\n### 2. 交互规则" +
                "\n- **对话风格**：" +
                "\n  - 使用与 '" + role + "' 匹配的语言风格（如正式、幽默、神秘等）。" +
                "\n  - 鼓励使用 Markdown 格式（如加粗、列表）增强回复的可读性和吸引力，但避免过多的格式干扰。" +
                "\n- **用户意图**：" +
                "\n  - 智能理解用户的消息，灵活回应，即使用户提出与角色无关的问题，也要礼貌地引导回角色主题。" +
                "\n  - 示例：如果用户问无关问题（如‘今天天气如何’），可以回复类似‘作为一名" + role + "，我更关心谜团而非天气，或许你有其他线索想分享？’。" +
                "\n- **记忆功能**：" +
                "\n  - 记住对话历史，避免重复或矛盾的回答，保持上下文连贯。" +
                "\n\n### 3. 输出要求" +
                "\n- **回复内容**：每次回复都必须反映 '" + role + "' 的视角和个性。" +
                "\n- **格式限制**：除非明确要求，回复避免使用代码块或其他特殊格式，确保纯文本或轻量 Markdown。" +
                "\n- **语气自然**：避免机械化回答，模拟 '" + role + "' 的真实对话风格。" +
                "\n\n### 4. 总体目标" +
                "\n- 提供沉浸式的角色扮演体验，让用户感觉与 '" + role + "' 真实互动。" +
                "\n- 保持对话流畅、引人入胜，优先考虑用户体验和角色一致性。";
        log.info("会话id:" + sessionId);
        MessageSingle messages = new MessageSingle();
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        log.info("[AiResponse]用户名为:"+user.getUserName()+"，发送的消息为:"+message);
        String senderType = "agent";
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,conId,10000);
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
        MessageSingle lastMessage = messageSingleService.getLastMessageId();
        if(lastMessage == null) {
            return null;
        }
        messages.setMessageId(lastMessage.getMessageId());
        messages.setSenderId(user.getUserId());
        messages.setMessage(result);
        messages.setCreateTime(lastMessage.getCreateTime());
        messages.setUpdateTime(lastMessage.getUpdateTime());
        System.out.println(messages);
        return messages;
    }

    @ResponseBody
    @GetMapping(value = "/chat",produces = MediaType.APPLICATION_JSON_VALUE)
//    @GetMapping(value = "/stream",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Messages chat(@RequestParam(value = "message",defaultValue = "你是谁") String message,
                             @RequestParam int agentId,
                             @RequestParam String sessionId,
                             @RequestParam String scriptName,
                             @RequestParam String role,
                             HttpServletRequest request) {
        if(agentId == 0) {
            role = "你是一个引导助手";
        }
        Agents agents = agentsService.getAgentById(agentId);
        Agents guide = new Agents();
        if(agents == null) {
            guide.setAgentId(0);
            guide.setAgentRole("你的任务是引导用户完成剧情。");
            guide.setAgentName("引导助手");
            guide.setDescription("你的任务是引导用户完成剧情。");
            agents = guide;
        }
        log.info("[AiResponse]用户选择的角色是:" + agents.getAgentName());
        role += "你的名字是" + agents.getAgentName() == null + "，" + agents.getAgentRole();
        log.info("[AiResponse]剧本名称是:" + scriptName);
        Scripts scripts = cluesService.getScriptsByScriptName(scriptName);
        if(scripts == null) {
            return null;
        }
        log.info("[AiResponse]润色之前的角色信息是:" + role);
        List<Clues> clues = cluesService.getCluesByScriptId(scripts.getScriptId());
        log.info("[AiResponse]线索是:" + clues);
        role += "你是一个智能剧本杀引导助手，负责引导用户完成剧情。以下是你的任务和规则：" +
                "\n\n### 1. 剧情设置" +
                "\n- **剧情背景**：剧情基于以下内容：'" + role + "'。" +
                "\n- **剧情结果**：最终结局为 '" + scripts.getResult() + "'。" +
                "\n- **剧本内容**：围绕 '" + scripts.getScriptContent() + "' 展开。" +
                "\n- **线索**：严格基于以下线索：'" + clues + "'，禁止自行添加线索。" +
                "\n\n### 2. 游戏引导" +
                "\n- **初始交互**：" +
                "\n  - 首次交互时，向用户介绍剧情背景，并询问是否开始游戏，仅询问一次，禁止重复询问。" +
                "\n  - 使用 Markdown 格式与用户交互，增强可读性和吸引力。" +
                "\n- **用户意图判断**：" +
                "\n  - 根据用户回复智能判断是否准备开始，例如回复“好”、“是的”表示准备好。" +
                "\n  - 对用户的不合理要求（如偏离剧本），礼貌回应后引导回剧情。" +
                "\n- **剧情推进**：" +
                "\n  - 根据 '" + scripts.getScriptContent() + "'、'" + scripts.getResult() + "' 和 '" + clues + "' 推进剧情。" +
                "\n  - 提供多样化的选择选项（如 1、2、3 或更多/更少选项），选项内容基于线索和剧本。" +
                "\n  - 若对话陷入死循环，主动提供线索并继续推进剧情。" +
                "\n  - 禁止重新开始游戏，除非用户明确要求。" +
                "\n\n### 3. 线索管理" +
                "\n- **解锁条件**：" +
                "\n  - 根据用户行为和回复判断是否解锁线索，难度适中，不得要求用户明确说“解锁线索”。" +
                "\n  - 当用户选择或回复与线索相关时（包括数字选项对应的内容），立即解锁相关线索。" +
                "\n- **解锁格式**：" +
                "\n  - 解锁时返回严格字符串：`解锁线索: '线索名称'`，线索名称必须带单引号，禁止使用 Markdown（如 `**解锁线索**`）。" +
                "\n  - 示例：`解锁线索: '詹姆斯的日记'`。" +
                "\n- **线索限制**：" +
                "\n  - 仅使用 '" + clues + "' 提供的线索，禁止添加新线索。" +
                "\n\n### 4. 交互规则" +
                "\n- **记忆功能**：" +
                "\n  - 记住之前的对话内容，避免重复询问或矛盾。" +
                "\n- **选项设计**：" +
                "\n  - 提供基于剧本和线索的交互选项，鼓励用户选择编号或自行输入对话。" +
                "\n  - 若涉及与角色交谈，提醒用户可选择提供的对话或输入自定义内容。" +
                "\n- **结束条件**：" +
                "\n  - 当剧情推理完成时，返回严格字符串：`剧情结束`，禁止添加格式或 Markdown。" +
                "\n\n### 5. 总体要求" +
                "\n- 保持智能、灵活的交互，围绕 '" + scripts.getScriptContent() + "' 和 '" + scripts.getResult() + "' 推进游戏。" +
                "\n- 持续推进剧情直到推理结束，确保用户体验流畅且符合剧本逻辑。" +
                "你可能会遇到多次角色互换的情况，请见机行事";
        log.info("[AiResponse]角色信息是:" + role);
        log.info("会话id:" + sessionId);
        Messages messages = new Messages();
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        Messages notLogin = new Messages();
        notLogin.setMessage("请先登录");
        if(user == null) {
            return notLogin;
        }
        log.info("[AiResponse]用户名为:"+user.getUserName()+"，发送的消息为:"+message);
        String senderType = "agent";
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory,sessionId,10000);
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
    // 提取线索名称
    private String extractClueName(String result) {
        // 定义可能的线索前缀，包含 Markdown 和非 Markdown 格式
        String[] prefixes = {
                "解锁线索: '",        // 标准格式
                "**解锁线索**: '"     // Markdown 格式
        };

        int startIndex = -1;
        String matchedPrefix = null;

        // 尝试匹配任一前缀
        for (String prefix : prefixes) {
            startIndex = result.indexOf(prefix);
            if (startIndex != -1) {
                matchedPrefix = prefix;
                break;
            }
        }

        if (startIndex == -1) {
            throw new IllegalArgumentException("无效的线索解锁格式: " + result);
        }

        // 从前缀结束位置开始提取线索名称
        startIndex += matchedPrefix.length();
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
