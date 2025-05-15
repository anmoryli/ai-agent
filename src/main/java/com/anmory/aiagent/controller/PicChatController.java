package com.anmory.aiagent.controller;

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
    @RequestMapping("/gPic")
    public String gPic(@RequestParam("prompt") String prompt) {
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
        return response.getResult().getOutput().getUrl();
    }
}
