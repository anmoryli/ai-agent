package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Agents;
import com.anmory.aiagent.model.SessionAgents;
import com.anmory.aiagent.service.AgentsService;
import com.anmory.aiagent.service.SessionAgentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午10:00
 */

@RestController
@RequestMapping("/sessionMan")
public class AgentJoinSessionController {
    @Autowired
    SessionAgentsService sessionAgentsService;

    @Autowired
    AgentsService agentsService;
    @RequestMapping("/agentJoinSession")
    public SessionAgents agentJoinSession(@RequestParam int sessionId,
                                          @RequestParam int agentId){
        sessionAgentsService.insert(sessionId, agentId);
        return sessionAgentsService.getLastSessionAgentId();
    }

    @RequestMapping("/AllAgentsJoinSession")
    public List<SessionAgents> AllAgentsJoinSession(@RequestParam int sessionId,
                                              @RequestParam int scriptId){
        List<Agents> agents = agentsService.getAllAgentsOfScript(scriptId);
        for(Agents agent : agents) {
            sessionAgentsService.insert(sessionId, agent.getAgentId());
        }
        return sessionAgentsService.getAllSessionAgents(sessionId);
    }
}
