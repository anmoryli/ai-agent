package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Clues;
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

}
