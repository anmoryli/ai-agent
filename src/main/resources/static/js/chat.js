$(document).ready(() => {
  // 检查登录状态
  checkLoginStatus();

  // 加载会话信息
  loadSessionInfo();

  // 加载聊天历史
  loadChatHistory();

  // 加载线索
  loadClues();

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

  // 按Enter键发送消息
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
});

// 检查登录状态
function checkLoginStatus() {
  const user = localStorage.getItem("user");
  const currentSession = localStorage.getItem("currentSession");

  if (!user || !currentSession) {
    // 未登录或没有当前会话，跳转到主页
    window.location.href = "main.html";
  }
}

// 修改loadSessionInfo函数，区分智能体聊天和剧本会话
function loadSessionInfo() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
    $("#session-title").text(currentSession.title);

    // 检查是否是与智能体的单独聊天
    if (currentSession.isAgentChat) {
      // 加载智能体信息
      const agent = JSON.parse(localStorage.getItem("currentAgent"));
      if (agent) {
        $("#script-name").text(agent.agentRole || "角色");

        // 生成智能体相关的背景图片
        generateAgentBackgroundImage(agent);
      } else {
        $("#script-name").text("角色聊天");
        showNotification("未找到角色信息");
      }
    } else {
      // 正常剧本会话
      loadScriptInfo(currentSession.id);

      // 检查是否有选择的剧本
      const scriptName = localStorage.getItem("scriptName");
      if (!scriptName) {
        showNotification("未选择剧本，部分功能可能无法正常使用");
      }
    }
  }
}

// 加载剧本信息
function loadScriptInfo(sessionId) {
  // 这里需要根据会话ID获取关联的剧本信息
  // 由于接口文档中没有直接提供这个接口，这里模拟一下
  $("#script-name").text("加载中...");

  // 实际项目中应该调用后端接口获取剧本信息
  setTimeout(() => {
    $("#script-name").text("推理剧本");
  }, 1000);
}

// 加载聊天历史
function loadChatHistory() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
    $.ajax({
      url: "/his/getHistory",
      type: "GET",
      data: {
        sessionId: currentSession.id,
      },
      success: (response) => {
        if (response && response.length > 0) {
          const messagesContainer = $("#messages-container");
          messagesContainer.empty();

          response.forEach((message) => {
            appendMessage(message);
          });

          // 滚动到底部
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
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
    // 加载当前会话的线索
    $.ajax({
      url: "/clues/getCluesBySessionId",
      type: "GET",
      data: {
        sessionId: currentSession.id,
      },
      success: (response) => {
        if (response && response.length > 0) {
          renderClues(response, "#current-clues");
        } else {
          $("#current-clues").html('<p class="empty-list">暂无线索</p>');
        }
      },
      error: () => {
        showNotification("加载线索失败");
      },
    });

    // 加载剧本的所有线索
    $.ajax({
      url: "/clues/getCluesByScriptId",
      type: "GET",
      data: {
        scriptId: 1, // 这里应该是动态获取的剧本ID
      },
      success: (response) => {
        if (response && response.length > 0) {
          renderClues(response, "#all-clues");
        } else {
          $("#all-clues").html('<p class="empty-list">暂无线索</p>');
        }
      },
      error: () => {
        showNotification("加载线索失败");
      },
    });
  }
}

// 渲染线索列表
function renderClues(clues, containerId) {
  const container = $(containerId);
  container.empty();

  clues.forEach((clue) => {
    const isLocked = clue.isLocked === 0;
    const clueItem = $(`
            <div class="clue-item ${isLocked ? "locked" : ""}" data-id="${
      clue.clueId
    }">
                <div class="clue-header">
                    <div class="clue-title">${clue.clueName}</div>
                    <div class="clue-status">
                        ${isLocked ? "🔒 未解锁" : "✓ 已解锁"}
                    </div>
                </div>
                <div class="clue-content">
                    ${isLocked ? "线索内容已锁定" : clue.clueContent}
                </div>
            </div>
        `);

    container.append(clueItem);
  });
}

// 加载推理记录
function loadDeductions() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
    $.ajax({
      url: "/deductions/getDeductionsBySessionId",
      type: "GET",
      data: {
        sessionId: currentSession.id,
      },
      success: (response) => {
        if (response && response.length > 0) {
          const deductionsList = $("#deductions-list");
          deductionsList.empty();

          response.forEach((deduction) => {
            const deductionItem = $(`
                            <div class="deduction-item" data-id="${
                              deduction.deductionId
                            }">
                                <div class="deduction-header">
                                    <div class="deduction-title">${
                                      deduction.deductionName
                                    }</div>
                                    <div class="deduction-status">
                                        ${
                                          deduction.isFinal === 1
                                            ? "🏆 最终推理"
                                            : ""
                                        }
                                    </div>
                                </div>
                                <div class="deduction-content">
                                    ${deduction.deductionContent}
                                </div>
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
  // 这里应该根据当前剧本的场景生成背景图片
  // 由于接口文档中没有直接提供这个接口，这里模拟一下
  $("#scene-background").attr(
    "src",
    "https://source.unsplash.com/random/1920x1080/?detective"
  );

  // 从本地存储的剧本信息中获取场景描述
  const scriptContent = localStorage.getItem("scriptContent");
  console.log("剧本内容(图像生成提示词):", scriptContent);
  // 从后端获取当前智能体信息
  $.ajax({
    url: "/agent/getAgentById",
    type: "GET",
    data: {
      // 从data-id按钮获取智能体ID
      agentId: $("#send-btn").data("id"),
    },
    success: (response) => {
      console.log("获取智能体信息成功", response);
      // 保存智能体信息到本地存储
      localStorage.setItem("currentAgent", JSON.stringify(response));
    },
  });
  // 从本地获取智能体信息
  var agent = JSON.parse(localStorage.getItem("currentAgent"));
  console.log("生成图片，当前智能体信息", agent);
  //实际项目中应该调用后端接口生成图片
  $.ajax({
    url: "/pic/gPic",
    type: "GET",
    data: {
      prompt: agent.agentRole || "推理的场景",
    },
    success: (response) => {
      if (response) {
        $("#scene-background").attr("src", response);
      }
    },
    error: () => {
      showNotification("生成背景图片失败");
    },
  });
}

// 添加生成智能体背景图片的函数
function generateAgentBackgroundImage(agent) {
  // 设置默认图片
  $("#scene-background").attr(
    "src",
    "https://source.unsplash.com/random/1920x1080/?detective"
  );

  // 调用后端接口生成图片
  $.ajax({
    url: "/pic/gPic",
    type: "GET",
    data: {
      prompt: agent.description || agent.agentRole || "detective character",
    },
    success: (response) => {
      if (response) {
        $("#scene-background").attr("src", response);
      }
    },
    error: () => {
      showNotification("生成背景图片失败");
    },
  });
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
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (
    currentSession &&
    currentSession.autoStart &&
    !currentSession.isAgentChat
  ) {
    // 如果是自动开始且不是智能体聊天，则自动发送一条消息
    setTimeout(() => {
      // 显示AI正在输入的提示
      showTypingIndicator();

      // 获取剧本名称
      const scriptName = localStorage.getItem("scriptName");
      if (!scriptName) {
        removeTypingIndicator();
        showNotification("未选择剧本，请返回主页选择剧本");
        return;
      }

      // 获取会话ID
      const conId = localStorage.getItem("conId") || Date.now().toString();
      localStorage.setItem("conId", conId);

      // 从/script/getScriptContent后端接口获取剧本内容作为role
      $.ajax({
        url: "/script/getScriptContent",
        type: "GET",
        data: {
          scriptName: scriptName,
        },
        success: (response) => {
          if (response) {
            localStorage.setItem("role", response);
            localStorage.setItem("scriptContent", response); // 保存剧本内容

            // 请求AI回复，使用一个引导性的提示
            $.ajax({
              url: "/ai/chat",
              type: "GET",
              data: {
                message: "请开始引导这个剧本的故事",
                scriptName: scriptName,
                sessionId: currentSession.id,
                role: response || "你是一个推理助手",
                conId: conId,
              },
              success: (aiResponse) => {
                // 移除输入提示
                removeTypingIndicator();

                // 添加AI回复到界面
                appendMessage(aiResponse);
                scrollToBottom();

                // 检查是否有新线索解锁
                checkForNewClues();

                // 移除自动开始标记，避免重复触发
                const updatedSession = JSON.parse(
                  localStorage.getItem("currentSession")
                );
                updatedSession.autoStart = false;
                localStorage.setItem(
                  "currentSession",
                  JSON.stringify(updatedSession)
                );
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
    }, 1000); // 延迟1秒，让页面先加载完成
  }
}

// 切换剧本面板
function toggleScriptPanel() {
  closeAllPanels();

  // 加载剧本内容
  const scriptContent = localStorage.getItem("scriptContent");
  if (scriptContent) {
    $("#script-content").text(scriptContent);
  } else {
    // 如果本地没有剧本内容，尝试从服务器获取
    const scriptName = localStorage.getItem("scriptName");
    if (scriptName) {
      $.ajax({
        url: "/script/getScriptContent",
        type: "GET",
        data: {
          scriptName: scriptName,
        },
        success: (response) => {
          if (response) {
            $("#script-content").text(response);
            localStorage.setItem("scriptContent", response);
          } else {
            $("#script-content").text("无法加载剧本内容");
          }
        },
        error: () => {
          $("#script-content").text("加载剧本内容失败");
        },
      });
    } else {
      $("#script-content").text("未选择剧本");
    }
  }

  $("#script-panel").toggleClass("active");
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
    // 添加输入框抖动效果
    messageInput.addClass("shake");
    setTimeout(() => {
      messageInput.removeClass("shake");
    }, 500);
    return;
  }

  // 禁用发送按钮，防止重复发送
  const sendBtn = $("#send-btn");
  sendBtn.prop("disabled", true).css("opacity", "0.7");

  // 清空输入框
  messageInput.val("");
  messageInput.css("height", "auto");

  const currentSession = JSON.parse(localStorage.getItem("currentSession"));
  const user = JSON.parse(localStorage.getItem("user"));

  if (currentSession && user) {
    // 先添加用户消息到界面
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

    // 显示AI正在输入的提示
    showTypingIndicator();

    // 检查是否是与智能体的单独聊天
    if (currentSession.isAgentChat) {
      // 调用智能体聊天函数
      sendMessageToAgent(message, currentSession.id);
    } else {
      // 调用剧本会话函数
      sendMessageToScript(message, currentSession.id);
    }
  }
}

// 添加发送消息给智能体的函数
function sendMessageToAgent(message, sessionId) {
  // 从后端获取当前智能体信息
  $.ajax({
    url: "/agent/getAgentById",
    type: "GET",
    data: {
      // 从data-id按钮获取智能体ID
      agentId: $("#send-btn").data("id"),
    },
    success: (response) => {
      console.log("获取智能体信息成功", response);
      // 保存智能体信息到本地存储
      localStorage.setItem("currentAgent", JSON.stringify(response));
    }
  });
  console.log(
    "当前本地智能体：",
    JSON.parse(localStorage.getItem("currentAgent"))
  );
  const agent = JSON.parse(localStorage.getItem("currentAgent"));
  const sendBtn = $("#send-btn");
  const agentId = $("#send-btn").data("id");
  console.log("当前智能体ID:", agentId);

  console.log("智能体的信息:", agent);
  if (!agent) {
    removeTypingIndicator();
    showNotification("未找到角色信息");
    sendBtn.prop("disabled", false).css("opacity", "1");
    return;
  }

  // 获取会话ID
  var conId = localStorage.getItem("conId") || Date.now().toString();
  // 把conId变成int能存储的大小，不能超过int的范围
  conId = parseInt(conId) % 2147483647;
  console.log("当前记忆会话ID:", conId);
  localStorage.setItem("conId", conId);
  sessionId = conId;
  // 把sessionId变成int能存储的大小，不能超过int的范围
  sessionId = Number.parseInt(sessionId) % Math.pow(2, 31);
  console.log("当前会话ID:", sessionId);

  // 请求AI回复，使用agent.agentRole作为role参数
  $.ajax({
    url: "/ai/chatSingle",
    type: "GET",
    data: {
      message: message,
      sessionId: sessionId,
      role: agent.agentRole || "你是一个角色扮演助手",
      conId: conId,
    },
    success: (aiResponse) => {
      // 移除输入提示
      removeTypingIndicator();

      // 添加AI回复到界面
      appendMessage(aiResponse);
      scrollToBottom();

      // 恢复发送按钮
      sendBtn.prop("disabled", false).css("opacity", "1");
    },
    error: () => {
      removeTypingIndicator();
      showNotification("获取AI回复失败");
      sendBtn.prop("disabled", false).css("opacity", "1");
    },
  });
}

// 添加发送消息给剧本的函数
function sendMessageToScript(message, sessionId) {
  const sendBtn = $("#send-btn");

  // 发送用户消息到后端
  $.ajax({
    url: "/userMsg/getUserSend",
    type: "POST",
    data: {
      sessionId: sessionId,
      message: message,
    },
    success: (response) => {
      console.log("用户消息发送成功", response);
      // 获取会话ID
      const conId = localStorage.getItem("conId") || Date.now().toString();
      localStorage.setItem("conId", conId);

      // 获取剧本名称
      const scriptName = localStorage.getItem("scriptName");
      if (!scriptName) {
        removeTypingIndicator();
        showNotification("未选择剧本，请返回主页选择剧本");
        sendBtn.prop("disabled", false).css("opacity", "1");
        return;
      }

      // 从/script/getScriptContent后端接口获取剧本内容作为role
      $.ajax({
        url: "/script/getScriptContent",
        type: "GET",
        data: {
          // 传入剧本的名称
          scriptName: scriptName,
        },
        success: (response) => {
          if (response) {
            localStorage.setItem("role", response);
            localStorage.setItem("scriptContent", response); // 保存剧本内容

            // 请求AI回复
            $.ajax({
              url: "/ai/chat",
              type: "GET",
              data: {
                message: message,
                sessionId: sessionId,
                role: response || "你是一个推理助手",
                conId: conId,
              },
              success: (aiResponse) => {
                // 移除输入提示
                removeTypingIndicator();

                // 添加AI回复到界面
                appendMessage(aiResponse);
                scrollToBottom();

                // 检查是否有新线索解锁
                checkForNewClues();

                // 检查是否剧情结束
                if (
                  aiResponse.message &&
                  aiResponse.message.includes("剧情结束")
                ) {
                  showStoryEndAnimation();
                }

                // 恢复发送按钮
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

  const messageElement = $(`
    <div class="message ${message.senderType}" data-id="${message.messageId}">
      <div class="message-content">
        ${message.message}
        ${
          message.senderType === "agent"
            ? '<button class="voice-btn" title="播放语音"></button>'
            : ""
        }
      </div>
      <div class="message-time">${messageTime}</div>
    </div>
  `);

  // 添加语音播放功能
  if (message.senderType === "agent") {
    messageElement.find(".voice-btn").click(function () {
      // 如果正在播放，不重复播放
      if ($(this).hasClass("playing")) {
        return;
      }

      playVoice(message.message);
    });
  }

  messagesContainer.append(messageElement);

  // 添加出现动画
  setTimeout(() => {
    messageElement.addClass("visible");
  }, 100);
}

// 修改播放语音函数
function playVoice(text) {
  const voiceBtn = $(".voice-btn").last();

  // 添加播放中状态
  voiceBtn.addClass("playing");

  $.ajax({
    url: "/voice/gVoc",
    type: "GET",
    data: {
      voice: text,
    },
    success: (response) => {
      if (response && response.audioUrl) {
        const audio = new Audio(response.audioUrl);

        // 播放完成后移除状态
        audio.onended = () => {
          voiceBtn.removeClass("playing");
        };

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
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `);

  messagesContainer.append(typingIndicator);
  scrollToBottom();
}

// 移除输入提示
function removeTypingIndicator() {
  $("#typing-indicator").remove();
}

// 检查是否有新线索解锁
function checkForNewClues() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
    $.ajax({
      url: "/clues/getCluesBySessionId",
      type: "GET",
      data: {
        sessionId: currentSession.id,
      },
      success: (response) => {
        if (response && response.length > 0) {
          // 检查是否有新解锁的线索
          const unlockedClues = response.filter((clue) => clue.isLocked === 1);

          if (unlockedClues.length > 0) {
            // 显示线索解锁动画
            showClueUnlockAnimation(unlockedClues[0]);

            // 更新线索列表
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

  // 添加音效
  const unlockSound = new Audio(
    "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAxMQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgb///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA04WKhAAAAAAAAAAAAAAAAAAAA//PUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxAsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxBQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
  );
  unlockSound.play();

  setTimeout(() => {
    unlockAnimation.fadeOut(500);
  }, 3000);
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

  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
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
          // 清空表单
          $("#deduction-name").val("");
          $("#deduction-content").val("");
          $("#is-final").prop("checked", false);

          // 重新加载推理记录
          loadDeductions();

          // 如果是最终推理，显示成功动画
          if (isFinal === 1) {
            showDeductionSuccessAnimation();
          }

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

  // 添加音效
  const successSound = new Audio(
    "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAxMQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgb///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA04WKhAAAAAAAAAAAAAAAAAAAA//PUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxAsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxBQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
  );
  successSound.play();

  // 添加烟花效果
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      createFirework();
    }, i * 200);
  }

  setTimeout(() => {
    successAnimation.fadeOut(500);
  }, 5000);
}

// 显示剧情结束动画
function showStoryEndAnimation() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  // 清空所有线索
  if (currentSession) {
    $.ajax({
      url: "/clues/clearAllClues",
      type: "POST",
      data: {
        sessionId: currentSession.id,
      },
      success: () => {
        console.log("已清空所有线索");
      },
      error: () => {
        console.error("清空线索失败");
      },
    });
  }

  // 显示结束动画
  const endAnimation = $("#story-end-animation");
  endAnimation.css("display", "flex").hide().fadeIn(500);

  // 添加音效
  const endSound = new Audio(
    "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAxMQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgb///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA04WKhAAAAAAAAAAAAAAAAAAAA//PUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxAsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PUxBQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
  );
  endSound.play();

  // 添加烟花效果
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      createFirework();
    }, i * 150);
  }
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

  // 随机位置
  const posX = Math.random() * window.innerWidth;
  const posY = Math.random() * window.innerHeight;
  firework.style.left = `${posX}px`;
  firework.style.top = `${posY}px`;

  // 添加动画
  firework.style.animation = "explosion 1s forwards";

  document.body.appendChild(firework);

  // 移除元素
  setTimeout(() => {
    firework.remove();
  }, 1000);
}

// 获取随机颜色
function getRandomColor() {
  const colors = [
    "#c23757", // 主色
    "#e05a7a", // 浅色
    "#8e2a40", // 深色
    "#d4af37", // 次要色
    "#f0cd5d", // 浅次要色
    "#a88c29", // 深次要色
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 重新开始剧本
function restartStory() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"));

  if (currentSession) {
    // 清空所有线索
    $.ajax({
      url: "/clues/clearAllClues",
      type: "POST",
      data: {
        sessionId: currentSession.id,
      },
      success: () => {
        console.log("已清空所有线索");

        // 隐藏结束动画
        $("#story-end-animation").fadeOut(300);

        // 清空消息容器
        $("#messages-container").empty();

        // 设置自动开始标记
        currentSession.autoStart = true;
        localStorage.setItem("currentSession", JSON.stringify(currentSession));

        // 重新加载页面
        setTimeout(() => {
          location.reload();
        }, 500);
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
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 显示通知
function showNotification(message) {
  $("#notification-message").text(message);
  $("#notification").addClass("active");

  setTimeout(() => {
    $("#notification").removeClass("active");
  }, 3000);
}

// 加载主题设置
$(() => {
  const theme = localStorage.getItem("theme");

  if (theme === "light") {
    $("body").removeClass("dark-theme").addClass("light-theme");
    $("#theme-switch").prop("checked", true);
  }
});
