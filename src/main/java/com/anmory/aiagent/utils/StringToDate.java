package com.anmory.aiagent.utils;

import lombok.extern.slf4j.Slf4j;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午8:56
 */

@Slf4j
public class StringToDate {
    public static Date toDate(String date) {
        // 定义日期格式
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

        try {
            // 将字符串解析为 Date 对象
            return dateFormat.parse(date);
        } catch (ParseException e) {
            // 如果解析失败，打印错误信息并返回 null
            log.error("日期解析失败: " + e.getMessage());
            return null;
        }
    }
}
