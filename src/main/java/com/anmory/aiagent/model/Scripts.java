package com.anmory.aiagent.model;

import lombok.Data;

import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:37
 */

@Data
public class Scripts {
    private int scriptId;
    private String scriptName;
    private String scriptContent;
    private String result;
    private Date createTime;
    private Date updateTime;
}
