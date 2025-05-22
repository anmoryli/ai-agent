package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.MessageSingleMapper;
import com.anmory.aiagent.model.MessageSingle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-15 下午10:28
 */

@Service
public class MessageSingleService {
    @Autowired
    MessageSingleMapper messageSingleMapper;

    public int insert(int senderId, int receiverId, String message) {
        return messageSingleMapper.insert(senderId, receiverId, message);
    }

    public MessageSingle getLastMessageId() {
        return messageSingleMapper.getLastMessageId();
    }
}
