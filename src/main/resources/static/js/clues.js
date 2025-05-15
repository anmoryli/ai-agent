// 渲染剧本列表
function renderScripts(scripts) {
  const $scriptList = $("#script-list"); // 假设你有一个用于展示剧本的容器
  $scriptList.empty();
  console.log("渲染剧本列表", scripts);

  if (scripts.length === 0) {
    console.log("剧本列表为空");
    $scriptList.append(`
      <div class="empty-state">
        <p>暂无剧本</p>
      </div>
    `);
    return;
  }

  scripts.forEach((script) => {
    const scriptCard = `
      <div class="script-card" data-script-id="${script.scriptId}">
        <h4>${script.scriptName}</h4>
        <p>${script.description}</p>
        <button class="btn btn-primary load-clues-btn" data-script-id="${script.scriptId}">
          加载线索
        </button>
      </div>
    `;
    $scriptList.append(scriptCard);
  });

  // 根据剧本ID加载线索
  function loadCluesByScriptId(scriptId) {
    showLoading();

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
  }

  // 绑定加载线索按钮点击事件
  $(".load-clues-btn").click(function () {
    const scriptId = $(this).data("scriptId");
    loadCluesByScriptId(scriptId);
  });
}

// 获取剧本列表
window.loadScripts = () => {
  showLoading();

  $.ajax({
    url: "/script/getScripts",
    type: "GET",
    xhrFields: {
      withCredentials: true, // 强制带上 cookie
    },
    success: (scripts) => {
      console.log("获取剧本成功", scripts);
      hideLoading();
      renderScripts(scripts);
    },
    error: () => {
      hideLoading();
      showNotification("加载失败", "无法加载剧本", "error");
    },
  });
};

$(document).ready(() => {
  loadScripts(); // 页面加载时获取剧本
  renderScripts(); // 渲染剧本列表
  // 加载线索数据
  window.loadCluesData = () => {
    // 获取已解锁的线索数量
    // 由于没有直接的API，我们可以模拟一些数据
    $("#clue-count").text(3);
  };

  // 加载会话线索
  window.loadSessionClues = (sessionId) => {
    showLoading();

    $.ajax({
      url: "/clues/getCluesBySessionId",
      type: "GET",
      data: {
        sessionId: sessionId,
      },
      success: (clues) => {
        hideLoading();
        renderClues(clues);
      },
      error: () => {
        hideLoading();
        showNotification("加载失败", "无法加载线索", "error");
      },
    });
  };

  // 渲染线索
  function renderClues(clues) {
    const $cluesList = $("#clues-list");
    $cluesList.empty();

    if (clues.length === 0) {
      $cluesList.append(`
                <div class="empty-state">
                    <p>暂无线索</p>
                </div>
            `);
      return;
    }

    clues.forEach((clue) => {
      const isLocked = clue.isLocked === 1;
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
            `;
      $cluesList.append(clueCard);
    });

    // 绑定查看线索按钮点击事件
    $(".view-clue-btn").click(function () {
      const clueId = $(this).data("clue-id");
      viewClueDetail(clueId, clues);
    });
  }

  // 查看线索详情
  function viewClueDetail(clueId, clues) {
    const clue = clues.find((c) => c.clueId == clueId);

    if (clue) {
      $("#modal-container").removeClass("hidden");
      $("#clue-detail-modal").removeClass("hidden");

      $("#clue-detail-title").text(clue.clueName);
      $("#clue-detail-content").text(clue.clueContent);
    }
  }

  // 解锁线索
  window.unlockClue = (clueId) => {
    showLoading();

    // 这里应该调用解锁线索的API
    // 由于没有直接的API，我们可以模拟一些数据
    const mockClue = {
      clueId: clueId,
      clueName: "新线索",
      clueContent: "这是一条新解锁的线索内容。",
    };

    setTimeout(() => {
      hideLoading();
      showNotification("解锁成功", "新线索已解锁", "success");

      // 更新线索数量
      const currentCount = Number.parseInt($("#clue-count").text());
      $("#clue-count").text(currentCount + 1);

      // 显示线索详情
      $("#modal-container").removeClass("hidden");
      $("#clue-detail-modal").removeClass("hidden");

      $("#clue-detail-title").text(mockClue.clueName);
      $("#clue-detail-content").text(mockClue.clueContent);
    }, 1000);
  };
});
