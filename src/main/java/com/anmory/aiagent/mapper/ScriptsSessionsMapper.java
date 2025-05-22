package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.ScriptsSessions;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-19 下午11:44
 */

@Mapper
public interface ScriptsSessionsMapper {
    @Insert("insert into `ai-agent`.scripts_sessions(`ai-agent`.scripts_sessions.script_id,`ai-agent`.scripts_sessions.session_id) values " +
            "(#{scriptId},#{sessionId})")
    int insert(int scriptId, int sessionId);

    @Delete("delete from `ai-agent`.scripts_sessions where session_id = #{sessionId}")
    int deleteBySessionId(int sessionId);

    @Select("select * from `ai-agent`.scripts_sessions order by joined_time desc limit 1")
    ScriptsSessions getLastScriptSessionId();

    @Select("select * from `ai-agent`.scripts_sessions where session_id = #{sessionId}")
    List<ScriptsSessions> getAllScriptSession(int sessionId);

    @Select("select * from `ai-agent`.scripts_sessions where script_id = #{scriptId}")
    List<ScriptsSessions> getAllScriptAgents(int scriptId);
}
