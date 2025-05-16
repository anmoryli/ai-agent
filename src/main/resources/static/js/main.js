$(document).ready(() => {
  // 检查登录状态
  checkLoginStatus();

  // 粒子背景初始化
  initParticles();

  // 添加神秘元素
  addMysteryElements();

  // 加载用户信息
  loadUserInfo();

  // 加载会话列表
  loadSessions();

  // 加载剧本列表
  loadScripts();

  // 加载角色列表
  loadAllAgents();

  // 主题切换
  $("#theme-switch").change(() => {
    toggleTheme();
  });

  // 退出登录
  $("#logout-btn").click(() => {
    logout();
  });

  // 新建会话按钮
  $("#new-session-btn, #create-session-btn").click(() => {
    openCreateSessionModal();
  });

  // 新建剧本按钮
  $("#new-script-btn").click(() => {
    openCreateScriptModal();
  });

  // 新建角色按钮
  $("#new-agent-btn").click(() => {
    openCreateAgentModal();
  });

  // 关闭模态框
  $(".close-modal-btn").click(() => {
    closeModals();
  });

  // 创建会话表单提交
  $("#create-session-form").submit((e) => {
    e.preventDefault();
    createSession();
  });

  // 创建剧本表单提交
  $("#create-script-form").submit((e) => {
    e.preventDefault();
    createScript();
  });

  // 创建角色表单提交
  $("#create-agent-form").submit((e) => {
    e.preventDefault();
    createAgent();
  });

  // 添加角色到会话
  $("#add-agents-btn").click(() => {
    addAgentsToSession();
  });

  // 在document.ready函数中添加以下事件监听
  $("#create-script-btn-welcome").click(() => {
    openCreateScriptModal();
  });
});

// 检查登录状态
function checkLoginStatus() {
  const user = localStorage.getItem("user");

  if (!user) {
    // 未登录，跳转到登录页
    window.location.href = "index.html";
  }
}

// 加载用户信息
function loadUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    $("#user-name").text(user.userName);
  }
}

// 加载会话列表
function loadSessions() {
  $.ajax({
    url: "/session/getAllSessions",
    type: "GET",
    success: (response) => {
      if (response && response.length > 0) {
        const sessionsList = $("#sessions-list");
        sessionsList.empty();

        response.forEach((session) => {
          const sessionItem = $(`
  <div class="session-item" data-id="${session.sessionId}">
    <div class="session-title">${session.title || "未命名会话"}</div>
    <div class="session-date">${formatDate(session.createTime)}</div>
    <div class="add-agent-btn" data-id="${session.sessionId}">+</div>
    <button class="delete-session-btn" style="position: absolute; right: 5px; top: 5px;">🗑️</button> <!-- 新增 -->
  </div>
`);

          sessionItem.click((e) => {
            // 如果点击的是添加角色按钮，则不打开聊天
            if ($(e.target).hasClass("add-agent-btn")) {
              e.stopPropagation();
              openAddAgentModal(session.sessionId);
              return;
            }
            openChat(session.sessionId, session.title);
          });

          // 绑定删除按钮点击事件
          sessionItem.find(".delete-session-btn").click((e) => {
            e.stopPropagation();
            const sessionId = session.sessionId;

            if (confirm("确定要删除该会话吗？")) {
              $.ajax({
                url: "/session/deleteSession",
                type: "POST",
                data: {
                  sessionId: sessionId,
                },
                success: () => {
                  showNotification("会话删除成功");
                  loadSessions(); // 刷新会话列表
                },
                error: () => {
                  showNotification("删除会话失败");
                },
              });
            }
          });

          sessionsList.append(sessionItem);
        });

        // 添加悬浮效果
        addFloatingCardEffect($(".session-item"));
      } else {
        $("#sessions-list").html('<p class="empty-list">暂无会话</p>');
      }
    },
    error: () => {
      showNotification("加载会话列表失败,请重新登陆");
    },
  });
}

// 修改loadScripts函数
function loadScripts() {
  $.ajax({
    url: "/script/getScripts",
    type: "GET",
    success: (response) => {
      if (response && response.length > 0) {
        const scriptsList = $("#scripts-list");
        const scriptSelect = $("#script-select");

        scriptsList.empty();
        scriptSelect.empty();

        // 获取当前选中的剧本
        const currentScript = localStorage.getItem("scriptName");

        response.forEach((script) => {
          // 检查是否是当前选中的剧本
          const isSelected = currentScript === script.scriptName;

          // 添加到侧边栏列表
          const scriptItem = $(`
            <div class="script-item" data-id="${script.scriptId}">
              <div class="script-title">${
                script.scriptName || "未命名剧本"
              }</div>
              <div class="script-date">${formatDate(script.createTime)}</div>
              <div class="script-actions">
                <button class="script-select-btn ${
                  isSelected ? "selected" : ""
                }" data-name="${script.scriptName}">
                  ${isSelected ? "✓ 已选择" : "选择剧本"}
                </button>
              </div>
            </div>
          `);

          // 点击整个剧本项显示详情
          scriptItem.click((e) => {
            // 如果点击的是选择按钮，则不显示详情
            if ($(e.target).hasClass("script-select-btn")) {
              e.stopPropagation();
              return;
            }
            showScriptDetails(script);
          });

          // 点击选择按钮
          scriptItem.find(".script-select-btn").click((e) => {
            e.stopPropagation();
            selectScript(script.scriptName);
          });

          scriptsList.append(scriptItem);

          // 添加到下拉选择框
          scriptSelect.append(
            `<option value="${script.scriptId}" ${
              isSelected ? "selected" : ""
            }>${script.scriptName}</option>`
          );
        });

        // 添加悬浮效果
        addFloatingCardEffect($(".script-item"));
      } else {
        $("#scripts-list").html('<p class="empty-list">暂无剧本</p>');
        $("#script-select").html('<option value="">暂无剧本</option>');
      }
    },
    error: () => {
      showNotification("加载剧本列表失败");
    },
  });
}

// 修改loadAgents函数，添加聊天按钮
function loadAgents() {
  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: {
      scriptId: 1, // 这里可以根据需要修改
    },
    success: (response) => {
      if (response && response.length > 0) {
        const agentsList = $("#agents-list");
        agentsList.empty();

        response.forEach((agent) => {
          const agentItem = $(`
            <div class="agent-item" data-id="${agent.agentId}">
              <div class="agent-title">${agent.agentName || "未命名角色"}</div>
              <div class="agent-role">${agent.agentRole || "未知身份"}</div>
              <div class="agent-description">${
                agent.description || "暂无描述"
              }</div>
              <div class="agent-date">${formatDate(agent.createTime)}</div>
              <div class="agent-actions">
                <button class="btn btn-sm btn-primary agent-chat-btn" data-id="${
                  agent.agentId
                }">
                  <span class="icon-chat"></span> 聊天
                </button>
              </div>
            </div>
          `);

          // 点击角色项显示详情
          agentItem.click((e) => {
            // 如果点击的是聊天按钮，则不显示详情
            if (
              $(e.target).hasClass("agent-chat-btn") ||
              $(e.target).closest(".agent-chat-btn").length > 0
            ) {
              e.stopPropagation();
              return;
            }
            showAgentDetails(agent);
          });

          // 点击聊天按钮
          agentItem.find(".agent-chat-btn").click((e) => {
            e.stopPropagation();
            startAgentChat(agent);
          });

          agentsList.append(agentItem);
        });

        // 添加悬浮效果
        addFloatingCardEffect($(".agent-item"));
      } else {
        $("#agents-list").html('<p class="empty-list">暂无角色</p>');
      }
    },
    error: () => {
      showNotification("加载角色列表失败");
    },
  });
}

function loadAllAgents() {
  $.ajax({
    url: "/agents/getAllAgents",
    type: "GET",
    success: (response) => {
      if (response && response.length > 0) {
        const agentsList = $("#agents-list");
        agentsList.empty();

        response.forEach((agent) => {
          const agentItem = $(`
            <div class="agent-item" data-id="${agent.agentId}">
              <div class="agent-title">${agent.agentName || "未命名角色"}</div>
              <div class="agent-role">${agent.agentRole || "未知身份"}</div>
              <div class="agent-description">${
                agent.description || "暂无描述"
              }</div>
              <div class="agent-date">${formatDate(agent.createTime)}</div>
              <div class="agent-actions">
                <button class="btn btn-sm btn-primary agent-chat-btn" data-id="${
                  agent.agentId
                }">
                  <span class="icon-chat"></span> 聊天
                </button>
              </div>
            </div>
          `);

          // 点击角色项显示详情
          agentItem.click((e) => {
            // 如果点击的是聊天按钮，则不显示详情
            if (
              $(e.target).hasClass("agent-chat-btn") ||
              $(e.target).closest(".agent-chat-btn").length > 0
            ) {
              e.stopPropagation();
              return;
            }
            showAgentDetails(agent);
          });

          // 点击聊天按钮
          agentItem.find(".agent-chat-btn").click((e) => {
            e.stopPropagation();
            startAgentChat(agent);
          });

          agentsList.append(agentItem);
        });

        // 添加悬浮效果
        addFloatingCardEffect($(".agent-item"));
      } else {
        $("#agents-list").html('<p class="empty-list">暂无角色</p>');
      }
    },
    error: () => {
      showNotification("加载角色列表失败");
    },
  });
}

// 打开创建会话模态框
function openCreateSessionModal() {
  // 检查是否有选择的剧本
  const scriptName = localStorage.getItem("scriptName");
  if (!scriptName) {
    // 如果没有选择剧本，提示用户
    showNotification("请先选择一个剧本");

    // 高亮剧本列表区域
    $(".sidebar-header:contains('剧本列表')")
      .addClass("pulse")
      .css("color", "var(--primary-color)");
    setTimeout(() => {
      $(".sidebar-header:contains('剧本列表')")
        .removeClass("pulse")
        .css("color", "");
    }, 2000);

    return;
  }

  $("#create-session-modal").css("display", "flex").hide().fadeIn(300);
}

// 打开创建剧本模态框
function openCreateScriptModal() {
  $("#create-script-modal").css("display", "flex").hide().fadeIn(300);
}

// 打开创建角色模态框
function openCreateAgentModal() {
  $("#create-agent-modal").css("display", "flex").hide().fadeIn(300);
}

// 打开添加角色模态框
function openAddAgentModal(sessionId) {
  $("#selected-session-id").val(sessionId);

  // 加载可选角色
  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: {
      scriptId: 1, // 这里可以根据需要修改
    },
    success: (response) => {
      if (response && response.length > 0) {
        const agentSelectList = $("#agent-select-list");
        agentSelectList.empty();

        response.forEach((agent) => {
          const agentSelectItem = $(`
            <div class="agent-select-item">
              <input type="checkbox" id="agent-${agent.agentId}" value="${agent.agentId}">
              <label for="agent-${agent.agentId}">${agent.agentName} (${agent.agentRole})</label>
            </div>
          `);

          agentSelectList.append(agentSelectItem);
        });
      } else {
        $("#agent-select-list").html('<p class="empty-list">暂无可选角色</p>');
      }
    },
    error: () => {
      showNotification("加载角色列表失败");
    },
  });

  $("#add-agent-modal").css("display", "flex").hide().fadeIn(300);
}

// 关闭所有模态框
function closeModals() {
  $(
    ".create-session-modal, .create-script-modal, .create-agent-modal, .add-agent-modal"
  ).fadeOut(300);
}

// 修改createSession函数，确保选择的剧本被正确使用
function createSession() {
  const title = $("#session-title").val();
  const scriptId = $("#script-select").val();
  const scriptName = $("#script-select option:selected").text();

  if (!title) {
    showNotification("请输入会话标题");
    return;
  }

  if (!scriptId) {
    showNotification("请选择一个剧本");
    return;
  }

  $.ajax({
    url: "/session/createSession",
    type: "POST",
    data: {
      title: title,
    },
    success: (response) => {
      if (response) {
        // 关联剧本
        $.ajax({
          url: "/script/chooseScript",
          type: "POST",
          data: {
            scriptName: scriptName,
          },
          success: () => {
            // 关闭模态框
            closeModals();

            // 保存剧本名称到本地存储
            localStorage.setItem("scriptName", scriptName);

            // 重新加载会话列表
            loadSessions();

            // 打开新创建的会话
            openChat(response.sessionId, title);
          },
          error: () => {
            showNotification("关联剧本失败");
          },
        });
      } else {
        showNotification("创建会话失败");
      }
    },
    error: () => {
      showNotification("创建会话失败");
    },
  });
}

// 创建新剧本
function createScript() {
  const scriptName = $("#script-name").val();
  const scriptContent = $("#script-content").val();
  const result = $("#script-result").val();

  if (!scriptName || !scriptContent || !result) {
    showNotification("请填写完整的剧本信息");
    return;
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
              closeModals();

              // 重新加载剧本列表
              loadScripts();

              showNotification("剧本创建成功");
            } else {
              showNotification("创建剧本失败");
            }
          },
          error: () => {
            showNotification("创建剧本失败");
          },
        });
      } else {
        showNotification("创建会话失败");
      }
    },
    error: () => {
      showNotification("创建会话失败");
    },
  });
}

// 创建新角色
function createAgent() {
  const agentName = $("#agent-name").val();
  const agentRole = $("#agent-role").val();
  const description = $("#agent-description").val();

  if (!agentName || !agentRole) {
    showNotification("请填写角色名称和身份");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  $.ajax({
    url: "/agents/createAgent",
    type: "POST",
    data: {
      userId: user.userId,
      agentName: agentName,
      agentRole: agentRole,
      description: description || "",
    },
    success: (response) => {
      if (response) {
        // 关闭模态框
        closeModals();

        // 重新加载角色列表
        loadAgents()
        loadAllAgents();

        showNotification("角色创建成功");
      } else {
        showNotification("创建角色失败");
      }
    },
    error: () => {
      showNotification("创建角色失败");
    },
  });
}

// 添加角色到会话
function addAgentsToSession() {
  const sessionId = $("#selected-session-id").val();
  const selectedAgents = [];

  // 获取选中的角色
  $("#agent-select-list input:checked").each(function () {
    selectedAgents.push($(this).val());
  });

  if (selectedAgents.length === 0) {
    showNotification("请选择至少一个角色");
    return;
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
          console.log("添加角色成功", response);
          resolve(response);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  });

  Promise.all(addAgentPromises)
    .then(() => {
      closeModals();
      showNotification("角色添加成功");
    })
    .catch(() => {
      showNotification("添加角色失败");
    });
}

// 打开聊天页面
function openChat(sessionId, title) {
  // 先清空所有线索
  $.ajax({
    url: "/clues/clearAllClues",
    type: "POST",
    data: {
      sessionId: sessionId,
    },
    success: () => {
      console.log("已清空所有线索");

      // 保存会话信息到本地存储
      localStorage.setItem(
        "currentSession",
        JSON.stringify({
          id: sessionId,
          title: title,
          autoStart: true, // 添加自动开始标记
        })
      );

      // 显示过渡动画
      showPageTransition();

      // 延迟跳转到聊天页面
      setTimeout(() => {
        window.location.href = "chat.html";
      }, 800);
    },
    error: () => {
      showNotification("清空线索失败，但仍将继续");

      // 保存会话信息到本地存储
      localStorage.setItem(
        "currentSession",
        JSON.stringify({
          id: sessionId,
          title: title,
          autoStart: true, // 添加自动开始标记
        })
      );

      // 显示过渡动画
      showPageTransition();

      // 延迟跳转到聊天页面
      setTimeout(() => {
        window.location.href = "chat.html";
      }, 800);
    },
  });
}

// 修改showScriptDetails函数，提供更多详细信息
function showScriptDetails(script) {
  // 创建一个模态框显示剧本详情
  const detailsModal = $(`
    <div class="script-details-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100;">
      <div class="modal-content" style="width: 90%; max-width: 600px;">
        <div class="modal-header">
          <h3>剧本详情</h3>
          <button class="close-modal-btn">&times;</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <h4 style="margin-bottom: 10px; color: var(--primary-color);">${
            script.scriptName || "未命名剧本"
          }</h4>
          <p style="margin-bottom: 20px; font-size: 12px; color: var(--dark-text-secondary);">创建时间: ${formatDate(
            script.createTime
          )}</p>
          
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">剧本简介</h5>
            <p style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); font-size: 14px;">${
              script.scriptContent
                ? script.scriptContent.substring(0, 200) + "..."
                : "暂无内容"
            }</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">剧本结果</h5>
            <p style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); font-size: 14px;">${
              script.result || "暂无结果"
            }</p>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
  <button class="btn btn-outline select-script-btn" data-name="${
    script.scriptName
  }">选择此剧本</button>
  <button class="btn btn-danger delete-script-btn" data-name="${
    script.scriptName
  }">删除剧本</button> <!-- 新增 -->
  <button class="btn btn-primary create-session-with-script-btn" data-id="${
    script.scriptId
  }" data-name="${script.scriptName}">创建会话</button>
</div>
        </div>
      </div>
    </div>
  `).appendTo("body");

  // 关闭按钮
  detailsModal.find(".close-modal-btn").click(() => {
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();
    });
  });

  // 选择剧本按钮
  detailsModal.find(".select-script-btn").click(() => {
    selectScript(script.scriptName);
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();
    });
  });

  // 删除剧本按钮点击事件
  detailsModal.find(".delete-script-btn").click(() => {
    const scriptName = $(this).data("name");

    if (confirm("确定要删除该剧本吗？")) {
      $.ajax({
        url: "/script/deleteScript",
        type: "POST",
        data: {
          scriptName: scriptName,
        },
        success: () => {
          showNotification("剧本删除成功");
          detailsModal.fadeOut(300, () => {
            detailsModal.remove();
            loadScripts(); // 刷新剧本列表
          });
        },
        error: () => {
          showNotification("删除剧本失败");
        },
      });
    }
  });

  // 创建会话按钮
  detailsModal.find(".create-session-with-script-btn").click(() => {
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();

      // 打开创建会话模态框并预选剧本
      openCreateSessionModal();
      $("#script-select").val(script.scriptId);
    });
  });

  // 显示模态框
  detailsModal.hide().fadeIn(300);
}

// 修改showAgentDetails函数
function showAgentDetails(agent) {
  // 创建一个模态框显示角色详情
  const detailsModal = $(`
    <div class="agent-details-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100;">
      <div class="modal-content" style="width: 90%; max-width: 500px;">
        <div class="modal-header">
          <h3>角色详情</h3>
          <button class="close-modal-btn">&times;</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <h4 style="margin-bottom: 10px; color: var(--primary-color);">${
            agent.agentName || "未命名角色"
          }</h4>
          <p style="margin-bottom: 5px; font-weight: 600; color: var(--secondary-color);">${
            agent.agentRole || "未知身份"
          }</p>
          <p style="margin-bottom: 20px; font-size: 12px; color: var(--dark-text-secondary);">创建时间: ${formatDate(
            agent.createTime
          )}</p>
          
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">角色描述</h5>
            <p style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); font-size: 14px;">${
              agent.description || "暂无描述"
            }</p>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
  <button class="btn btn-danger delete-agent-btn" data-id="${
    agent.agentId
  }">删除角色</button>
  <button class="btn btn-primary start-chat-btn">开始聊天</button>
</div>
        </div>
      </div>
    </div>
  `).appendTo("body");

  // 关闭按钮
  detailsModal.find(".close-modal-btn").click(() => {
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();
    });
  });

  // 开始聊天按钮
  detailsModal.find(".start-chat-btn").click(() => {
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();
      startAgentChat(agent);
    });
  });

  // 删除角色按钮点击事件
  detailsModal.find(".delete-agent-btn").click(() => {
    const agentId = $(this).data("id");

    if (confirm("确定要删除该角色吗？")) {
      $.ajax({
        url: "/agents/deleteAgents",
        type: "POST",
        data: {
          agentId: agentId,
        },
        success: () => {
          showNotification("角色删除成功");
          detailsModal.fadeOut(300, () => {
            detailsModal.remove();
            loadAllAgents(); // 刷新角色列表
          });
        },
        error: () => {
          showNotification("删除角色失败");
        },
      });
    }
  });

  // 显示模态框
  detailsModal.hide().fadeIn(300);
}

// 添加开始与角色聊天的函数
function startAgentChat(agent) {
  // 保存角色信息到本地存储
  localStorage.setItem("currentAgent", JSON.stringify(agent));

  // 创建一个临时会话ID（实际项目中应该调用API创建会话）
  const tempSessionId = "agent_chat_" + Date.now();

  // 保存会话信息到本地存储
  localStorage.setItem(
    "currentSession",
    JSON.stringify({
      id: tempSessionId,
      title: `与 ${agent.agentName} 的对话`,
      isAgentChat: true,
    })
  );

  // 显示过渡动画
  showPageTransition();

  // 延迟跳转到聊天页面
  setTimeout(() => {
    window.location.href = "chat.html";
  }, 800);
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

// 退出登录
function logout() {
  // 清除本地存储
  localStorage.removeItem("user");
  localStorage.removeItem("currentSession");

  // 显示过渡动画
  showPageTransition();

  // 延迟跳转到登录页
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return "未知时间";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "未知时间";
  }
}

// 显示通知
function showNotification(message) {
  $("#notification-message").text(message);
  $("#notification").addClass("active");

  setTimeout(() => {
    $("#notification").removeClass("active");
  }, 3000);
}

// 初始化粒子背景
function initParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 100; // 增加粒子数量

  for (let i = 0; i < particleCount; i++) {
    createEnhancedParticle(particlesContainer);
  }
}

// 创建增强的粒子
function createEnhancedParticle(container) {
  const particle = document.createElement("div");
  particle.classList.add("particle");

  // 随机大小
  const size = Math.random() * 8 + 2; // 增加粒子大小
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // 随机位置
  const posX = Math.random() * 100;
  const posY = Math.random() * 100;
  particle.style.left = `${posX}%`;
  particle.style.top = `${posY}%`;

  // 随机透明度
  const opacity = Math.random() * 0.7 + 0.3; // 增加透明度
  particle.style.opacity = opacity;

  // 随机动画
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;

  container.appendChild(particle);
}

// 修改添加神秘元素
function addMysteryElements() {
  // 添加血迹效果
  for (let i = 0; i < 5; i++) {
    const bloodSplatter = document.createElement("div");
    bloodSplatter.classList.add("blood-splatter");

    // 随机位置
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    bloodSplatter.style.left = `${posX}%`;
    bloodSplatter.style.top = `${posY}%`;

    // 随机大小和旋转
    const size = Math.random() * 50 + 30;
    const rotation = Math.random() * 360;
    bloodSplatter.style.width = `${size}px`;
    bloodSplatter.style.height = `${size}px`;
    bloodSplatter.style.transform = `rotate(${rotation}deg)`;

    document.body.appendChild(bloodSplatter);
  }

  // 添加侦探图标
  for (let i = 0; i < 3; i++) {
    const detectiveIcon = document.createElement("div");
    detectiveIcon.classList.add("detective-icon");

    // 随机位置
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    detectiveIcon.style.left = `${posX}%`;
    detectiveIcon.style.top = `${posY}%`;

    document.body.appendChild(detectiveIcon);
  }

  // 添加神秘装饰
  const mysteryDecoration = document.createElement("div");
  mysteryDecoration.classList.add("mystery-decoration");
  document.querySelector(".main-content").appendChild(mysteryDecoration);
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
        });
      },
      // 增加一个删除按钮
      function () {
        $(this).css({
          // 删除按钮的逻辑
          transform: "translateY(0)",
          "box-shadow": "none",
          "border-left-color": "transparent",
          position: "relative",
          "z-index": "1",
          "&:hover .delete-button": {
            display: "block",
          },
          "& .delete-button": {
            display: "none",
            position: "absolute",
            top: "50%",
            right: "10px",
          },
        });
      },
      function () {
        $(this).css({
          transform: "translateY(0)",
          boxShadow: "none",
          borderLeftColor: "transparent",
        });
      }
    );
  });
}

// 显示页面过渡动画
function showPageTransition() {
  const transition = document.createElement("div");
  transition.classList.add("page-transition");
  document.body.appendChild(transition);

  setTimeout(() => {
    transition.classList.add("active");
  }, 100);
}

// 加载主题设置
$(() => {
  const theme = localStorage.getItem("theme");

  if (theme === "light") {
    $("body").removeClass("dark-theme").addClass("light-theme");
    $("#theme-switch").prop("checked", true);
  }
});

// 添加选择剧本函数
function selectScript(scriptName) {
  // 保存剧本名称到本地存储
  localStorage.setItem("scriptName", scriptName);

  // 更新所有选择按钮状态
  $(".script-select-btn").each(function () {
    const btnScriptName = $(this).data("name");
    if (btnScriptName === scriptName) {
      $(this).addClass("selected").text("✓ 已选择");
    } else {
      $(this).removeClass("selected").text("选择剧本");
    }
  });

  // 更新下拉选择框
  $("#script-select option").each(function () {
    if ($(this).text() === scriptName) {
      $(this).prop("selected", true);
    }
  });

  showNotification(`已选择剧本: ${scriptName}`);
}
