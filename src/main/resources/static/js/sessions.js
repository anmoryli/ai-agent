$(document).ready(() => {
  // 渲染所有剧本
  window.renderAllScripts = (scripts) => {
    console.log("渲染会话", scripts)
    const $allSessionsList = $("#all-sessions-list")
    $allSessionsList.empty()

    if (scripts.length === 0) {
      $allSessionsList.append(`
                <div class="empty-state">
                    <p>您还没有创建任何剧本</p>
                    <button id="sessions-empty-create" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 创建第一个剧本
                    </button>
                </div>
            `)

      $("#sessions-empty-create").click(() => {
        showCreateSessionModal()
      })

      return
    }

    sessions.forEach((scripts) => {
      const sessionCard = createSessionCard(scripts)
      $allSessionsList.append(sessionCard)
    })

    // 绑定会话卡片点击事件
    $(".session-card-enter").click(function () {
      const sessionId = $(this).data("session-id")
      openChatInterface(sessionId)
    })
  }

  $.ajax({
      url: "/script/getCluesByScriptId",
      type: "GET",
      data: {
        scriptId: scriptId,
      },
      success: (clues) => {
        hideLoading();
        renderClues(clues); // 复用已有的线索渲染函数
      },
      error: () => {
        hideLoading();
        showNotification("加载失败", "无法加载线索", "error");
      },
    });

  // 渲染所有会话
  window.renderAllSessions = (sessions) => {
    console.log("渲染会话", sessions)
    const $allSessionsList = $("#all-sessions-list")
    $allSessionsList.empty()

    if (sessions.length === 0) {
      $allSessionsList.append(`
                <div class="empty-state">
                    <p>您还没有创建任何剧本</p>
                    <button id="sessions-empty-create" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 创建第一个剧本
                    </button>
                </div>
            `)

      $("#sessions-empty-create").click(() => {
        showCreateSessionModal()
      })

      return
    }

    sessions.forEach((session) => {
      const sessionCard = createSessionCard(session)
      $allSessionsList.append(sessionCard)
    })

    // 绑定会话卡片点击事件
    $(".session-card-enter").click(function () {
      const sessionId = $(this).data("session-id")
      openChatInterface(sessionId)
    })
  }

  // 填充会话选择器
  window.populateSessionSelector = (sessions) => {
    const $sessionSelect = $("#clue-session-select")
    $sessionSelect.empty()

    if (sessions.length === 0) {
      $sessionSelect.append(`<option value="">暂无剧本</option>`)
      return
    }

    sessions.forEach((session) => {
      $sessionSelect.append(`<option value="${session.sessionId}">${session.title}</option>`)
    })

    // 绑定会话选择器变更事件
    $sessionSelect.change(function () {
      const sessionId = $(this).val()
      if (sessionId) {
        loadSessionClues(sessionId)
      }
    })
  }

  // 加载会话线索
  function loadSessionClues(sessionId) {
    showLoading()

    $.ajax({
      url: "/clues/getCluesBySessionId",
      type: "GET",
      data: {
        sessionId: sessionId,
      },
      success: (clues) => {
        hideLoading()
        renderClues(clues)
      },
      error: () => {
        hideLoading()
        showNotification("加载失败", "无法加载线索", "error")
      },
    })
  }

  // 渲染线索
  function renderClues(clues) {
    const $cluesList = $("#clues-list")
    $cluesList.empty()

    if (clues.length === 0) {
      $cluesList.append(`
                <div class="empty-state">
                    <p>暂无线索</p>
                </div>
            `)
      return
    }

    clues.forEach((clue) => {
      const isLocked = clue.isLocked === 1
      const clueCard = `
                <div class="clue-card ${isLocked ? "locked" : ""}">
                    <h4>${clue.clueName}</h4>
                    ${!isLocked ? `<p>${clue.clueContent}</p>` : ""}
                    ${
                      !isLocked
                        ? `
                    <div class="clue-card-footer">
                        <button class="btn btn-primary view-clue-btn" data-clue-id="${clue.clueId}">
                            <i class="fas fa-eye"></i> 查看详情
                        </button>
                    </div>
                    `
                        : ""
                    }
                </div>
            `
      $cluesList.append(clueCard)
    })

    // 绑定查看线索按钮点击事件
    $(".view-clue-btn").click(function () {
      const clueId = $(this).data("clue-id")
      viewClueDetail(clueId, clues)
    })
  }

  // 查看线索详情
  function viewClueDetail(clueId, clues) {
    const clue = clues.find((c) => c.clueId == clueId)

    if (clue) {
      $("#modal-container").removeClass("hidden")
      $("#clue-detail-modal").removeClass("hidden")

      $("#clue-detail-title").text(clue.clueName)
      $("#clue-detail-content").text(clue.clueContent)
    }
  }
})
