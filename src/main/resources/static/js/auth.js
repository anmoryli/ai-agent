$(document).ready(() => {
  // 检查是否已登录
  checkLoginStatus()

  // 粒子背景初始化
  initParticles()

  // 标签切换
  $(".tab").click(function () {
    const tab = $(this).data("tab")
    $(".tab").removeClass("active")
    $(this).addClass("active")
    $(".form-container form").removeClass("active")
    $(`#${tab}-form`).addClass("active")
  })

  // 登录表单提交
  $("#login-form").submit((e) => {
    e.preventDefault()

    const userName = $("#login-username").val()
    const password = $("#login-password").val()

    if (!userName || !password) {
      showNotification("用户名和密码不能为空")
      return
    }

    $.ajax({
      url: "/user/login",
      type: "POST",
      data: {
        userName: userName,
        password: password,
      },
      success: (response) => {
        if (response) {
          // 保存用户信息到本地存储
          localStorage.setItem("user", JSON.stringify(response))

          // 显示过渡动画
          showPageTransition()

          // 延迟跳转到主页
          setTimeout(() => {
            window.location.href = "main.html"
          }, 800)
        } else {
          showNotification("用户名或密码错误")
        }
      },
      error: () => {
        showNotification("登录失败，请稍后再试")
      },
    })
  })

  // 注册表单提交
  $("#register-form").submit((e) => {
    e.preventDefault()

    const userName = $("#register-username").val()
    const password = $("#register-password").val()
    const email = $("#register-email").val()
    const birth = $("#register-birth").val()
    const sex = $('input[name="sex"]:checked').val()

    if (!userName || !password) {
      showNotification("用户名和密码不能为空")
      return
    }

    $.ajax({
      url: "/user/register",
      type: "POST",
      data: {
        userName: userName,
        password: password,
        email: email,
        birth: birth || "2000-01-01",
        sex: sex,
      },
      success: (response) => {
        if (response) {
          showNotification("注册成功，请登录")

          // 切换到登录标签
          $('.tab[data-tab="login"]').click()

          // 自动填充用户名
          $("#login-username").val(userName)
        } else {
          showNotification("注册失败，用户名可能已存在")
        }
      },
      error: () => {
        showNotification("注册失败，请稍后再试")
      },
    })
  })
})

// 检查登录状态
function checkLoginStatus() {
  const user = localStorage.getItem("user")

  if (user) {
    // 已登录，跳转到主页
    window.location.href = "main.html"
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
  const particleCount = 50

  for (let i = 0; i < particleCount; i++) {
    createParticle(particlesContainer)
  }
}

// 创建粒子
function createParticle(container) {
  const particle = document.createElement("div")
  particle.classList.add("particle")

  // 随机大小
  const size = Math.random() * 5 + 2
  particle.style.width = `${size}px`
  particle.style.height = `${size}px`

  // 随机位置
  const posX = Math.random() * 100
  const posY = Math.random() * 100
  particle.style.left = `${posX}%`
  particle.style.top = `${posY}%`

  // 随机透明度
  const opacity = Math.random() * 0.5 + 0.1
  particle.style.opacity = opacity

  // 随机动画
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`

  container.appendChild(particle)
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
