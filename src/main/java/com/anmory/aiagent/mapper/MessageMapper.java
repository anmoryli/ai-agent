package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Messages;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午7:15
 */

@Mapper
public interface MessageMapper {
    @Insert("insert into messages(session_id,sender_type,sender_id,message) values(#{sessionId},#{senderType},#{senderId},#{message})")
    int insert(int sessionId, String senderType, int senderId, String message);

    @Select("select * from `ai-agent`.messages order by message_id desc limit 1")
    Messages getLastMessageId();

    @Select("select * from `ai-agent`.messages where session_id = #{sessionId} and sender_id = #{senderId}")
    List<Messages> getHistoryBySessionIdAndSenderId(int sessionId, int senderId);

    @Delete("delete from `ai-agent`.messages where session_id = #{sessionId}")
    int deleteBySessionId(int sessionId);
}
