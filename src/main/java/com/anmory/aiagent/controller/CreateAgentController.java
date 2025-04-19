package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Agents;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.AgentsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午7:46
 */

@RestController
public class CreateAgentController {
    @Autowired
    AgentsService agentsService;
    @RequestMapping("/createAgent")
    public Agents createAgent(HttpServletRequest request,
                              @RequestParam String agentName,
                              @RequestParam String agentRole,
                              @RequestParam String description) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        Agents agents = new Agents();
        agents.setAgentName(agentName);
        agents.setAgentRole(agentRole);
        agents.setDescription(description);
        agentsService.insertAgent(user.getUserId(),agentName,agentRole,description);
        // 获取最后一个agentId
        Agents lastAgentId = agentsService.getLastAgentId();
        agents.setAgentId(lastAgentId.getAgentId());
        agents.setUserId(user.getUserId());
        agents.setCreateTime(lastAgentId.getCreateTime());
        agents.setUpdateTime(lastAgentId.getUpdateTime());
        return agents;
    }
}
