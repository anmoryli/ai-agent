package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.MessageMapper;
import com.anmory.aiagent.model.Messages;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午7:28
 */

@Service
public class MessageService {
    @Autowired
    MessageMapper messageMapper;

    public int insert(int sessionId, String senderType, int senderId, String message) {
        return messageMapper.insert(sessionId, senderType, senderId, message);
    }

    public Messages getLastMessageId() {
        return messageMapper.getLastMessageId();
    }

    public List<Messages> getHistoryBySessionIdAndSenderId(int sessionId, int senderId) {
        return messageMapper.getHistoryBySessionIdAndSenderId(sessionId, senderId);
    }
}
