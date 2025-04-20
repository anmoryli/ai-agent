package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:38
 */

@Data
public class Clues {
    private int clueId;
    private int scriptId;
    private String clueName;
    private String clueContent;
    private int isLocked;
    private String unlockCondition;
    private Date createTime;
    private Date updateTime;
}
