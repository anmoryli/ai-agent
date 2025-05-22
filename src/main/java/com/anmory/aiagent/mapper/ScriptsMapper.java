package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Scripts;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:45
 */

@Mapper
public interface ScriptsMapper {
    @Select("select * from scripts where script_name = #{scriptName}")
    Scripts selectScriptsBySessionName(String scriptName);

    @Select("select * from scripts order by create_time desc limit 1")
    Scripts selectLastScripts();

    @Select("select * from scripts")
    List<Scripts> getScripts();

    @Delete("delete from scripts where script_name = #{scriptName}")
    int deleteScript(String scriptName);

    @Insert("insert into scripts(script_name,script_content,result) values " +
            "(#{scriptName},#{scriptContent},#{result})")
    int insertScripts(String scriptName, String scriptContent, String result);

    @Insert("insert into scripts(scripts.session_id,script_name,script_content,result) values " +
            "(#{scriptId},#{scriptName},#{scriptContent},#{result})")
    int insertScriptToSession(int scriptId, int sessionId, String scriptName, String scriptContent, String result);
}
