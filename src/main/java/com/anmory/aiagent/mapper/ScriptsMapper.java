package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Scripts;
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
}
