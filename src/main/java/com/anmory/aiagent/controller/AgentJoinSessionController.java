package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.ScriptsAgents;
import com.anmory.aiagent.service.ScriptsAgentsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sessionMan")
public class AgentJoinSessionController {
    private static final Logger logger = LoggerFactory.getLogger(AgentJoinSessionController.class);

    private final ScriptsAgentsService scriptsAgentsService;

    public AgentJoinSessionController(ScriptsAgentsService scriptsAgentsService) {
        this.scriptsAgentsService = scriptsAgentsService;
    }

    @PostMapping("/AllAgentsJoinSession")
    public ResponseEntity<List<ScriptsAgents>> allAgentsJoinScript(@RequestBody AgentSessionRequest request) {
        // 记录请求内容以便调试
        logger.info("Received request: scriptId={}, agentId={}",
                request.getScriptId(), request.getAgentId());

        // 验证输入
        if (request.getScriptId() == null) {
            logger.error("scriptId is null");
            throw new IllegalArgumentException("scriptId cannot be null");
        }
        if (request.getAgentId() == null || request.getAgentId().isEmpty()) {
            logger.error("agentId is null or empty");
            throw new IllegalArgumentException("agentId cannot be null or empty");
        }

        // 将 String 类型的 scriptId 转换为 int
        int scriptId;
        try {
            scriptId = Integer.parseInt(request.getScriptId());
        } catch (NumberFormatException e) {
            logger.error("Invalid scriptId format: {}", request.getScriptId());
            throw new IllegalArgumentException("Invalid scriptId format: " + request.getScriptId());
        }

        // 将 List<String> 的 agentId 转换为 List<Integer>
        List<Integer> agentIds = request.getAgentId().stream()
                .map(agentId -> {
                    try {
                        return Integer.parseInt(agentId);
                    } catch (NumberFormatException e) {
                        logger.error("Invalid agentId format: {}", agentId);
                        throw new IllegalArgumentException("Invalid agentId format: " + agentId);
                    }
                })
                .collect(Collectors.toList());

        // 批量插入角色到剧本
        for (Integer agentId : agentIds) {
            scriptsAgentsService.insert(scriptId, agentId);
        }

        // 返回更新后的剧本-角色关联列表
        List<ScriptsAgents> result = scriptsAgentsService.getAllScriptAgents(scriptId);
        return ResponseEntity.ok(result);
    }

    public static class AgentSessionRequest {
        private String scriptId;
        private List<String> agentId;

        public String getScriptId() {
            return scriptId;
        }

        public void setScriptId(String scriptId) {
            this.scriptId = scriptId;
        }

        public List<String> getAgentId() {
            return agentId;
        }

        public void setAgentId(List<String> agentId) {
            this.agentId = agentId;
        }
    }
}