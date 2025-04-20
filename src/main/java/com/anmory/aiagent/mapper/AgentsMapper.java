package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Agents;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:41
 */

@Mapper
public interface AgentsMapper {
    @Insert("insert into agents (user_id, agent_name, agent_role, description) values (#{userId}, #{agentName}, #{agentRole}, #{description})")
    int insertAgent(int userId, String agentName, String agentRole, String description);

    @Update("update agents set agent_name = #{agentName}, agent_role = #{agentRole}, description = #{description} where agent_id = #{agentId}")
    int updateAgent(int agentId, String agentName, String agentRole, String description);

    @Delete("delete from agents where agent_id = #{agentId}")
    int deleteAgent(int agentId);

    @Select("select * from `ai-agent`.agents order by agent_id desc limit 1")
    Agents getLastAgentId();

    @Select("select * from agents where agent_id in (select agent_id from `ai-agent`.session_agents where session_id = (select session_id from `ai-agent`.sessions where script_id = #{scriptId}))")
    List<Agents> getAllAgentsOfScript(int scriptId);
}
