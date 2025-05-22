package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Scripts;
import com.anmory.aiagent.model.Sessions;
import com.anmory.aiagent.model.User;
import com.anmory.aiagent.service.CluesService;
import com.anmory.aiagent.service.ScriptService;
import com.anmory.aiagent.service.ScriptsAgentsService;
import com.anmory.aiagent.service.SessionsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-20 上午10:44
 */

@Slf4j
@RestController
@RequestMapping("/script")
public class ScriptController {
    @Autowired
    ScriptService scriptService;
    @Autowired
    OpenAiChatModel openAiChatModel;
    @Autowired
    CluesService cluesService;
    @Autowired
    SessionsService sessionsService;
    @Autowired
    ScriptsAgentsService scriptAgentsService;
    @Autowired
    SqlSessionFactory sqlSessionFactory;
    @Autowired
    JdbcTemplate jdbcTemplate;

    private int jdbcUpdate(String sql) {
        return jdbcTemplate.update(sql);
    }
    @RequestMapping("/chooseScript")
    public Scripts chooseScript(@RequestParam String scriptName,
                                HttpServletRequest request) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        Scripts script = scriptService.selectLastScripts();
        Sessions sessions = sessionsService.getLastSessionId();
        // 把剧本更新到会话中
        sessionsService.insertSessionScript(user.getUserId(),sessions.getSessionId());
        return script;
    }

    @RequestMapping("/getScriptContent")
    public String getScriptContent(@RequestParam String scriptName) {
        Scripts script = scriptService.selectScriptsBySessionName(scriptName);
        log.info("[获取剧本内容]剧本内容:"+scriptName+",scriptContent:"+script.getScriptContent());
        return script.getScriptContent();
    }

    @RequestMapping("/getScriptSingle")
    public Scripts getScriptSingle(@RequestParam String scriptName) {
        Scripts script = scriptService.selectScriptsBySessionName(scriptName);
        log.info("[获取剧本内容]剧本内容:"+scriptName+",scriptContent:"+script.getScriptContent());
        return script;
    }

    @RequestMapping("/deleteScript")
    public int deleteScript(@RequestParam String scriptName) {
        Scripts scripts  = scriptService.selectScriptsBySessionName(scriptName);
        log.info("[删除剧本]删除的剧本:"+scriptName);
        cluesService.deleteCluesByScriptId(scripts.getScriptId());
        scriptAgentsService.deleteAllAgentsOfScript(scripts.getScriptId());
        return scriptService.deleteScript(scriptName);
    }

    @RequestMapping("/createScript")
    public Scripts createScript(HttpServletRequest request,
                           @RequestParam String scriptName,
                           @RequestParam String scriptContent,
                            @RequestParam String result) {
        Scripts scripts = scriptService.selectScriptsBySessionName(scriptName);
        if(scripts != null) {
            log.info("[创建剧本]剧本已存在:"+scriptName);
            return null;
        }
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("session_user_key");
        if("xyh".equals(user.getUserName())) {
            int re = scriptService.insertScripts(scriptName,scriptContent,result);
            int scriptId = scriptService.selectScriptsBySessionName(scriptName).getScriptId();
            // AI生成线索
            String role = "你是一个sql生成助手，你需要根据下面这个表生成insert语句：" +
                    "drop table if exists clues;\n" +
                    "create table if not exists clues(\n" +
                    "    clue_id int auto_increment primary key not null ,\n" +
                    "    script_id int not null ,\n" +
                    "    clue_name varchar(200),\n" +
                    "    clue_content text,\n" +
                    "    is_locked int default 0,\n" +
                    "    unlock_condition text,\n" +
                    "    create_time datetime default now(),\n" +
                    "    update_time datetime on update now(),\n" +
                    "    foreign key (script_id) references scripts(script_id)\n" +
                    ");" +
                    "你需要生成的sql语句类似这样：" +
                    "INSERT INTO clues (script_id, clue_name, clue_content, is_locked, unlock_condition) VALUES\n" +
                    "                                                                                        (1, '染血的匕首', '书房地板上的匕首，刀柄上有“J.B.”的刻字。', 0, NULL),\n" +
                    "                                                                                        (1, '詹姆斯的争吵记录', '管家证词，詹姆斯在晚宴前与亨利激烈争吵，提到“旧账”。', 1, '玩家需在会话中提及“争吵”或“管家”。'),\n" +
                    "                                                                                        (1, '詹姆斯的日记', '詹姆斯房间的日记，记录了他对亨利的仇恨和计划。', 1, '玩家需在会话中提及“詹姆斯房间”或“日记”。');\n" +
                    "其中的script_id是 "+ scriptId+",剩下的内容你需要根据" + scriptContent + "自行生成，生成的insert语句在2~8条左右，" +
                    "你不能使用markdown格式进行生成，你必须返回纯净的sql语句，那种我复制了就可以直接去数据库执行的sql。" +
                    "刚开始的is_locked都是1";
            ChatClient chatClient = ChatClient.builder(openAiChatModel)
                    .defaultSystem(role)
                    .build();
            String sql = chatClient.prompt()
                    .user(scriptContent)
                    .call()
                    .content();
            log.info("[生成线索]生成线索sql:"+sql);
            int ret = jdbcUpdate(sql);
            log.info("[生成线索]生成线索sql返回:"+ret);
            return scriptService.selectScriptsBySessionName(scriptName);
        }
        else if("anmory".equals(user.getUserName())) {
            int re = scriptService.insertScripts(scriptName,scriptContent,result);
            int scriptId = scriptService.selectScriptsBySessionName(scriptName).getScriptId();
            // AI生成线索
            String role = "你是一个sql生成助手，你需要根据下面这个表生成insert语句：" +
                    "drop table if exists clues;\n" +
                    "create table if not exists clues(\n" +
                    "    clue_id int auto_increment primary key not null ,\n" +
                    "    script_id int not null ,\n" +
                    "    clue_name varchar(200),\n" +
                    "    clue_content text,\n" +
                    "    is_locked int default 0,\n" +
                    "    unlock_condition text,\n" +
                    "    create_time datetime default now(),\n" +
                    "    update_time datetime on update now(),\n" +
                    "    foreign key (script_id) references scripts(script_id)\n" +
                    ");" +
                    "你需要生成的sql语句类似这样：" +
                    "INSERT INTO clues (script_id, clue_name, clue_content, is_locked, unlock_condition) VALUES\n" +
                    "                                                                                        (1, '染血的匕首', '书房地板上的匕首，刀柄上有“J.B.”的刻字。', 0, NULL),\n" +
                    "                                                                                        (1, '詹姆斯的争吵记录', '管家证词，詹姆斯在晚宴前与亨利激烈争吵，提到“旧账”。', 1, '玩家需在会话中提及“争吵”或“管家”。'),\n" +
                    "                                                                                        (1, '詹姆斯的日记', '詹姆斯房间的日记，记录了他对亨利的仇恨和计划。', 1, '玩家需在会话中提及“詹姆斯房间”或“日记”。');\n" +
                    "其中的script_id是 "+ scriptId+",剩下的内容你需要根据" + scriptContent + "自行生成，生成的insert语句在2~8条左右，" +
                    "你不能使用markdown格式进行生成，你必须返回纯净的sql语句，那种我复制了就可以直接去数据库执行的sql。" +
                    "刚开始的is_locked都是1";
            ChatClient chatClient = ChatClient.builder(openAiChatModel)
                    .defaultSystem(role)
                    .build();
            String sql = chatClient.prompt()
                    .user(scriptContent)
                    .call()
                    .content();
            log.info("[生成线索]生成线索sql:"+sql);
            int ret = jdbcUpdate(sql);
            log.info("[生成线索]生成线索sql返回:"+ret);
            return scriptService.selectScriptsBySessionName(scriptName);
        }
        else {
            return null;
        }
    }

    @RequestMapping("/getScripts")
    public List<Scripts> getScripts() {
        return scriptService.getScripts();
    }
}
