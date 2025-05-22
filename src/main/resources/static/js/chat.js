$(document).ready(() => {
  // 初始化 marked 配置
  marked.setOptions({
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    },
    langPrefix: "hljs language-",
  });

  // 检查登录状态
  checkLoginStatus();

  // 加载会话信息
  loadSessionInfo();

  // 加载聊天历史
  loadChatHistory();

  // 加载推理记录
  loadDeductions();

  // 生成背景图片
  generateBackgroundImage();

  // 返回按钮
  $("#back-button").click(() => {
    window.location.href = "main.html";
  });

  // 主题切换
  $("#theme-switch").change(() => {
    toggleTheme();
  });

  // 线索按钮
  $("#clues-btn").click(() => {
    toggleCluesPanel();
  });

  // 推理按钮
  $("#deduction-btn").click(() => {
    toggleDeductionPanel();
  });

  // 查看剧本按钮
  $("#view-script-btn").click(() => {
    toggleScriptPanel();
  });

  // 关闭面板按钮
  $(".close-panel-btn").click(() => {
    closeAllPanels();
  });

  // 线索标签切换
  $(".clues-tabs .tab").click(function () {
    const tab = $(this).data("tab");
    $(".clues-tabs .tab").removeClass("active");
    $(this).addClass("active");
    $(".clues-list").hide();
    $(`#${tab}`).show();
  });

  // 发送消息
  $("#send-btn").click(() => {
    sendMessage();
  });

  // 按 Enter 键发送消息
  $("#message-input").keypress((e) => {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 自动调整输入框高度
  $("#message-input").on("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

  // 提交推理表单
  $("#new-deduction-form").submit((e) => {
    e.preventDefault();
    submitDeduction();
  });

  // 监听消息容器滚动
  $("#messages-container").scroll(() => {
    // 如果滚动到底部，可以添加加载更多历史消息的功能
  });

  // 重新开始按钮
  $("#restart-btn").click(() => {
    restartStory();
  });

  // 返回主页按钮
  $("#back-to-main-btn").click(() => {
    window.location.href = "main.html";
  });

  // 检查是否需要自动开始对话
  checkAutoStart();

  // 获取模型列表
  getAgents();

  // 监听模型选择变化
  $("#model-select").change(function (e) {
    e.preventDefault();
    const selectedAgentId = $(this).val();
    const selectedAgentName = $(this).find("option:selected").text();

    if (selectedAgentId) {
      const selectedAgent = { agentId: selectedAgentId, agentName: selectedAgentName };
      localStorage.setItem("currentAgent", JSON.stringify(selectedAgent));
      console.log("选中的模型:", selectedAgent);
      showNotification("模型 " + selectedAgentName + " 已选择");

      const scriptSingle = JSON.parse(localStorage.getItem("scriptSingle"));
      if (scriptSingle && scriptSingle.scriptId) {
        $.ajax({
          url: "/sessionMan/AllAgentsJoinSession",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ scriptId: scriptSingle.scriptId, agentId: [selectedAgentId] }),
          success: (response) => {
            console.log("模型加入会话成功:", response);
            showNotification("模型 " + selectedAgentName + " 已加入会话");
            sendAgentIdToBackend(selectedAgentId);
            loadSessionInfo();
            loadChatHistory();
          },
          error: (xhr, status, error) => {
            console.error("模型加入会话失败:", error);
            showNotification("模型加入会话失败，请重试");
          },
        });
      } else {
        console.warn("缺少剧本信息，无法加入模型");
        showNotification("未选择剧本，无法加入模型");
      }
    } else {
      localStorage.removeItem("currentAgent");
    }
  });

  // 防止父容器事件干扰
  $(".model-select").click(function (e) {
    e.stopPropagation();
  });

  // 延迟恢复选中的模型
  setTimeout(restoreSelectedAgent, 1000);

  // 获取剧本信息并加载线索
  getScriptSingle();
});

// 检查登录状态
function checkLoginStatus() {
  const user = localStorage.getItem("user");
  const currentSession = localStorage.getItem("currentSession");

  if (!user || !currentSession) {
    window.location.href = "main.html";
  }
}

// 修改loadSessionInfo函数，区分智能体聊天和剧本会话
function loadSessionInfo() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;
  console.log("[加载会话信息]当前会话信息:", currentSession);

  if (currentSession) {
    $("#session-title").text(currentSession.title || "未命名会话");

    if (currentSession.isAgentChat) {
      const agent = JSON.parse(localStorage.getItem("currentAgent")) || {};
      $("#script-name").text(
          (agent.agentRole && agent.agentRole.length > 20 ? agent.agentRole.slice(0, 20) + "..." : agent.agentRole) || "角色"
      );
      generateAgentBackgroundImage(agent);
    } else {
      loadScriptInfo(currentSession.id);
      const scriptName = localStorage.getItem("scriptName");
      if (!scriptName) showNotification("未选择剧本，部分功能可能无法正常使用");
    }
  }
}

// 加载剧本信息
function loadScriptInfo(sessionId) {
  $("#script-name").text("加载中...");
  setTimeout(() => {
    $("#script-name").text("推理剧本");
  }, 1000);
}

// 加载聊天历史
function loadChatHistory() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.id) {
    $.ajax({
      url: "/his/getHistory",
      type: "GET",
      data: { sessionId: currentSession.id },
      success: (response) => {
        if (response && response.length > 0) {
          const messagesContainer = $("#messages-container");
          messagesContainer.empty();
          response.forEach((message) => appendMessage(message));
          scrollToBottom();
        }
      },
      error: () => {
        showNotification("加载聊天历史失败");
      },
    });
  }
}

// 加载线索
function loadClues() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;
  const scriptName = localStorage.getItem("scriptName");

  if (!currentSession || !scriptName) {
    console.warn("缺少会话或剧本名称，无法加载线索");
    $("#current-clues").html('<p class="empty-list">暂无线索</p>');
    $("#all-clues").html('<p class="empty-list">暂无线索</p>');
    showNotification("未选择剧本或会话，线索加载失败");
    return;
  }

  $.ajax({
    url: "/clues/getCluesByScriptId",
    type: "GET",
    data: { scriptName: scriptName },
    success: (response) => {
      if (response && response.length > 0) renderClues(response, "#current-clues");
      else $("#current-clues").html('<p class="empty-list">暂无线索</p>');
    },
    error: () => {
      showNotification("加载线索失败");
    },
  });

  const scriptSingle = JSON.parse(localStorage.getItem("scriptSingle"));
  if (scriptSingle && scriptSingle.scriptName) {
    $.ajax({
      url: "/clues/getCluesByScriptId",
      type: "GET",
      data: { scriptName: scriptSingle.scriptName },
      success: (response) => {
        if (response && response.length > 0) renderClues(response, "#all-clues");
        else $("#all-clues").html('<p class="empty-list">暂无线索</p>');
      },
      error: () => {
        showNotification("加载线索失败");
      },
    });
  } else {
    console.warn("缺少剧本信息，无法加载所有线索");
    $("#all-clues").html('<p class="empty-list">暂无线索</p>');
  }
}

// 渲染线索列表
function renderClues(clues, containerId) {
  const container = $(containerId);
  container.empty();
  clues.forEach((clue) => {
    const isLocked = clue.isLocked === 0;
    const clueItem = $(`
      <div class="clue-item ${isLocked ? "locked" : ""}" data-id="${clue.clueId}">
        <div class="clue-header">
          <div class="clue-title">${clue.clueName}</div>
          <div class="clue-status">${isLocked ? "🔒 未解锁" : "✓ 已解锁"}</div>
        </div>
        <div class="clue-content">${isLocked ? "线索内容已锁定" : clue.clueContent}</div>
      </div>
    `);
    container.append(clueItem);
  });
}

// 加载推理记录
function loadDeductions() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.id) {
    $.ajax({
      url: "/deductions/getDeductionsBySessionId",
      type: "GET",
      data: { sessionId: currentSession.id },
      success: (response) => {
        if (response && response.length > 0) {
          const deductionsList = $("#deductions-list");
          deductionsList.empty();
          response.forEach((deduction) => {
            const deductionItem = $(`
              <div class="deduction-item" data-id="${deduction.deductionId}">
                <div class="deduction-header">
                  <div class="deduction-title">${deduction.deductionName}</div>
                  <div class="deduction-status">${deduction.isFinal === 1 ? "🏆 最终推理" : ""}</div>
                </div>
                <div class="deduction-content">${deduction.deductionContent}</div>
              </div>
            `);
            deductionsList.append(deductionItem);
          });
        } else {
          $("#deductions-list").html('<p class="empty-list">暂无推理记录</p>');
        }
      },
      error: () => {
        showNotification("加载推理记录失败");
      },
    });
  }
}

// 生成背景图片
function generateBackgroundImage() {
  $("#scene-background").attr("src", "https://source.unsplash.com/random/1920x1080/?detective");
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;
  console.log("会话信息", currentSession);

  if (currentSession && currentSession.id !== undefined) {
    console.log("当前会话id", currentSession.id);
    const sessionId = parseInt(currentSession.id, 10);
    console.log("当前会话id转成int", sessionId);

    const scriptContent = localStorage.getItem("scriptContent");
    console.log("剧本内容(图像生成提示词):", scriptContent);

    const agentInfo = JSON.parse(localStorage.getItem("currentAgent"));
    if (agentInfo && agentInfo.agentId) {
      $.ajax({
        url: "/agents/getAgentById",
        type: "GET",
        data: { agentId: agentInfo.agentId },
        success: (response) => {
          console.log("获取智能体信息成功", response);
          localStorage.setItem("currentAgent", JSON.stringify(response));
        },
      });
    }

    const agent = JSON.parse(localStorage.getItem("currentAgent"));
    console.log("生成图片，当前智能体信息", agent);

    $.ajax({
      url: "/pic/gPic",
      type: "GET",
      data: { sessionId: sessionId, prompt: scriptContent || "推理的场景" },
      success: (response) => {
        if (response) $("#scene-background").attr("src", response);
      },
      error: () => {
        showNotification("生成背景图片失败,第一处的失败");
      },
    });
  } else {
    console.error("会话信息无效或缺少 id 属性", currentSession);
    showNotification("无法生成背景图片，会话信息缺失");
  }
}

// 生成智能体背景图片
function generateAgentBackgroundImage(agent) {
  console.log("生成智能体背景图片，当前智能体信息", agent);
  $("#scene-background").attr("src", "https://source.unsplash.com/random/1920x1080/?detective");
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.id !== undefined) {
    console.log("当前会话id:", currentSession.id);
    console.log("会话信息", currentSession);
    const sessionId = parseInt(currentSession.id, 10);

    $.ajax({
      url: "/pic/gPic",
      type: "GET",
      data: { sessionId: sessionId, prompt: agent.agentRole || agent.description || "detective character" },
      success: (response) => {
        if (response) $("#scene-background").attr("src", response);
      },
      error: () => {
        showNotification("生成背景图片失败");
      },
    });
  } else {
    console.error("会话信息无效或缺少 id 属性", currentSession);
    showNotification("无法生成智能体背景图片，会话信息缺失");
  }
}

// 切换线索面板
function toggleCluesPanel() {
  closeAllPanels();
  $("#clues-panel").toggleClass("active");
}

// 切换推理面板
function toggleDeductionPanel() {
  closeAllPanels();
  $("#deduction-panel").toggleClass("active");
}

// 检查是否需要自动开始对话
function checkAutoStart() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.autoStart && !currentSession.isAgentChat) {
    setTimeout(() => {
      showTypingIndicator();

      const scriptName = localStorage.getItem("scriptName");
      if (!scriptName) {
        removeTypingIndicator();
        showNotification("未选择剧本，请返回主页选择剧本");
        return;
      }

      const conId = localStorage.getItem("conId") || Date.now().toString();
      localStorage.setItem("conId", conId);
      const scriptContent = localStorage.getItem("scriptContent");

      let scriptSingle;
      try {
        scriptSingle = JSON.parse(localStorage.getItem("scriptSingle"));
      } catch (e) {
        console.error("解析 scriptSingle 失败:", e);
        removeTypingIndicator();
        showNotification("剧本数据格式错误");
        return;
      }

      $.ajax({
        url: "/script/getScriptContent",
        type: "GET",
        data: { scriptName: scriptName },
        success: (response) => {
          if (response) {
            localStorage.setItem("role", response);
            localStorage.setItem("scriptContent", response);
            console.log("获取剧本内容成功:", response);

            $.ajax({
              url: "/ai/chat",
              type: "GET",
              data: {
                agentId: 0,
                message: "请开始引导这个剧本的故事",
                scriptName: scriptSingle.scriptName || scriptName,
                sessionId: currentSession.id,
                role: response || "你是一个推理助手",
              },
              success: (aiResponse) => {
                console.log("AI回复自动引导剧情:", aiResponse);
                removeTypingIndicator();
                appendMessage(aiResponse);
                scrollToBottom();
                checkForNewClues();

                currentSession.autoStart = false;
                localStorage.setItem("currentSession", JSON.stringify(currentSession));
              },
              error: () => {
                removeTypingIndicator();
                showNotification("获取AI回复失败");
              },
            });
          } else {
            removeTypingIndicator();
            showNotification("加载剧本内容失败");
          }
        },
        error: () => {
          removeTypingIndicator();
          showNotification("加载剧本内容失败");
        },
      });
    }, 1000);
  }
}

// 切换剧本面板
function toggleScriptPanel() {
  closeAllPanels();

  const scriptContent = localStorage.getItem("scriptContent");
  if (scriptContent) {
    $("#script-content").text(scriptContent);
  } else {
    const scriptName = localStorage.getItem("scriptName");
    if (scriptName) {
      $.ajax({
        url: "/script/getScriptContent",
        type: "GET",
        data: { scriptName: scriptName },
        success: (response) => {
          if (response) {
            $("#script-content").text(response);
            localStorage.setItem("scriptContent", response);
          } else {
            $("#script-content").text("未选择剧本");
          }
        },
        error: () => {
          $("#script-content").text("未选择剧本");
        },
      });
    } else {
      $("#script-content").text("未选择剧本");
    }
  }

  $("#script-panel").toggleClass("active");
}

// 获取剧本
function getScriptSingle() {
  const scriptName = localStorage.getItem("scriptName");
  console.log("当前选择的剧本名称：", scriptName);

  if (!scriptName) {
    console.warn("未找到当前选择的剧本");
    showNotification("未选择剧本，请返回主页选择");
    return;
  }

  $.ajax({
    url: "/script/getScriptSingle",
    type: "GET",
    data: { scriptName: scriptName },
    success: (response) => {
      if (response) {
        console.log("获取单个剧本成功:", response);
        localStorage.setItem("scriptSingle", JSON.stringify(response));
        loadClues();
      } else {
        $("#script-list").html('<p class="empty-list">暂无剧本</p>');
        showNotification("获取剧本信息失败");
      }
    },
    error: () => {
      showNotification("获取剧本信息失败");
    },
  });
}

// 关闭所有面板
function closeAllPanels() {
  $(".clues-panel, .deduction-panel, .script-panel").removeClass("active");
}

// 修改sendMessage函数，区分智能体聊天和剧本会话
function sendMessage() {
  const messageInput = $("#message-input");
  const message = messageInput.val().trim();

  if (!message) {
    messageInput.addClass("shake");
    setTimeout(() => messageInput.removeClass("shake"), 500);
    return;
  }

  const sendBtn = $("#send-btn");
  sendBtn.prop("disabled", true).css("opacity", "0.7");

  messageInput.val("");
  messageInput.css("height", "auto");

  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;
  const user = JSON.parse(localStorage.getItem("user"));

  if (currentSession && currentSession.id && user) {
    const userMessage = {
      messageId: Date.now(),
      sessionId: currentSession.id,
      senderType: "user",
      senderId: user.userId,
      message: message,
      createTime: new Date().toISOString(),
    };

    appendMessage(userMessage);
    scrollToBottom();

    showTypingIndicator();

    if (currentSession.isAgentChat) sendMessageToAgent(message, currentSession.id);
    else sendMessageToScript(message, currentSession.id);
  } else {
    removeTypingIndicator();
    showNotification("会话或用户信息无效");
    sendBtn.prop("disabled", false).css("opacity", "1");
  }
}

// 发送消息给智能体
function sendMessageToAgent(message, sessionId) {
  const agentInfo = JSON.parse(localStorage.getItem("currentAgent"));
  const sendBtn = $("#send-btn");

  if (!agentInfo || !agentInfo.agentId) {
    removeTypingIndicator();
    showNotification("未找到角色信息");
    sendBtn.prop("disabled", false).css("opacity", "1");
    return;
  }

  var conId = localStorage.getItem("conId") || Date.now().toString();
  conId = parseInt(conId) % 2147483647;
  localStorage.setItem("conId", conId);

  $.ajax({
    url: "/ai/chatSingle",
    type: "GET",
    data: {
      message: message,
      sessionId: sessionId, // 使用原始 sessionId，而非 conId
      role: agentInfo.agentRole || "你是一个角色扮演助手",
      conId: conId,
    },
    success: (aiResponse) => {
      removeTypingIndicator();
      appendMessage(aiResponse);
      scrollToBottom();
      sendBtn.prop("disabled", false).css("opacity", "1");
    },
    error: () => {
      removeTypingIndicator();
      showNotification("获取AI回复失败");
      sendBtn.prop("disabled", false).css("opacity", "1");
    },
  });
}

// 发送消息给剧本
function sendMessageToScript(message, sessionId) {
  const sendBtn = $("#send-btn");

  $.ajax({
    url: "/userMsg/getUserSend",
    type: "POST",
    data: { sessionId: sessionId, message: message },
    success: (response) => {
      console.log("用户消息发送成功", response);
      const conId = localStorage.getItem("conId") || Date.now().toString();
      localStorage.setItem("conId", conId);

      const scriptName = localStorage.getItem("scriptName");
      if (!scriptName) {
        removeTypingIndicator();
        showNotification("未选择剧本，请返回主页选择剧本");
        sendBtn.prop("disabled", false).css("opacity", "1");
        return;
      }

      const currentAgent = JSON.parse(localStorage.getItem("currentAgent")) || { agentId: 0 };

      $.ajax({
        url: "/script/getScriptContent",
        type: "GET",
        data: { scriptName: scriptName },
        success: (response) => {
          if (response) {
            localStorage.setItem("role", response);
            localStorage.setItem("scriptContent", response);

            $.ajax({
              url: "/ai/chat",
              type: "GET",
              data: {
                agentId: currentAgent.agentId,
                message: message,
                sessionId: sessionId,
                scriptName: scriptName,
                role: response || "你是一个推理助手",
                conId: conId,
              },
              success: (aiResponse) => {
                console.log("AI Response:", aiResponse);
                removeTypingIndicator();
                appendMessage(aiResponse);
                scrollToBottom();
                checkForNewClues();

                if (aiResponse.message && aiResponse.message.includes("剧情结束")) showStoryEndAnimation();

                sendBtn.prop("disabled", false).css("opacity", "1");
              },
              error: () => {
                removeTypingIndicator();
                showNotification("获取AI回复失败");
                sendBtn.prop("disabled", false).css("opacity", "1");
              },
            });
          } else {
            removeTypingIndicator();
            showNotification("加载剧本内容失败");
            sendBtn.prop("disabled", false).css("opacity", "1");
          }
        },
        error: () => {
          removeTypingIndicator();
          showNotification("加载剧本内容失败");
          sendBtn.prop("disabled", false).css("opacity", "1");
        },
      });
    },
    error: () => {
      removeTypingIndicator();
      showNotification("发送消息失败");
      sendBtn.prop("disabled", false).css("opacity", "1");
    },
  });
}

// 添加消息到界面
function appendMessage(message) {
  const messagesContainer = $("#messages-container");
  const messageTime = formatTime(message.createTime);

  const safeHTML = DOMPurify.sanitize(marked.parse(message.message || ""));

  const messageElement = $(`
    <div class="message ${message.senderType}" data-id="${message.messageId || Date.now()}">
      <div class="message-content">${safeHTML}
        ${message.senderType === "agent" ? '<button class="voice-btn" title="播放语音"></button>' : ""}
      </div>
      <div class="message-time">${messageTime}</div>
    </div>
  `);

  messagesContainer.append(messageElement);

  if (message.senderType === "agent") {
    messageElement.find(".voice-btn").click(function () {
      if ($(this).hasClass("playing")) return;
      playVoice(message.message);
    });
  }

  setTimeout(() => messageElement.addClass("visible"), 100);
  scrollToBottom();
}

// 播放语音
function playVoice(text) {
  const voiceBtn = $(".voice-btn").last();
  voiceBtn.addClass("playing");

  $.ajax({
    url: "/voice/gVoc",
    type: "GET",
    data: { voice: text },
    success: (response) => {
      if (response && response.audioUrl) {
        const audio = new Audio(response.audioUrl);
        audio.onended = () => voiceBtn.removeClass("playing");
        audio.play();
      } else {
        voiceBtn.removeClass("playing");
        showNotification("语音生成失败");
      }
    },
    error: () => {
      voiceBtn.removeClass("playing");
      showNotification("语音生成失败");
    },
  });
}

// 显示AI正在输入的提示
function showTypingIndicator() {
  const messagesContainer = $("#messages-container");
  const typingIndicator = $(`
    <div class="typing-indicator" id="typing-indicator">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
    </div>
  `);
  messagesContainer.append(typingIndicator);
  scrollToBottom();
}

// 移除输入提示
function removeTypingIndicator() {
  $("#typing-indicator").remove();
}

// 检查新线索
let lastUnlockedCount = 0;
function checkForNewClues() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;
  const scriptSingle = JSON.parse(localStorage.getItem("scriptSingle"));

  if (currentSession && scriptSingle && scriptSingle.scriptName) {
    $.ajax({
      url: "/clues/getCluesByScriptId",
      type: "GET",
      data: { scriptName: scriptSingle.scriptName },
      success: (response) => {
        if (response && response.length > 0) {
          const unlockedClues = response.filter((clue) => clue.isLocked === 1);
          if (unlockedClues.length > lastUnlockedCount) {
            lastUnlockedCount = unlockedClues.length;
            showClueUnlockAnimation(unlockedClues[0]);
            renderClues(response, "#current-clues");
          }
        }
      },
    });
  }
}

// 显示线索解锁动画
function showClueUnlockAnimation(clue) {
  $("#unlocked-clue-name").text(clue.clueName);
  const unlockAnimation = $("#clue-unlock-animation");
  unlockAnimation.css("display", "flex").hide().fadeIn(500);

  const unlockSound = new Audio(
      "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAxMQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgb///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA04WKhAAAAAAAAAAAAAAAAAAAA//PUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxAsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxBQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
  );
  unlockSound.play();

  setTimeout(() => unlockAnimation.fadeOut(500), 3000);
}

// 提交推理
function submitDeduction() {
  const deductionName = $("#deduction-name").val().trim();
  const deductionContent = $("#deduction-content").val().trim();
  const isFinal = $("#is-final").is(":checked") ? 1 : 0;

  if (!deductionName || !deductionContent) {
    showNotification("请填写完整的推理信息");
    return;
  }

  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.id) {
    $.ajax({
      url: "/deductions/addDeduction",
      type: "POST",
      data: {
        sessionId: currentSession.id,
        deductionName: deductionName,
        deductionContent: deductionContent,
        isFinal: isFinal,
      },
      success: (response) => {
        if (response) {
          $("#deduction-name").val("");
          $("#deduction-content").val("");
          $("#is-final").prop("checked", false);
          loadDeductions();
          if (isFinal === 1) showDeductionSuccessAnimation();
          showNotification("推理提交成功");
        } else {
          showNotification("推理提交失败");
        }
      },
      error: () => {
        showNotification("推理提交失败");
      },
    });
  }
}

// 显示推理成功动画
function showDeductionSuccessAnimation() {
  const successAnimation = $("#deduction-success-animation");
  successAnimation.css("display", "flex").hide().fadeIn(500);

  const successSound = new Audio(
      "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAxMQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgb///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA04WKhAAAAAAAAAAAAAAAAAAAA//PUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxAsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxBQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
  );
  successSound.play();

  for (let i = 0; i < 20; i++) setTimeout(createFirework, i * 200);

  setTimeout(() => successAnimation.fadeOut(500), 5000);
}

// 获取模型列表
function getAgents() {
  const scriptSingle = JSON.parse(localStorage.getItem("scriptSingle"));
  console.log("获取模型列表，当前剧本:", scriptSingle);

  if (!scriptSingle || !scriptSingle.scriptId) {
    console.warn("缺少剧本信息，无法获取模型列表");
    $("#model-select").find("option:not(:first)").remove();
    $("#model-select").append('<option value="">无可用模型</option>');
    showNotification("未选择剧本，无法加载模型");
    return;
  }

  $("#model-select").prop("disabled", true);
  $("#model-select").find("option:not(:first)").remove();
  $("#model-select").append('<option value="">加载中...</option>');

  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: { scriptId: scriptSingle.scriptId },
    success: (response) => {
      $("#model-select").prop("disabled", false);
      $("#model-select").find("option:not(:first)").remove();
      if (response && response.length > 0) {
        response.forEach((agent) => {
          const option = $("<option>").val(agent.agentId).text(agent.agentName);
          $("#model-select").append(option);
        });
        restoreSelectedAgent();
      } else {
        console.warn("响应数据为空或格式不正确:", response);
        $("#model-select").append('<option value="">无可用模型</option>');
      }
    },
    error: (xhr, status, error) => {
      console.error("获取模型列表失败:", error);
      $("#model-select").prop("disabled", false);
      $("#model-select").append('<option value="">加载失败，请重试</option>');
    },
  });
}

// 恢复选中的模型
function restoreSelectedAgent() {
  const currentAgent = JSON.parse(localStorage.getItem("currentAgent"));
  if (currentAgent && currentAgent.agentId) {
    $("#model-select").val(currentAgent.agentId);
    console.log("恢复选中的模型:", currentAgent);
  } else {
    $("#model-select").val("");
  }
}

// 传递 agentId 到后端
function sendAgentIdToBackend(agentId) {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (!currentSession || !currentSession.id) {
    console.warn("缺少会话信息，无法传递 agentId");
    showNotification("未找到会话信息，无法设置模型");
    return;
  }

  $.ajax({
    url: "/agents/setActiveAgent",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ sessionId: currentSession.id, agentId: agentId }),
    success: (response) => {
      console.log("agentId 传递成功:", response);
      showNotification("模型已激活");
    },
    error: (xhr, status, error) => {
      console.error("agentId 传递失败:", error);
      showNotification("模型激活失败，请重试");
    },
  });
}

// 显示剧情结束动画
function showStoryEndAnimation() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.id) {
    $.ajax({
      url: "/clues/clearAllClues",
      type: "POST",
      data: { sessionId: currentSession.id },
      success: () => console.log("已清空所有线索"),
      error: () => console.error("清空线索失败"),
    });
  }

  const endAnimation = $("#story-end-animation");
  endAnimation.css("display", "flex").hide().fadeIn(500);

  const endSound = new Audio(
      "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAxMQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgb///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA04WKhAAAAAAAAAAAAAAAAAAAA//PUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxAsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxBQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
  );
  endSound.play();

  for (let i = 0; i < 30; i++) setTimeout(createFirework, i * 150);
}

// 创建烟花效果
function createFirework() {
  const firework = document.createElement("div");
  firework.style.position = "fixed";
  firework.style.width = "5px";
  firework.style.height = "5px";
  firework.style.borderRadius = "50%";
  firework.style.backgroundColor = getRandomColor();
  firework.style.boxShadow = `0 0 10px ${getRandomColor()}`;
  firework.style.pointerEvents = "none";
  firework.style.zIndex = "1000";

  const posX = Math.random() * window.innerWidth;
  const posY = Math.random() * window.innerHeight;
  firework.style.left = `${posX}px`;
  firework.style.top = `${posY}px`;

  firework.style.animation = "explosion 1s forwards";
  document.body.appendChild(firework);

  setTimeout(() => firework.remove(), 1000);
}

// 获取随机颜色
function getRandomColor() {
  const colors = ["#c23757", "#e05a7a", "#8e2a40", "#d4af37", "#f0cd5d", "#a88c29"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 重新开始剧本
function restartStory() {
  const currentSessionStr = localStorage.getItem("currentSession");
  const currentSession = currentSessionStr ? JSON.parse(currentSessionStr) : null;

  if (currentSession && currentSession.id) {
    $.ajax({
      url: "/clues/clearAllClues",
      type: "POST",
      data: { sessionId: currentSession.id },
      success: () => {
        console.log("已清空所有线索");
        $("#story-end-animation").fadeOut(300);
        $("#messages-container").empty();
        currentSession.autoStart = true;
        localStorage.setItem("currentSession", JSON.stringify(currentSession));
        setTimeout(() => location.reload(), 500);
      },
      error: () => {
        showNotification("重新开始失败");
      },
    });
  }
}

// 滚动到底部
function scrollToBottom() {
  const messagesContainer = document.getElementById("messages-container");
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 切换主题
function toggleTheme() {
  if ($("body").hasClass("dark-theme")) {
    $("body").removeClass("dark-theme").addClass("light-theme");
    localStorage.setItem("theme", "light");
  } else {
    $("body").removeClass("light-theme").addClass("dark-theme");
    localStorage.setItem("theme", "dark");
  }
}

// 格式化时间
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

// 显示通知
function showNotification(message) {
  $("#notification-message").text(message);
  $("#notification").addClass("active");
  setTimeout(() => $("#notification").removeClass("active"), 3000);
}

// 加载主题设置
$(() => {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    $("body").removeClass("dark-theme").addClass("light-theme");
    $("#theme-switch").prop("checked", true);
  }
});