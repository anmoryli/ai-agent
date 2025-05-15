package com.anmory.aiagent.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-15 下午10:28
 */

@Mapper
public interface MessageSingleMapper {
    @Insert("insert into `ai-agent`.message_single(sender_id,receiver_id,message) values(#{senderId},#{receiverId},#{message})")
    int insert(int senderId, int receiverId, String message);
}
