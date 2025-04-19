package com.anmory.aiagent.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.Getter;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:21
 */

@Getter
@Data
public class Messages {
    private int messageId;
    private int sessionId;
    private String senderType;
    private int senderId;
    private String message;
    private Date createTime;
    private Date updateTime;
}
