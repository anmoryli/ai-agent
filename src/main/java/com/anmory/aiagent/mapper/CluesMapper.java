package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Clues;
import com.anmory.aiagent.model.Scripts;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-15 上午8:58
 */

@Mapper
public interface CluesMapper {
    @Select("select * from `ai-agent`.clues " +
            "join `ai-agent`.scripts on clues.script_id = scripts.script_id " +
            "join `ai-agent`.sessions on scripts.session_id = sessions.session_id " +
            "where sessions.session_id = #{sessionId}")
    List<Clues> getCluesBySessionId(int sessionId);

    @Update("update clues set is_locked = 1 where clue_id = #{clueId}")
    int updateLock(int clueId);

    @Select("select * from `ai-agent`.clues where script_id = #{scriptId}")
    List<Clues> getCluesByScriptId(int scriptId);

    @Select("select * from `ai-agent`.clues where clue_name = #{clueName}")
    Clues getCluesByName(String clueName);

    @Update("update `ai-agent`.clues set is_locked = 0")
    int locakAllClues();

    @Select("select * from `ai-agent`.scripts " +
            "where script_id = (select script_id from `ai-agent`.clues where clue_id = #{clueId})")
    Scripts getScriptsByClueId(int clueId);

    @Select("select * from `ai-agent`.scripts where script_name = #{scriptName} limit 1")
    Scripts getScriptsByScriptName(String scriptName);

    @Delete("delete from `ai-agent`.clues where script_id = #{scriptId}")
    int deleteCluesByScriptId(int scriptId);
}
