package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.MessageSingle;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-15 下午10:28
 */

@Mapper
public interface MessageSingleMapper {
    @Insert("insert into `ai-agent`.message_single(sender_id,receiver_id,message) values(#{senderId},#{receiverId},#{message})")
    int insert(int senderId, int receiverId, String message);

    @Select("select * from `ai-agent`.message_single order by message_id desc limit 1")
    MessageSingle getLastMessageId();
}
