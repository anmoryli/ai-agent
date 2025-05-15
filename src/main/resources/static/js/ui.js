$(document).ready(() => {
  // 初始化粒子效果
  initParticles()

  // 初始化动画效果
  initAnimations()

  // 响应式设计调整
  handleResponsiveDesign()

  // 窗口大小变化时重新调整
  $(window).resize(() => {
    handleResponsiveDesign()
  })

  // 初始化粒子效果
  function initParticles() {
    const $particles = $(".particles")

    // 创建粒子
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 5 + 1
      const posX = Math.random() * 100
      const posY = Math.random() * 100
      const opacity = Math.random() * 0.5 + 0.1
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 5

      const $particle = $('<div class="particle"></div>')
      $particle.css({
        position: "absolute",
        width: size + "px",
        height: size + "px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, " + opacity + ")",
        left: posX + "%",
        top: posY + "%",
        animation: "float " + duration + "s infinite ease-in-out " + delay + "s",
      })

      $particles.append($particle)
    }
  }

  // 初始化动画效果
  function initAnimations() {
    // 添加脉冲效果到统计卡片
    $(".stat-card").addClass("pulse")

    // 添加渐变背景动画到会话卡片头部
    $(".session-card-header").addClass("gradient-bg")

    // 添加浮动效果到空状态
    $(".empty-state").addClass("float")
  }

  // 处理响应式设计
  function handleResponsiveDesign() {
    const windowWidth = $(window).width()

    if (windowWidth <= 768) {
      // 移动设备
      $(".sidebar").removeClass("active")
      $(".main-content").css("margin-left", "0")
    } else {
      // 桌面设备
      $(".main-content").css("margin-left", "")
    }
  }

  // 模拟数据加载完成后的初始化
  function loadCluesData() {
    // 这里添加加载线索数据的具体逻辑
    console.log("Loading clues data...")
  }

  setTimeout(() => {
    // 加载线索数据
    loadCluesData()
  }, 1000)
})
