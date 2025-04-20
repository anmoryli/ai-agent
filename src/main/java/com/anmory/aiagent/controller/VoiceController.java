package com.anmory.aiagent.controller;

import org.springframework.ai.openai.OpenAiAudioSpeechModel;
import org.springframework.ai.openai.OpenAiAudioSpeechOptions;
import org.springframework.ai.openai.audio.speech.SpeechPrompt;
import org.springframework.ai.openai.audio.speech.SpeechResponse;
import org.springframework.ai.openai.metadata.audio.OpenAiAudioSpeechResponseMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午8:03
 */

@RestController
@RequestMapping("/voice")
public class VoiceController {
    @Autowired
    OpenAiAudioSpeechModel openAiAudioSpeechModel;

    @RequestMapping("gVoc")
    public OpenAiAudioSpeechResponseMetadata getVoice(@RequestParam("voice") String voice) {
        OpenAiAudioSpeechOptions speechOptions = OpenAiAudioSpeechOptions.builder()
                .input(voice)
                .build();
        SpeechPrompt speechPrompt = new SpeechPrompt(voice, speechOptions);
        SpeechResponse response = openAiAudioSpeechModel.call(speechPrompt);
        return response.getMetadata();
    }
}
