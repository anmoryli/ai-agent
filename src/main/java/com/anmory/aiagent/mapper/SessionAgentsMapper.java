package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.SessionAgents;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午10:02
 */
@Mapper
public interface SessionAgentsMapper {
    @Insert("insert into `ai-agent`.session_agents (`ai-agent`.session_agents.session_id,`ai-agent`.session_agents.agent_id) values (#{sessionId},#{agentId})")
    int insert(int sessionId, int agentId);

    @Select("select * from `ai-agent`.session_agents order by joined_time desc limit 1")
    SessionAgents getLastSessionAgentId();

    @Select("select * from `ai-agent`.session_agents where session_id = #{sessionId}")
    List<SessionAgents> getAllSessionAgents(int sessionId);
}
