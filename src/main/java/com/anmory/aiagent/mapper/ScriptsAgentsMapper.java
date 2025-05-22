package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.ScriptsAgents;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-19 下午10:55
 */

@Mapper
public interface ScriptsAgentsMapper {
    @Insert("insert into `ai-agent`.scripts_agents (`ai-agent`.scripts_agents.script_id,`ai-agent`.scripts_agents.agent_id) " +
            "values (#{scriptId},#{agentId})")
    int insert(int scriptId, int agentId);

    @Select("select * from `ai-agent`.scripts_agents order by joined_time desc limit 1")
    ScriptsAgents getLastScriptAgentId();

    @Select("select * from `ai-agent`.scripts_agents where script_id = #{scriptId}")
    List<ScriptsAgents> getAllScriptAgents(int scriptId);

    @Delete("delete from `ai-agent`.scripts_agents where script_id = #{scriptId}")
    int deleteAllAgentsOfScript(int scriptId);
}
