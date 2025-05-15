$(document).ready(() => {
  // 加载角色数据
  window.loadAgentsData = () => {
    showLoading()

    // 获取用户创建的角色
    $.ajax({
      url: "/agents/getAllAgentsOfScript",
      type: "GET",
      data: {
        scriptId: 1, // 假设当前剧本ID为1
      },
      success: (agents) => {
        hideLoading()

        // 更新统计数据
        $("#agent-count").text(agents.length)

        // 渲染角色列表
        renderAgents(agents)
      },
      error: () => {
        hideLoading()
        showNotification("加载失败", "无法加载角色数据", "error")
      },
    })
  }

  // 渲染角色列表
  function renderAgents(agents) {
    const $agentsList = $("#agents-list")
    $agentsList.empty()

    if (agents.length === 0) {
      $agentsList.append(`
                <div class="empty-state">
                    <p>您还没有创建任何角色</p>
                    <button id="empty-create-agent" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 创建第一个角色
                    </button>
                </div>
            `)

      $("#empty-create-agent").click(() => {
        showCreateAgentModal()
      })

      return
    }

    agents.forEach((agent) => {
      const agentCard = `
                <div class="agent-card">
                    <div class="agent-card-header">
                        <div class="agent-avatar">
                            <i class="fas fa-user-secret"></i>
                        </div>
                        <h4>${agent.agentName}</h4>
                        <p>${agent.agentRole}</p>
                    </div>
                    <div class="agent-card-body">
                        <p>${agent.description || "暂无描述"}</p>
                    </div>
                    <div class="agent-card-footer">
                        <button class="btn btn-outline edit-agent-btn" data-agent-id="${agent.agentId}">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-primary choose-agent-btn" data-agent-id="${agent.agentId}">
                            <i class="fas fa-check"></i> 选择
                        </button>
                    </div>
                </div>
            `
      $agentsList.append(agentCard)
    })

    // 绑定编辑角色按钮点击事件
    $(".edit-agent-btn").click(function () {
      const agentId = $(this).data("agent-id")
      editAgent(agentId)
    })

    // 绑定选择角色按钮点击事件
    $(".choose-agent-btn").click(function () {
      const agentId = $(this).data("agent-id")
      chooseAgent(agentId)
    })
  }

  // 创建角色按钮点击事件
  $("#create-agent-btn").click(() => {
    showCreateAgentModal()
  })

  // 显示创建角色模态框
  function showCreateAgentModal() {
    $("#create-agent-form")[0].reset()
    $("#modal-container").removeClass("hidden")
    $("#create-agent-modal").removeClass("hidden")
  }

  // 创建角色提交
  $("#create-agent-submit").click(() => {
    const agentName = $("#agent-name").val()
    const agentRole = $("#agent-role").val()
    const description = $("#agent-description").val()

    if (!agentName || !agentRole) {
      showNotification("创建失败", "请填写角色名称和身份", "warning")
      return
    }

    showLoading()

    $.ajax({
      url: "/createAgent",
      type: "POST",
      data: {
        agentName: agentName,
        agentRole: agentRole,
        description: description,
      },
      success: (agent) => {
        hideLoading()
        closeModal()

        showNotification("创建成功", "角色已创建", "success")

        // 重新加载角色数据
        loadAgentsData()
      },
      error: () => {
        hideLoading()
        showNotification("创建失败", "无法创建角色", "error")
      },
    })
  })

  // 编辑角色
  function editAgent(agentId) {
    showNotification("功能未实现", "角色编辑功能暂未实现", "info")
  }

  // 选择角色
  function chooseAgent(agentId) {
    showLoading()

    $.ajax({
      url: "/agents/userChooseAgent",
      type: "POST",
      data: {
        agentId: agentId,
      },
      success: (agent) => {
        hideLoading()

        showNotification("选择成功", `已选择角色: ${agent.agentName}`, "success")

        // 重新加载角色数据
        loadAgentsData()
      },
      error: () => {
        hideLoading()
        showNotification("选择失败", "无法选择角色", "error")
      },
    })
  }
})
