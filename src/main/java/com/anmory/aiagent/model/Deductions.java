package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:41
 */

@Data
public class Deductions {
    private int deductionId ;
    private int sessionId ;
    private String deductionName ;
    private String deductionContent ;
    private int isFinal;
    private Date createTime;
    private Date updateTime;
}
