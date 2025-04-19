package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:20
 */

@Data
public class Sessions {
    private int sessionId;
    private int userId;
    private String title;
    private Date createTime;
    private Date updateTime;
}
