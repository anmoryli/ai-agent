package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-15 下午10:27
 */

@Data
public class MessageSingle {
    private int messageId;
    private int senderId;
    private int receiverId;
    private String message;
    private Date createTime;
    private Date updateTime;
}
