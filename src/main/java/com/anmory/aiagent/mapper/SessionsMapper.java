package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Sessions;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:54
 */

@Mapper
public interface SessionsMapper {
    @Select("select * from sessions where user_id = #{userId}")
    List<Sessions> getSessionsByUserId(int userId);

    @Insert("insert into sessions(user_id,title) values(#{userId},#{title})")
    int insertSession(int userId, String title);

    @Select("select * from sessions order by desc session_id desc limit 1")
    Sessions getLastSessionId();
}
