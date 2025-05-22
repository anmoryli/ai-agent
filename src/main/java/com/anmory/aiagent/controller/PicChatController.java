package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Sessions;
import com.anmory.aiagent.service.MessageService;
import com.anmory.aiagent.service.SessionsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.ai.openai.OpenAiImageModel;
import org.springframework.ai.openai.OpenAiImageOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-19 下午11:34
 */

@Slf4j
@RestController
@RequestMapping("/pic")
public class PicChatController {
    @Autowired
    OpenAiImageModel imageModel;
    @Autowired
    MessageService messageService;
    @Autowired
    SessionsService sessionsService;
    @RequestMapping("/gPic")
    public String gPic(Integer sessionId,
            @RequestParam("prompt") String prompt) {
        log.info("[图片生成]sessionId: {}, 提示词: {}", sessionId, prompt);
        Sessions sessions = sessionsService.getSessionById(sessionId);
        if(sessions == null) {
            return "请先创建会话";
        }
        if(sessions.getImgUrl() == null) {
            log.info("提示词是prompt: {}", prompt);
            ImageResponse response = imageModel.call(
                    new ImagePrompt(prompt,
                            OpenAiImageOptions.builder()
                                    .withQuality("hd")
                                    .withN(1)
                                    .withHeight(1024)
                                    .withWidth(1024).build())
            );
            log.info("生成图像的地址: {}", response.getResult().getOutput().getUrl());
            String url = response.getResult().getOutput().getUrl();
            sessionsService.updateSessionImgUrl(sessionId, url);
            return url;
        }
        else {
            return sessions.getImgUrl();
        }
    }
}
