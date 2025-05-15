$(document).ready(() => {
  // 检查登录状态
  checkLoginStatus()

  // 加载会话信息
  loadSessionInfo()

  // 加载聊天历史
  loadChatHistory()

  // 加载线索
  loadClues()

  // 加载推理记录
  loadDeductions()

  // 生成背景图片
  generateBackgroundImage()

  // 返回按钮
  $("#back-button").click(() => {
    window.location.href = "main.html"
  })

  // 主题切换
  $("#theme-switch").change(() => {
    toggleTheme()
  })

  // 线索按钮
  $("#clues-btn").click(() => {
    toggleCluesPanel()
  })

  // 推理按钮
  $("#deduction-btn").click(() => {
    toggleDeductionPanel()
  })

  // 关闭面板按钮
  $(".close-panel-btn").click(() => {
    closeAllPanels()
  })

  // 线索标签切换
  $(".clues-tabs .tab").click(function () {
    const tab = $(this).data("tab")
    $(".clues-tabs .tab").removeClass("active")
    $(this).addClass("active")
    $(".clues-list").hide()
    $(`#${tab}`).show()
  })

  // 发送消息
  $("#send-btn").click(() => {
    sendMessage()
  })

  // 按Enter键发送消息
  $("#message-input").keypress((e) => {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  // 自动调整输入框高度
  $("#message-input").on("input", function () {
    this.style.height = "auto"
    this.style.height = this.scrollHeight + "px"
  })

  // 提交推理表单
  $("#new-deduction-form").submit((e) => {
    e.preventDefault()
    submitDeduction()
  })

  // 监听消息容器滚动
  $("#messages-container").scroll(() => {
    // 如果滚动到底部，可以添加加载更多历史消息的功能
  })
})

// 检查登录状态
function checkLoginStatus() {
  const user = localStorage.getItem("user")
  const currentSession = localStorage.getItem("currentSession")

  if (!user || !currentSession) {
    // 未登录或没有当前会话，跳转到主页
    window.location.href = "main.html"
  }
}

// 加载会话信息
function loadSessionInfo() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"))

  if (currentSession) {
    $("#session-title").text(currentSession.title)

    // 加载剧本信息
    loadScriptInfo(currentSession.id)
  }
}

// 加载剧本信息
function loadScriptInfo(sessionId) {
  // 这里需要根据会话ID获取关联的剧本信息
  // 由于接口文档中没有直接提供这个接口，这里模拟一下
  $("#script-name").text("加载中...")

  // 实际项目中应该调用后端接口获取剧本信息
  setTimeout(() => {
    $("#script-name").text("推理剧本")
  }, 1000)
}

// 加载聊天历史
function loadChatHistory() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"))

  if (currentSession) {
    $.ajax({
      url: "/his/getHistory",
      type: "GET",
      data: {
        sessionId: currentSession.id,
      },
      success: (response) => {
        if (response && response.length > 0) {
          const messagesContainer = $("#messages-container")
          messagesContainer.empty()

          response.forEach((message) => {
            appendMessage(message)
          })

          // 滚动到底部
          scrollToBottom()
        }
      },
      error: () => {
        showNotification("加载聊天历史失败")
      },
    })
  }
}

// 加载线索
function loadClues() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"))

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
          renderClues(response, "#current-clues")
        } else {
          $("#current-clues").html('<p class="empty-list">暂无线索</p>')
        }
      },
      error: () => {
        showNotification("加载线索失败")
      },
    })

    // 加载剧本的所有线索
    $.ajax({
      url: "/clues/getCluesByScriptId",
      type: "GET",
      data: {
        scriptId: 1, // 这里应该是动态获取的剧本ID
      },
      success: (response) => {
        if (response && response.length > 0) {
          renderClues(response, "#all-clues")
        } else {
          $("#all-clues").html('<p class="empty-list">暂无线索</p>')
        }
      },
      error: () => {
        showNotification("加载线索失败")
      },
    })
  }
}

// 渲染线索列表
function renderClues(clues, containerId) {
  const container = $(containerId)
  container.empty()

  clues.forEach((clue) => {
    const isLocked = clue.isLocked === 0
    const clueItem = $(`
            <div class="clue-item ${isLocked ? "locked" : ""}" data-id="${clue.clueId}">
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
        `)

    container.append(clueItem)
  })
}

// 加载推理记录
function loadDeductions() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"))

  if (currentSession) {
    $.ajax({
      url: "/deductions/getDeductionsBySessionId",
      type: "GET",
      data: {
        sessionId: currentSession.id,
      },
      success: (response) => {
        if (response && response.length > 0) {
          const deductionsList = $("#deductions-list")
          deductionsList.empty()

          response.forEach((deduction) => {
            const deductionItem = $(`
                            <div class="deduction-item" data-id="${deduction.deductionId}">
                                <div class="deduction-header">
                                    <div class="deduction-title">${deduction.deductionName}</div>
                                    <div class="deduction-status">
                                        ${deduction.isFinal === 1 ? "🏆 最终推理" : ""}
                                    </div>
                                </div>
                                <div class="deduction-content">
                                    ${deduction.deductionContent}
                                </div>
                            </div>
                        `)

            deductionsList.append(deductionItem)
          })
        } else {
          $("#deductions-list").html('<p class="empty-list">暂无推理记录</p>')
        }
      },
      error: () => {
        showNotification("加载推理记录失败")
      },
    })
  }
}

// 生成背景图片
function generateBackgroundImage() {
  // 这里应该根据当前剧本的场景生成背景图片
  // 由于接口文档中没有直接提供这个接口，这里模拟一下
  $("#scene-background").attr("src", "https://source.unsplash.com/random/1920x1080/?detective")

  //实际项目中应该调用后端接口生成图片
  $.ajax({
      url: '/pic/gPic',
      type: 'GET',
      data: {
          prompt: '推理场景'
      },
      success: function(response) {
          if (response) {
              $('#scene-background').attr('src', response);
          }
      },
      error: function() {
          showNotification('生成背景图片失败');
      }
  });
}

// 切换线索面板
function toggleCluesPanel() {
  closeAllPanels()
  $("#clues-panel").toggleClass("active")
}

// 切换推理面板
function toggleDeductionPanel() {
  closeAllPanels()
  $("#deduction-panel").toggleClass("active")
}

// 关闭所有面板
function closeAllPanels() {
  $(".clues-panel, .deduction-panel").removeClass("active")
}

// 发送消息
function sendMessage() {
  const messageInput = $("#message-input")
  const message = messageInput.val().trim()

  if (!message) {
    return
  }

  // 清空输入框
  messageInput.val("")
  messageInput.css("height", "auto")

  const currentSession = JSON.parse(localStorage.getItem("currentSession"))
  const user = JSON.parse(localStorage.getItem("user"))

  if (currentSession && user) {
    // 先添加用户消息到界面
    const userMessage = {
      messageId: Date.now(),
      sessionId: currentSession.id,
      senderType: "user",
      senderId: user.userId,
      message: message,
      createTime: new Date().toISOString(),
    }

    appendMessage(userMessage)
    scrollToBottom()

    // 显示AI正在输入的提示
    showTypingIndicator()

    // 发送用户消息到后端
    $.ajax({
      url: "/userMsg/getUserSend",
      type: "POST",
      data: {
        sessionId: currentSession.id,
        message: message,
      },
      success: (response) => {
        // 获取会话ID
        const conId = localStorage.getItem("conId") || Date.now().toString()
        localStorage.setItem("conId", conId)

        // 请求AI回复
        $.ajax({
          url: "/ai/chat",
          type: "GET",
          data: {
            message: message,
            sessionId: currentSession.id,
            role: "你是一个推理助手",
            conId: conId,
          },
          success: (aiResponse) => {
            // 移除输入提示
            removeTypingIndicator()

            // 添加AI回复到界面
            appendMessage(aiResponse)
            scrollToBottom()

            // 检查是否有新线索解锁
            checkForNewClues()
          },
          error: () => {
            removeTypingIndicator()
            showNotification("获取AI回复失败")
          },
        })
      },
      error: () => {
        removeTypingIndicator()
        showNotification("发送消息失败")
      },
    })
  }
}

// 添加消息到界面
function appendMessage(message) {
  const messagesContainer = $("#messages-container")
  const messageTime = formatTime(message.createTime)

  const messageElement = $(`
        <div class="message ${message.senderType}" data-id="${message.messageId}">
            <div class="message-content">
                ${message.message}
                ${message.senderType === "agent" ? '<button class="voice-btn">🔊</button>' : ""}
            </div>
            <div class="message-time">${messageTime}</div>
        </div>
    `)

  // 添加语音播放功能
  if (message.senderType === "agent") {
    messageElement.find(".voice-btn").click(() => {
      playVoice(message.message)
    })
  }

  messagesContainer.append(messageElement)
}

// 播放语音
function playVoice(text) {
  $.ajax({
    url: "/voice/gVoc",
    type: "GET",
    data: {
      voice: text,
    },
    success: (response) => {
      if (response && response.audioUrl) {
        const audio = new Audio(response.audioUrl)
        audio.play()
      } else {
        showNotification("语音生成失败")
      }
    },
    error: () => {
      showNotification("语音生成失败")
    },
  })
}

// 显示AI正在输入的提示
function showTypingIndicator() {
  const messagesContainer = $("#messages-container")

  const typingIndicator = $(`
        <div class="typing-indicator" id="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `)

  messagesContainer.append(typingIndicator)
  scrollToBottom()
}

// 移除输入提示
function removeTypingIndicator() {
  $("#typing-indicator").remove()
}

// 检查是否有新线索解锁
function checkForNewClues() {
  const currentSession = JSON.parse(localStorage.getItem("currentSession"))

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
          const unlockedClues = response.filter((clue) => clue.isLocked === 1)

          if (unlockedClues.length > 0) {
            // 显示线索解锁动画
            showClueUnlockAnimation(unlockedClues[0])

            // 更新线索列表
            renderClues(response, "#current-clues")
          }
        }
      },
    })
  }
}

// 显示线索解锁动画
function showClueUnlockAnimation(clue) {
  $("#unlocked-clue-name").text(clue.clueName)

  const unlockAnimation = $("#clue-unlock-animation")
  unlockAnimation.css("display", "flex")

  setTimeout(() => {
    unlockAnimation.css("display", "none")
  }, 3000)
}

// 提交推理
function submitDeduction() {
  const deductionName = $("#deduction-name").val().trim()
  const deductionContent = $("#deduction-content").val().trim()
  const isFinal = $("#is-final").is(":checked") ? 1 : 0

  if (!deductionName || !deductionContent) {
    showNotification("请填写完整的推理信息")
    return
  }

  const currentSession = JSON.parse(localStorage.getItem("currentSession"))

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
          $("#deduction-name").val("")
          $("#deduction-content").val("")
          $("#is-final").prop("checked", false)

          // 重新加载推理记录
          loadDeductions()

          // 如果是最终推理，显示成功动画
          if (isFinal === 1) {
            showDeductionSuccessAnimation()
          }

          showNotification("推理提交成功")
        } else {
          showNotification("推理提交失败")
        }
      },
      error: () => {
        showNotification("推理提交失败")
      },
    })
  }
}

// 显示推理成功动画
function showDeductionSuccessAnimation() {
  const successAnimation = $("#deduction-success-animation")
  successAnimation.css("display", "flex")

  setTimeout(() => {
    successAnimation.css("display", "none")
  }, 3000)
}

// 滚动到底部
function scrollToBottom() {
  const messagesContainer = document.getElementById("messages-container")
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// 切换主题
function toggleTheme() {
  if ($("body").hasClass("dark-theme")) {
    $("body").removeClass("dark-theme").addClass("light-theme")
    localStorage.setItem("theme", "light")
  } else {
    $("body").removeClass("light-theme").addClass("dark-theme")
    localStorage.setItem("theme", "dark")
  }
}

// 格式化时间
function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// 显示通知
function showNotification(message) {
  $("#notification-message").text(message)
  $("#notification").addClass("active")

  setTimeout(() => {
    $("#notification").removeClass("active")
  }, 3000)
}

// 加载主题设置
$(() => {
  const theme = localStorage.getItem("theme")

  if (theme === "light") {
    $("body").removeClass("dark-theme").addClass("light-theme")
    $("#theme-switch").prop("checked", true)
  }
})
