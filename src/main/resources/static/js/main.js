// js/main.js
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

  // 添加角色到剧本
  $("#add-agents-to-script-btn").click(() => {
    console.log("Add agents to script button clicked"); // 调试日志
    openAddAgentsToScriptModal();
  });

  // 确认添加角色到剧本
  $("#confirm-agents-to-script-btn").click(() => {
    console.log("Confirm agents to script button clicked"); // 调试日志
    confirmAgentsToScript();
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
<button class="delete-session-btn" style="position: absolute; right: 5px; top: 5px;">🗑️</button>
</div>
`);

          sessionItem.click((e) => {
            if ($(e.target).hasClass("add-agent-btn")) {
              e.stopPropagation();
              openAddAgentModal(session.sessionId);
              return;
            }
            openChat(session.sessionId, session.title);
          });

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
                  loadSessions();
                },
                error: () => {
                  showNotification("删除会话失败");
                },
              });
            }
          });

          sessionsList.append(sessionItem);
        });

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

        const currentScript = localStorage.getItem("scriptName");

        response.forEach((script) => {
          const isSelected = currentScript === script.scriptName;

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

          scriptItem.click((e) => {
            if ($(e.target).hasClass("script-select-btn")) {
              e.stopPropagation();
              return;
            }
            showScriptDetails(script);
          });

          scriptItem.find(".script-select-btn").click((e) => {
            e.stopPropagation();
            selectScript(script.scriptName);
          });

          scriptsList.append(scriptItem);

          scriptSelect.append(
            `<option value="${script.scriptId}" ${
              isSelected ? "selected" : ""
            }>${script.scriptName}</option>`
);
});

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

// 修改loadAgents函数
function loadAgents() {
  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: {
      scriptId: 1,
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

          agentItem.click((e) => {
            if (
                $(e.target).hasClass("agent-chat-btn") ||
                $(e.target).closest(".agent-chat-btn").length > 0
            ) {
              e.stopPropagation();
              return;
            }
            showAgentDetails(agent);
          });

          agentItem.find(".agent-chat-btn").click((e) => {
            e.stopPropagation();
            startAgentChat(agent);
          });

          agentsList.append(agentItem);
        });

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

          agentItem.click((e) => {
            if (
                $(e.target).hasClass("agent-chat-btn") ||
                $(e.target).closest(".agent-chat-btn").length > 0
            ) {
              e.stopPropagation();
              return;
            }
            showAgentDetails(agent);
          });

          agentItem.find(".agent-chat-btn").click((e) => {
            e.stopPropagation();
            startAgentChat(agent);
          });

          agentsList.append(agentItem);
        });

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
  const scriptName = localStorage.getItem("scriptName");
  if (!scriptName) {
    showNotification("请先选择一个剧本");
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
  $.ajax({
    url: "/agents/getAllAgentsOfScript",
    type: "GET",
    data: {
      scriptId: 1,
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
  $(".create-session-modal, .create-script-modal, .create-agent-modal, .add-agent-modal, .script-details-modal, .agent-details-modal").fadeOut(300);
}

// 创建会话
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
      scriptId: scriptId,
    },
    success: (response) => {
      if (response) {
        $.ajax({
          url: "/script/chooseScript",
          type: "POST",
          data: {
            scriptName: scriptName,
          },
          success: () => {
            closeModals();
            localStorage.setItem("scriptName", scriptName);
            loadSessions();
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

// 修改 createScript 函数以支持角色关联
function createScript() {
  const scriptName = $("#script-name").val();
  const scriptContent = $("#script-content").val();
  const result = $("#script-result").val();
  const selectedAgentIds = JSON.parse(localStorage.getItem("selectedAgentIds") || "[]");
  console.log('scriptName:',scriptName);
  console.log('selectedAgentIds:',selectedAgentIds);

  if (!scriptName || !scriptContent || !result) {
    showNotification("请填写完整的剧本信息");
    return;
  }

  $.ajax({
    url: "/script/createScript",
    type: "POST",
    data: {
      scriptName: scriptName,
      scriptContent: scriptContent,
      result: result,
    },
    success: (scriptResponse) => {
      if (scriptResponse) {
        // 关联选中的角色
        if (selectedAgentIds.length > 0) {
          $.ajax({
            url: "/sessionMan/AllAgentsJoinSession",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              scriptId: scriptResponse.scriptId,
              agentId: selectedAgentIds,
            }),
            success: () => {
              showNotification("剧本和角色关联成功");
              localStorage.removeItem("selectedAgentIds"); // 清理临时存储
            },
            error: () => {
              showNotification("角色关联失败");
            },
          });
        }
        closeModals();
        loadScripts();
        showNotification("剧本创建成功");
      } else {
        showNotification("对不起，您没有权限创建剧本");
      }
    },
    error: () => {
      showNotification("创建剧本失败");
    },
  });
}

// 事件绑定：打开添加角色模态框
$("#add-agents-to-script-btn").click(() => {
  openAddAgentsToScriptModal();
});

// 事件绑定：确认添加角色
$("#confirm-agents-to-script-btn").click(() => {
  confirmAgentsToScript();
});

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
        closeModals();
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

  $("#agent-select-list input:checked").each(function () {
    selectedAgents.push($(this).val());
  });

  if (selectedAgents.length === 0) {
    showNotification("请选择至少一个角色");
    return;
  }

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
  $.ajax({
    url: "/clues/clearAllClues",
    type: "POST",
    data: {
      sessionId: sessionId,
    },
    success: () => {
      console.log("已清空所有线索");
      localStorage.setItem(
          "currentSession",
          JSON.stringify({
            id: sessionId,
            title: title,
            autoStart: true,
          })
      );
      showPageTransition();
      setTimeout(() => {
        window.location.href = "chat.html";
      }, 800);
    },
    error: () => {
      showNotification("清空线索失败，但仍将继续");
      localStorage.setItem(
          "currentSession",
          JSON.stringify({
            id: sessionId,
            title: title,
            autoStart: true,
          })
      );
      showPageTransition();
      setTimeout(() => {
        window.location.href = "chat.html";
      }, 800);
    },
  });
}

// 修改showScriptDetails函数，添加“查看线索”模块
function showScriptDetails(script) {
  const detailsModal = $(`
    <div class="script-details-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100;">
      <div class="modal-content" style="width: 90%; max-width: 600px;">
        <div class="modal-header">
          <h3>剧本详情</h3>
          <button class="close-modal-btn">×</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <h4 style="margin-bottom: 10px; color: var(--primary-color);">${script.scriptName || "未命名剧本"}</h4>
          <p style="margin-bottom: 20px; font-size: 12px; color: var(--dark-text-secondary);">创建时间: ${formatDate(script.createTime)}</p>
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">剧本简介</h5>
            <p style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); font-size: 14px;">${script.scriptContent ? script.scriptContent.substring(0, 200) + "..." : "暂无内容"}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">剧本结果</h5>
            <p style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); font-size: 14px;">${script.result || "暂无结果"}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">查看线索</h5>
            <div class="clues-list" id="clues-list"></div>
            <button class="btn btn-secondary load-clues-btn" data-name="${script.scriptName}">加载线索</button>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button class="btn btn-outline select-script-btn" data-name="${script.scriptName}">选择此剧本</button>
            <button class="btn btn-danger delete-script-btn" data-name="${script.scriptName}">删除剧本</button>
            <button class="btn btn-primary create-session-with-script-btn" data-id="${script.scriptId}" data-name="${script.scriptName}">创建会话</button>
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

  // 删除剧本按钮
  detailsModal.find(".delete-script-btn").click(() => {
    const scriptName = script.scriptName;
    console.log("删除该剧本：" + scriptName);
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
            loadScripts();
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
      openCreateSessionModal();
      $("#script-select").val(script.scriptId);
    });
  });

  // 加载线索按钮（动态绑定）
  detailsModal.find(".load-clues-btn").click(() => {
    const scriptName = script.scriptName;
    $.ajax({
      url: "/clues/getCluesByScriptId",
      type: "GET",
      data: { scriptName: scriptName },
      dataType: "json",
      success: (response) => {
        const $cluesList = detailsModal.find("#clues-list");
        $cluesList.empty();
        if (response && Array.isArray(response) && response.length > 0) {
          response.forEach(clue => {
            const isLocked = clue.isLocked ? " (锁定)" : "";
            const unlockCondition = clue.isLocked ? `<p>解锁条件: ${clue.unlockCondition || "无"}</p>` : "";
            const clueItem = `
              <div class="clue-item" style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); margin-bottom: 10px;">
                <h6 style="margin-bottom: 5px; font-weight: 600;">${clue.clueName}${isLocked}</h6>
                <p style="font-size: 14px;">${clue.clueContent}</p>
                ${unlockCondition}
                <p style="font-size: 12px; color: var(--dark-text-secondary);">创建时间: ${formatDate(clue.createTime)}</p>
              </div>
            `;
            $cluesList.append(clueItem);
          });
        } else {
          $cluesList.append('<p style="font-size: 14px;">未找到线索</p>');
        }
      },
      error: (xhr, status, error) => {
        console.error("获取线索失败:", error);
        showNotification("加载线索失败，请重试");
      }
    });
  });

  // 显示模态框
  detailsModal.hide().fadeIn(300);
}

// showAgentDetails 函数
function showAgentDetails(agent) {
  const detailsModal = $(`
    <div class="agent-details-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100;">
      <div class="modal-content" style="width: 90%; max-width: 500px;">
        <div class="modal-header">
          <h3>角色详情</h3>
          <button class="close-modal-btn">×</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <h4 style="margin-bottom: 10px; color: var(--primary-color);">${agent.agentName || "未命名角色"}</h4>
          <p style="margin-bottom: 5px; font-weight: 600; color: var(--secondary-color);">${agent.agentRole || "未知身份"}</p>
          <p style="margin-bottom: 20px; font-size: 12px; color: var(--dark-text-secondary);">创建时间: ${formatDate(agent.createTime)}</p>
          <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px; font-weight: 600;">角色描述</h5>
            <p style="background-color: var(--dark-card); padding: 10px; border-radius: var(--border-radius); font-size: 14px;">${agent.description || "暂无描述"}</p>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button class="btn btn-danger delete-agent-btn" data-id="${agent.agentId}">删除角色</button>
            <button class="btn btn-primary start-chat-btn">开始聊天</button>
          </div>
        </div>
      </div>
    </div>
  `).appendTo("body");

  detailsModal.find(".close-modal-btn").click(() => {
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();
    });
  });

  detailsModal.find(".start-chat-btn").click(() => {
    detailsModal.fadeOut(300, () => {
      detailsModal.remove();
      startAgentChat(agent);
    });
  });

  detailsModal.find(".delete-agent-btn").click(() => {
    const agentId = $(this).data("id");
    console.log("删除该角色：" + agentId);
    if (confirm("确定要删除该角色吗？")) {
      $.ajax({
        url: "/agents/deleteAgents",
        type: "POST",
        data: {
          agentId: agent.agentId,
        },
        success: () => {
          showNotification("角色删除成功");
          detailsModal.fadeOut(300, () => {
            detailsModal.remove();
            loadAllAgents();
          });
        },
        error: () => {
          showNotification("删除角色失败");
        },
      });
    }
  });

  detailsModal.hide().fadeIn(300);
}

// 其他函数保持不变
function startAgentChat(agent) {
  localStorage.setItem("currentAgent", JSON.stringify(agent));
  const tempSessionId = "agent_chat_" + Date.now();
  localStorage.setItem(
      "currentSession",
      JSON.stringify({
        id: tempSessionId,
        title: `与 ${agent.agentName} 的对话`,
        isAgentChat: true,
      })
  );
  showPageTransition();
  setTimeout(() => {
    window.location.href = "chat.html";
  }, 800);
}

function toggleTheme() {
  if ($("body").hasClass("dark-theme")) {
    $("body").removeClass("dark-theme").addClass("light-theme");
    localStorage.setItem("theme", "light");
  } else {
    $("body").removeClass("light-theme").addClass("dark-theme");
    localStorage.setItem("theme", "dark");
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("currentSession");
  showPageTransition();
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

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

function showNotification(message) {
  $("#notification-message").text(message);
  $("#notification").addClass("active");
  setTimeout(() => {
    $("#notification").removeClass("active");
  }, 3000);
}

function initParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 100;
  for (let i = 0; i < particleCount; i++) {
    createEnhancedParticle(particlesContainer);
  }
}

function createEnhancedParticle(container) {
  const particle = document.createElement("div");
  particle.classList.add("particle");
  const size = Math.random() * 8 + 2;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  const posX = Math.random() * 100;
  const posY = Math.random() * 100;
  particle.style.left = `${posX}%`;
  particle.style.top = `${posY}%`;
  const opacity = Math.random() * 0.7 + 0.3;
  particle.style.opacity = opacity;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;
  container.appendChild(particle);
}

function addMysteryElements() {
  for (let i = 0; i < 5; i++) {
    const bloodSplatter = document.createElement("div");
    bloodSplatter.classList.add("blood-splatter");
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    bloodSplatter.style.left = `${posX}%`;
    bloodSplatter.style.top = `${posY}%`;
    const size = Math.random() * 50 + 30;
    const rotation = Math.random() * 360;
    bloodSplatter.style.width = `${size}px`;
    bloodSplatter.style.height = `${size}px`;
    bloodSplatter.style.transform = `rotate(${rotation}deg)`;
    document.body.appendChild(bloodSplatter);
  }
  for (let i = 0; i < 3; i++) {
    const detectiveIcon = document.createElement("div");
    detectiveIcon.classList.add("detective-icon");
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    detectiveIcon.style.left = `${posX}%`;
    detectiveIcon.style.top = `${posY}%`;
    document.body.appendChild(detectiveIcon);
  }
  const mysteryDecoration = document.createElement("div");
  mysteryDecoration.classList.add("mystery-decoration");
  document.querySelector(".main-content").appendChild(mysteryDecoration);
}

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

function showPageTransition() {
  const transition = document.createElement("div");
  transition.classList.add("page-transition");
  document.body.appendChild(transition);
  setTimeout(() => {
    transition.classList.add("active");
  }, 100);
}

$(() => {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    $("body").removeClass("dark-theme").addClass("light-theme");
    $("#theme-switch").prop("checked", true);
  }
});

function selectScript(scriptName) {
  localStorage.setItem("scriptName", scriptName);
  $(".script-select-btn").each(function () {
    const btnScriptName = $(this).data("name");
    if (btnScriptName === scriptName) {
      $(this).addClass("selected").text("✓ 已选择");
    } else {
      $(this).removeClass("selected").text("选择剧本");
    }
  });
  $("#script-select option").each(function () {
    if ($(this).text() === scriptName) {
      $(this).prop("selected", true);
    }
  });
  showNotification(`已选择剧本: ${scriptName}`);
}

// 打开添加角色到剧本的模态框
function openAddAgentsToScriptModal() {
  console.log("Opening add agents to script modal"); // 调试日志
  const $modal = $("#add-agents-to-script-modal");
  if ($modal.length === 0) {
    console.error("Modal #add-agents-to-script-modal not found in DOM");
    showNotification("无法打开角色选择窗口");
    return;
  }
  $modal.css("display", "flex").hide().fadeIn(300);
  $.ajax({
    url: "/agents/getAllAgents",
    type: "GET",
    success: (response) => {
      const $agentSelectList = $("#script-agent-select-list");
      if ($agentSelectList.length === 0) {
        console.error("Element #script-agent-select-list not found");
        showNotification("无法加载角色列表");
        return;
      }
      $agentSelectList.empty();
      if (response && Array.isArray(response) && response.length > 0) {
        response.forEach((agent) => {
          const agentSelectItem = $(`
            <div class="agent-select-item">
              <input type="checkbox" id="agent-script-${agent.agentId}" value="${agent.agentId}">
              <label for="agent-script-${agent.agentId}">${agent.agentName} (${agent.agentRole || "未知身份"})</label>
            </div>
          `);
          $agentSelectList.append(agentSelectItem);
        });
      } else {
        $agentSelectList.html('<p class="empty-list">暂无可选角色</p>');
      }
    },
    error: (xhr, status, error) => {
      console.error("Failed to load agents:", error);
      showNotification("加载角色列表失败");
    },
  });
}

// 使用事件委托绑定关闭按钮
$(document).on("click", ".close-modal-btn", () => {
  console.log("Close modal button clicked"); // 调试日志
  closeModals();
});

// 绑定添加角色到剧本按钮
$(document).on("click", "#add-agents-to-script-btn", () => {
  console.log("Add agents to script button clicked");
  openAddAgentsToScriptModal();
});

// 绑定确认添加角色按钮
$(document).on("click", "#confirm-agents-to-script-btn", () => {
  console.log("Confirm agents to script button clicked");
  confirmAgentsToScript();
});

// 关闭所有模态框
function closeModals() {
  console.log("Closing modals"); // 调试日志
  const modals = [
    ".create-session-modal",
    ".create-script-modal",
    ".create-agent-modal",
    ".add-agent-modal",
    ".script-details-modal",
    ".agent-details-modal",
    ".add-agents-to-script-modal" // 新增
  ];
  $(modals.join(", ")).fadeOut(300, function () {
    console.log("Modal faded out:", $(this).attr("id")); // 调试日志
  });
}

// 确认添加角色到剧本
function confirmAgentsToScript() {
  console.log("Confirming agents to script"); // 调试日志
  const selectedAgents = [];
  $("#script-agent-select-list input:checked").each(function () {
    selectedAgents.push($(this).val());
  });
  if (selectedAgents.length === 0) {
    showNotification("请选择至少一个角色");
    return;
  }
  // 临时存储选中的 agentId 列表，供 createScript 使用
  localStorage.setItem("selectedAgentIds", JSON.stringify(selectedAgents));
  $("#add-agents-to-script-modal").fadeOut(300);
  // 更新已选角色列表显示
  const $selectedAgentsList = $("#selected-agents-list");
  if ($selectedAgentsList.length === 0) {
    console.error("Element #selected-agents-list not found");
  }
  $selectedAgentsList.empty();
  $("#script-agent-select-list input:checked").each(function () {
    const agentName = $(this).next("label").text();
    $selectedAgentsList.append(`<p style="font-size: 14px; margin: 5px 0;">${agentName}</p>`);
  });
}

