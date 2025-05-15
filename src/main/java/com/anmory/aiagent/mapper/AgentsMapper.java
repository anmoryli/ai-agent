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

    @Select("select * from agents " +
            "join `ai-agent`.session_agents on agents.agent_id = session_agents.agent_id " +
            "join sessions on session_agents.session_id = sessions.session_id " +
            "join `ai-agent`.scripts on scripts.session_id = sessions.session_id")
    List<Agents> getAllAgentsOfScript(int scriptId);

    @Select("select * from agents")
    List<Agents> getAllAgents();

    @Select("select * from agents where agent_id = #{agentId}")
    Agents getAgentById(int agentId);

    @Update("update `ai-agent`.agents set is_chose = 1,own_by=#{ownBy} where `ai-agent`.agents.agent_id=#{agentId}")
    int setChose(int agentId,String ownBy);

    @Select("select * from `ai-agent`.agents where is_chose = 0")
    List<Agents> getNotChoseAgents();
}
