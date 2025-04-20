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
        return agentsService.getAllAgentsOfScript(scriptId);
    }
}
