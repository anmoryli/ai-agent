package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Agents;
import com.anmory.aiagent.service.AgentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午11:10
 */

@RestController
@RequestMapping("/agents")
public class AgentsController {
    @Autowired
    AgentsService agentsService;
    @RequestMapping("/getAllAgentsOfScript")
    public List<Agents> getAllAgentsOfScript(int scriptId) {
        return agentsService.getAllAgentsOfScript(scriptId) == null ? null : agentsService.getAllAgentsOfScript(scriptId);
    }

    @RequestMapping("/deleteAgents")
    public int deleteAgents(int agentId) {
        return agentsService.deleteAgent(agentId);
    }

    @RequestMapping("/getAllAgents")
    public List<Agents> getAllAgents() {
        return agentsService.getAllAgents();
    }

    @RequestMapping("/createAgent")
    public Agents createAgent(int userId, String agentName, String agentRole, String description) {
        agentsService.insertAgent(userId, agentName, agentRole, description);
        // 获取最后一个agentId
        Agents lastAgentId = agentsService.getLastAgentId();
        Agents agents = new Agents();
        agents.setAgentId(lastAgentId.getAgentId());
        agents.setUserId(userId);
        agents.setAgentName(agentName);
        agents.setAgentRole(agentRole);
        agents.setDescription(description);
        agents.setCreateTime(lastAgentId.getCreateTime());
        agents.setUpdateTime(lastAgentId.getUpdateTime());
        return agents;
    }

    @RequestMapping("/userChooseAgent")
    public Agents userChooseAgent(int agentId) {
        agentsService.setChose(agentId, "user");
        return agentsService.getAgentById(agentId);
    }

    @RequestMapping("/aiChooseAgent")
    public List<Agents> aiChooseAgent() {
        List<Agents> agents = agentsService.getNotChoseAgents();
        for(Agents agent : agents){
            agentsService.setChose(agent.getAgentId(),"agent");
        }
        return agents;
    }

    @RequestMapping("/getAgentById")
    public Agents getAgentById(int agentId) {
        return agentsService.getAgentById(agentId);
    }
}
