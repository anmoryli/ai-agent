$(document).ready(() => {
  // 检查登录状态
  checkLoginStatus()

  // 粒子背景初始化
  initParticles()

  // 添加神秘元素
  addMysteryElements()

  // 加载用户信息
  loadUserInfo()

  // 加载会话列表
  loadSessions()

  // 加载剧本列表
  loadScripts()

  // 加载角色列表
  loadAgents()

  // 主题切换
  $("#theme-switch").change(() => {
    toggleTheme()
  })

  // 退出登录
  $("#logout-btn").click(() => {
    logout()
  })

  // 新建会话按钮
  $("#new-session-btn, #create-session-btn").click(() => {
    openCreateSessionModal()
  })

  // 新建剧本按钮
  $("#new-script-btn").click(() => {
    openCreateScriptModal()
  })

  // 新建角色按钮
  $("#new-agent-btn").click(() => {
    openCreateAgentModal()
  })

  // 关闭模态框
  $(".close-modal-btn").click(() => {
    closeModals()
  })

  // 创建会话表单提交
  $("#create-session-form").submit((e) => {
    e.preventDefault()
    createSession()
  })

  // 创建剧本表单提交
  $("#create-script-form").submit((e) => {
    e.preventDefault()
    createScript()
  })

  // 创建角色表单提交
  $("#create-agent-form").submit((e) => {
    e.preventDefault()
    createAgent()
  })

  // 添加角色到会话
  $("#add-agents-btn").click(() => {
    addAgentsToSession()
  })
})

// 检查登录状态
function checkLoginStatus() {
  const user = localStorage.getItem("user")

  if (!user) {
    // 未登录，跳转到登录页
    window.location.href = "index.html"
  }
}

// 加载用户信息
function loadUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"))

  if (user) {
    $("#user-name").text(user.userName)
  }
}

// 加载会话列表
function loadSessions() {
  $.ajax({
    url: "/session/getAllSessions",
    type: "GET",
    success: (response) => {
      if (response && response.length > 0) {
        const sessionsList = $("#sessions-list")
        sessionsList.empty()

        response.forEach((session) => {
          const sessionItem = $(`
            <div class="session-item" data-id="${session.sessionId}">
              <div class="session-title">${session.title || "未命名会话"}</div>
              <div class="session-date">${formatDate(session.createTime)}</div>
              <div class="add-agent-btn" data-id="${session.sessionId}">+</div>
            </div>
          `)

          sessionItem.click((e) => {
            // 如果点击的是添加角色按钮，则不打开聊天
            if ($(e.target).hasClass("add-agent-btn")) {
              e.stopPropagation()
              openAddAgentModal(session.sessionId)
              return
            }
            openChat(session.sessionId, session.title)
          })

          sessionsList.append(sessionItem)
        })

        // 添加悬浮效果
        addFloatingCardEffect($(".session-item"))
      } else {
        $("#sessions-list").html('<p class="empty-list">暂无会话</p>')
      }
    },
    error: () => {
      showNotification("加载会话列表失败")
    },
  })
}

// 加载剧本列表
function loadScripts() {
  $.ajax({
    url: "/script/getScripts",
    type: "GET",
    success: (response) => {
      if (response && response.length > 0) {
        const scriptsList = $("#scripts-list")
        const scriptSelect = $("#script-select")

        scriptsList.empty()
        scriptSelect.empty()

        response.forEach((script) => {
          // 添加到侧边栏列表
          const scriptItem = $(`
            <div class="script-item" data-id="${script.scriptId}">
              <div class="script-title">${script.scriptName || "未命名剧本"}</div>
              <div class="script-date">${formatDate(script.createTime)}</div>
            </div>
          `)

          scriptItem.click(() => {
            showScriptDetails(script)
          })

          scriptsList.append(scriptItem)

          // 添加到下拉选择框
          scriptSelect.append(`<option value="${script.scriptId}">${script.scriptName}</option>`)
        })

        // 添加悬浮效果
        addFloatingCardEffect($(".script-item"))
      } else {
        $("#scripts-list").html('<p class="empty-list">暂无剧本</p>')
        $("#script-select").html('<option value="">暂无剧本</option>')
      }
    },
    error: () => {
      showNotification("加载剧本列表失败")
    },
  })
}

// 加载角色列表
function loadAgents() {
  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: {
      scriptId: 1, // 这里可以根据需要修改
    },
    success: (response) => {
      if (response && response.length > 0) {
        const agentsList = $("#agents-list")
        agentsList.empty()

        response.forEach((agent) => {
          const agentItem = $(`
            <div class="agent-item" data-id="${agent.agentId}">
              <div class="agent-title">${agent.agentName || "未命名角色"}</div>
              <div class="agent-role">${agent.agentRole || "未知身份"}</div>
              <div class="agent-description">${agent.description || "暂无描述"}</div>
              <div class="agent-date">${formatDate(agent.createTime)}</div>
            </div>
          `)

          agentItem.click(() => {
            showAgentDetails(agent)
          })

          agentsList.append(agentItem)
        })

        // 添加悬浮效果
        addFloatingCardEffect($(".agent-item"))
      } else {
        $("#agents-list").html('<p class="empty-list">暂无角色</p>')
      }
    },
    error: () => {
      showNotification("加载角色列表失败")
    },
  })
}

// 打开创建会话模态框
function openCreateSessionModal() {
  $("#create-session-modal").css("display", "flex").hide().fadeIn(300)
}

// 打开创建剧本模态框
function openCreateScriptModal() {
  $("#create-script-modal").css("display", "flex").hide().fadeIn(300)
}

// 打开创建角色模态框
function openCreateAgentModal() {
  $("#create-agent-modal").css("display", "flex").hide().fadeIn(300)
}

// 打开添加角色模态框
function openAddAgentModal(sessionId) {
  $("#selected-session-id").val(sessionId)

  // 加载可选角色
  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: {
      scriptId: 1, // 这里可以根据需要修改
    },
    success: (response) => {
      if (response && response.length > 0) {
        const agentSelectList = $("#agent-select-list")
        agentSelectList.empty()

        response.forEach((agent) => {
          const agentSelectItem = $(`
            <div class="agent-select-item">
              <input type="checkbox" id="agent-${agent.agentId}" value="${agent.agentId}">
              <label for="agent-${agent.agentId}">${agent.agentName} (${agent.agentRole})</label>
            </div>
          `)

          agentSelectList.append(agentSelectItem)
        })
      } else {
        $("#agent-select-list").html('<p class="empty-list">暂无可选角色</p>')
      }
    },
    error: () => {
      showNotification("加载角色列表失败")
    },
  })

  $("#add-agent-modal").css("display", "flex").hide().fadeIn(300)
}

// 关闭所有模态框
function closeModals() {
  $(".create-session-modal, .create-script-modal, .create-agent-modal, .add-agent-modal").fadeOut(300)
}

// 创建新会话
function createSession() {
  const title = $("#session-title").val()
  const scriptId = $("#script-select").val()

  if (!title) {
    showNotification("请输入会话标题")
    return
  }

  $.ajax({
    url: "/session/createSession",
    type: "POST",
    data: {
      title: title,
    },
    success: (response) => {
      if (response) {
        // 如果选择了剧本，则关联
        if (scriptId) {
          $.ajax({
            url: "/script/chooseScript",
            type: "POST",
            data: {
              scriptName: $("#script-select option:selected").text(),
            },
            success: () => {
              // 关闭模态框
              closeModals()

              // 重新加载会话列表
              loadSessions()

              // 打开新创建的会话
              openChat(response.sessionId, title)
            },
            error: () => {
              showNotification("关联剧本失败")
            },
          })
        } else {
          // 关闭模态框
          closeModals()

          // 重新加载会话列表
          loadSessions()

          // 打开新创建的会话
          openChat(response.sessionId, title)
        }
      } else {
        showNotification("创建会话失败")
      }
    },
    error: () => {
      showNotification("创建会话失败")
    },
  })
}

// 创建新剧本
function createScript() {
  const scriptName = $("#script-name").val()
  const scriptContent = $("#script-content").val()
  const result = $("#script-result").val()

  if (!scriptName || !scriptContent || !result) {
    showNotification("请填写完整的剧本信息")
    return
  }

  // 这里需要先创建一个会话，然后再创建剧本
  $.ajax({
    url: "/session/createSession",
    type: "POST",
    data: {
      title: "剧本：" + scriptName,
    },
    success: (sessionResponse) => {
      if (sessionResponse) {
        // 创建剧本
        $.ajax({
          url: "/script/createScript",
          type: "POST",
          data: {
            sessionId: sessionResponse.sessionId,
            scriptName: scriptName,
            scriptContent: scriptContent,
            result: result,
          },
          success: (scriptResponse) => {
            if (scriptResponse) {
              // 关闭模态框
              closeModals()

              // 重新加载剧本列表
              loadScripts()

              showNotification("剧本创建成功")
            } else {
              showNotification("创建剧本失败")
            }
          },
          error: () => {
            showNotification("创建剧本失败")
          },
        })
      } else {
        showNotification("创建会话失败")
      }
    },
    error: () => {
      showNotification("创建会话失败")
    },
  })
}

// 创建新角色
function createAgent() {
  const agentName = $("#agent-name").val()
  const agentRole = $("#agent-role").val()
  const description = $("#agent-description").val()

  if (!agentName || !agentRole) {
    showNotification("请填写角色名称和身份")
    return
  }

  const user = JSON.parse(localStorage.getItem("user"))

  $.ajax({
    url: "/createAgent",
    type: "POST",
    data: {
      agentName: agentName,
      agentRole: agentRole,
      description: description || "",
    },
    success: (response) => {
      if (response) {
        // 关闭模态框
        closeModals()

        // 重新加载角色列表
        loadAgents()

        showNotification("角色创建成功")
      } else {
        showNotification("创建角色失败")
      }
    },
    error: () => {
      showNotification("创建角色失败")
    },
  })
}

// 添加角色到会话
function addAgentsToSession() {
  const sessionId = $("#selected-session-id").val()
  const selectedAgents = []

  // 获取选中的角色
  $("#agent-select-list input:checked").each(function () {
    selectedAgents.push($(this).val())
  })

  if (selectedAgents.length === 0) {
    showNotification("请选择至少一个角色")
    return
  }

  // 添加角色到会话
  const addAgentPromises = selectedAgents.map((agentId) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/sessionMan/agentJoinSession",
        type: "POST",
        data: {
          sessionId: sessionId,
          agentId: agentId,
        },
        success: (response) => {
          resolve(response)
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  })

  Promise.all(addAgentPromises)
    .then(() => {
      closeModals()
      showNotification("角色添加成功")
    })
    .catch(() => {
      showNotification("添加角色失败")
    })
}

// 打开聊天页面
function openChat(sessionId, title) {
  // 保存会话信息到本地存储
  localStorage.setItem(
    "currentSession",
    JSON.stringify({
      id: sessionId,
      title: title,
    }),
  )

  // 显示过渡动画
  showPageTransition()

  // 延迟跳转到聊天页面
  setTimeout(() => {
    window.location.href = "chat.html"
  }, 800)
}

// 显示剧本详情
function showScriptDetails(script) {
  // 这里可以实现显示剧本详情的功能
  showNotification(`剧本：${script.scriptName}`)
}

// 显示角色详情
function showAgentDetails(agent) {
  // 这里可以实现显示角色详情的功能
  showNotification(`角色：${agent.agentName}`)
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

// 退出登录
function logout() {
  // 清除本地存储
  localStorage.removeItem("user")
  localStorage.removeItem("currentSession")

  // 显示过渡动画
  showPageTransition()

  // 延迟跳转到登录页
  setTimeout(() => {
    window.location.href = "index.html"
  }, 800)
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return "未知时间"

  try {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return "未知时间"
  }
}

// 显示通知
function showNotification(message) {
  $("#notification-message").text(message)
  $("#notification").addClass("active")

  setTimeout(() => {
    $("#notification").removeClass("active")
  }, 3000)
}

// 初始化粒子背景
function initParticles() {
  const particlesContainer = document.getElementById("particles")
  const particleCount = 100 // 增加粒子数量

  for (let i = 0; i < particleCount; i++) {
    createEnhancedParticle(particlesContainer)
  }
}

// 创建增强的粒子
function createEnhancedParticle(container) {
  const particle = document.createElement("div")
  particle.classList.add("particle")

  // 随机大小
  const size = Math.random() * 8 + 2 // 增加粒子大小
  particle.style.width = `${size}px`
  particle.style.height = `${size}px`

  // 随机位置
  const posX = Math.random() * 100
  const posY = Math.random() * 100
  particle.style.left = `${posX}%`
  particle.style.top = `${posY}%`

  // 随机透明度
  const opacity = Math.random() * 0.7 + 0.3 // 增加透明度
  particle.style.opacity = opacity

  // 随机动画
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`

  container.appendChild(particle)
}

// 添加神秘元素
function addMysteryElements() {
  // 添加血迹效果
  for (let i = 0; i < 5; i++) {
    const bloodSplatter = document.createElement("div")
    bloodSplatter.classList.add("blood-splatter")

    // 随机位置
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    bloodSplatter.style.left = `${posX}%`
    bloodSplatter.style.top = `${posY}%`

    // 随机大小和旋转
    const size = Math.random() * 50 + 30
    const rotation = Math.random() * 360
    bloodSplatter.style.width = `${size}px`
    bloodSplatter.style.height = `${size}px`
    bloodSplatter.style.transform = `rotate(${rotation}deg)`

    document.body.appendChild(bloodSplatter)
  }

  // 添加侦探图标
  for (let i = 0; i < 3; i++) {
    const detectiveIcon = document.createElement("div")
    detectiveIcon.classList.add("detective-icon")

    // 随机位置
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    detectiveIcon.style.left = `${posX}%`
    detectiveIcon.style.top = `${posY}%`

    document.body.appendChild(detectiveIcon)
  }
}

// 添加悬浮卡片效果
function addFloatingCardEffect(elements) {
  elements.each(function () {
    $(this).hover(
      function () {
        $(this).css({
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(194, 55, 87, 0.3)",
          borderLeftColor: "var(--primary-color)",
        })
      },
      function () {
        $(this).css({
          transform: "translateY(0)",
          boxShadow: "none",
          borderLeftColor: "transparent",
        })
      },
    )
  })
}

// 显示页面过渡动画
function showPageTransition() {
  const transition = document.createElement("div")
  transition.classList.add("page-transition")
  document.body.appendChild(transition)

  setTimeout(() => {
    transition.classList.add("active")
  }, 100)
}

// 加载主题设置
$(() => {
  const theme = localStorage.getItem("theme")

  if (theme === "light") {
    $("body").removeClass("dark-theme").addClass("light-theme")
    $("#theme-switch").prop("checked", true)
  }
})
