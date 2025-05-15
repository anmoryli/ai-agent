$(document).ready(() => {
  // 初始化粒子背景
  if (document.getElementById("particles")) {
    initParticles()
  }

  // 添加页面加载动画
  addPageLoadAnimation()

  // 添加血迹滴落效果
  addBloodDrops()

  // 添加神秘烟雾效果
  addMysterySmoke()

  // 添加神秘符文
  addMysteryRunes()

  // 监听滚动事件，添加滚动动画
  $(window).scroll(() => {
    animateOnScroll()
  })

  // 初始触发一次滚动动画
  animateOnScroll()
})

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

// 添加血迹滴落效果
function addBloodDrops() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const bloodDrop = document.createElement("div")
      bloodDrop.classList.add("blood-drop")

      // 随机位置
      const posX = Math.random() * 100
      bloodDrop.style.left = `${posX}%`

      document.body.appendChild(bloodDrop)

      // 移除元素
      setTimeout(() => {
        bloodDrop.remove()
      }, 2000)
    }, i * 5000) // 每5秒添加一个
  }
}

// 添加神秘烟雾效果
function addMysterySmoke() {
  setInterval(() => {
    const smoke = document.createElement("div")
    smoke.classList.add("smoke")

    // 随机位置
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    smoke.style.left = `${posX}%`
    smoke.style.top = `${posY}%`

    document.body.appendChild(smoke)

    // 移除元素
    setTimeout(() => {
      smoke.remove()
    }, 3000)
  }, 2000) // 每2秒添加一个
}

// 添加神秘符文
function addMysteryRunes() {
  const runes = ["⚔️", "🔮", "📜", "🗝️", "⚰️", "🔍", "📖", "🧩", "🔪", "🧿"]

  setInterval(() => {
    const rune = document.createElement("div")
    rune.classList.add("rune-symbol")
    rune.textContent = runes[Math.floor(Math.random() * runes.length)]

    // 随机位置
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    rune.style.left = `${posX}%`
    rune.style.top = `${posY}%`

    document.body.appendChild(rune)

    // 移除元素
    setTimeout(() => {
      rune.remove()
    }, 5000)
  }, 3000) // 每3秒添加一个
}

// 添加页面加载动画
function addPageLoadAnimation() {
  $("body").css("opacity", "0")

  setTimeout(() => {
    $("body").css({
      opacity: "1",
      transition: "opacity 0.8s ease-in-out",
    })
  }, 100)
}

// 滚动时添加动画
function animateOnScroll() {
  const elements = $(".animate-on-scroll")

  elements.each(function () {
    const element = $(this)
    const elementTop = element.offset().top
    const windowHeight = $(window).height()
    const scrollTop = $(window).scrollTop()

    if (scrollTop + windowHeight > elementTop + 100) {
      element.addClass("animated")
    }
  })
}

// 线索解锁动画
function playClueUnlockAnimation(clueElement) {
  clueElement.addClass("unlocking")

  setTimeout(() => {
    clueElement.removeClass("unlocking")
  }, 1000)
}

// 添加波纹效果
function addRippleEffect(element) {
  element.on("click", function (e) {
    const ripple = document.createElement("div")
    ripple.classList.add("ripple")

    const rect = this.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)

    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`

    this.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  })
}

// 添加打字机效果
function typeWriter(element, text, speed = 50) {
  let i = 0
  element.text("")

  function type() {
    if (i < text.length) {
      element.text(element.text() + text.charAt(i))
      i++
      setTimeout(type, speed)
    }
  }

  type()
}

// 添加闪烁效果
function addBlinkEffect(element, duration = 500) {
  setInterval(() => {
    element.fadeOut(duration / 2).fadeIn(duration / 2)
  }, duration)
}

// 添加悬浮效果
function addFloatEffect(element) {
  element.css("animation", "float 3s infinite ease-in-out")
}

// 添加脉冲效果
function addPulseEffect(element) {
  element.css("animation", "pulse 2s infinite ease-in-out")
}

// 添加旋转效果
function addRotateEffect(element) {
  element.css("animation", "rotate 3s infinite linear")
}

// 添加抖动效果
function addShakeEffect(element) {
  element.addClass("shake")

  setTimeout(() => {
    element.removeClass("shake")
  }, 1000)
}

// 添加弹跳效果
function addBounceEffect(element) {
  element.css("animation", "bounce 1s")

  setTimeout(() => {
    element.css("animation", "")
  }, 1000)
}

// 添加淡入效果
function fadeInElement(element, duration = 500) {
  element.css("opacity", "0")

  setTimeout(() => {
    element.css({
      opacity: "1",
      transition: `opacity ${duration}ms ease-in-out`,
    })
  }, 100)
}

// 添加淡出效果
function fadeOutElement(element, duration = 500) {
  element.css({
    opacity: "0",
    transition: `opacity ${duration}ms ease-in-out`,
  })

  setTimeout(() => {
    element.css("display", "none")
  }, duration)
}

// 添加滑入效果
function slideInElement(element, direction = "right", duration = 500) {
  let transform = ""

  switch (direction) {
    case "right":
      transform = "translateX(100%)"
      break
    case "left":
      transform = "translateX(-100%)"
      break
    case "top":
      transform = "translateY(-100%)"
      break
    case "bottom":
      transform = "translateY(100%)"
      break
  }

  element.css({
    transform: transform,
    opacity: "0",
  })

  setTimeout(() => {
    element.css({
      transform: "translate(0)",
      opacity: "1",
      transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
    })
  }, 100)
}

// 添加滑出效果
function slideOutElement(element, direction = "right", duration = 500) {
  let transform = ""

  switch (direction) {
    case "right":
      transform = "translateX(100%)"
      break
    case "left":
      transform = "translateX(-100%)"
      break
    case "top":
      transform = "translateY(-100%)"
      break
    case "bottom":
      transform = "translateY(100%)"
      break
  }

  element.css({
    transform: transform,
    opacity: "0",
    transition: `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`,
  })

  setTimeout(() => {
    element.css("display", "none")
  }, duration)
}

// 添加缩放效果
function scaleElement(element, scale = 1.1, duration = 300) {
  element.css({
    transform: `scale(${scale})`,
    transition: `transform ${duration}ms ease-out`,
  })

  setTimeout(() => {
    element.css({
      transform: "scale(1)",
      transition: `transform ${duration}ms ease-out`,
    })
  }, duration)
}

// 添加3D翻转效果
function flipElement(element, direction = "x", duration = 500) {
  const transform = direction === "x" ? "rotateX(180deg)" : "rotateY(180deg)"

  element.css({
    transform: transform,
    transition: `transform ${duration}ms ease-out`,
  })

  setTimeout(() => {
    element.css({
      transform: "rotate(0)",
      transition: `transform ${duration}ms ease-out`,
    })
  }, duration)
}

// 添加闪光效果
function addShineEffect(element) {
  const shine = document.createElement("div")
  shine.classList.add("shine-effect")

  element.append(shine)

  setTimeout(() => {
    shine.remove()
  }, 1000)
}

// 添加渐变背景动画
function addGradientAnimation(element) {
  element.css({
    background: "linear-gradient(45deg, var(--primary-color), var(--secondary-color), var(--primary-color))",
    "background-size": "200% 200%",
    animation: "gradientAnimation 5s ease infinite",
  })
}

// 添加打字机光标效果
function addCursorEffect(element) {
  element.addClass("cursor-effect")
}

// 添加霓虹灯效果
function addNeonEffect(element) {
  element.css({
    "text-shadow": "0 0 5px var(--primary-color), 0 0 10px var(--primary-color), 0 0 15px var(--primary-color)",
    animation: "neon 1.5s ease-in-out infinite alternate",
  })
}

// 添加水波纹效果
function addWaterEffect(element) {
  element.addClass("water-effect")
}

// 添加雪花效果
function addSnowEffect(container) {
  const snowflakeCount = 50

  for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = document.createElement("div")
    snowflake.classList.add("snowflake")

    // 随机大小
    const size = Math.random() * 5 + 2
    snowflake.style.width = `${size}px`
    snowflake.style.height = `${size}px`

    // 随机位置
    const posX = Math.random() * 100
    snowflake.style.left = `${posX}%`

    // 随机动画
    const duration = Math.random() * 10 + 5
    const delay = Math.random() * 5
    snowflake.style.animation = `snowfall ${duration}s ${delay}s infinite linear`

    container.appendChild(snowflake)
  }
}

// 添加星星效果
function addStarEffect(container) {
  const starCount = 50

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div")
    star.classList.add("star")

    // 随机大小
    const size = Math.random() * 3 + 1
    star.style.width = `${size}px`
    star.style.height = `${size}px`

    // 随机位置
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    star.style.left = `${posX}%`
    star.style.top = `${posY}%`

    // 随机动画
    const duration = Math.random() * 3 + 1
    const delay = Math.random() * 3
    star.style.animation = `twinkle ${duration}s ${delay}s infinite ease-in-out`

    container.appendChild(star)
  }
}

// 添加烟雾效果
function addSmokeEffect(element) {
  element.addClass("smoke-effect")
}

// 添加火焰效果
function addFireEffect(element) {
  element.addClass("fire-effect")
}

// 添加电击效果
function addElectricEffect(element) {
  element.addClass("electric-effect")
}

// 添加爆炸效果
function addExplosionEffect(element) {
  element.addClass("explosion")

  setTimeout(() => {
    element.removeClass("explosion")
  }, 1000)
}

// 添加彩色阴影效果
function addColorShadowEffect(element) {
  element.css({
    "box-shadow": "0 0 10px var(--primary-color), 0 0 20px var(--secondary-color), 0 0 30px var(--primary-light)",
    animation: "colorShadow 3s infinite alternate",
  })
}

// 添加悬浮卡片效果
function addFloatingCardEffect(element) {
  element.css({
    transform: "translateY(0)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease, border-left-color 0.3s ease",
  })

  element.hover(
    function () {
      $(this).css({
        transform: "translateY(-5px)",
        "box-shadow": "0 10px 20px rgba(194, 55, 87, 0.3)",
        "border-left-color": "var(--primary-color)",
      })
    },
    function () {
      $(this).css({
        transform: "translateY(0)",
        "box-shadow": "none",
        "border-left-color": "transparent",
      })
    },
  )
}

// 添加3D视差效果
function addParallaxEffect(element) {
  $(document).on("mousemove", (e) => {
    const mouseX = e.clientX / $(window).width() - 0.5
    const mouseY = e.clientY / $(window).height() - 0.5

    element.css({
      transform: `perspective(1000px) rotateY(${mouseX * 10}deg) rotateX(${-mouseY * 10}deg) translateZ(10px)`,
    })
  })
}

// 添加鼠标跟随效果
function addMouseFollowEffect(element) {
  $(document).on("mousemove", (e) => {
    element.css({
      left: e.pageX + "px",
      top: e.pageY + "px",
    })
  })
}

// 添加打字删除效果
function typeDeleteEffect(element, text, typeSpeed = 100, deleteSpeed = 50, delay = 2000) {
  let i = 0
  element.text("")

  function type() {
    if (i < text.length) {
      element.text(element.text() + text.charAt(i))
      i++
      setTimeout(type, typeSpeed)
    } else {
      setTimeout(deleteText, delay)
    }
  }

  function deleteText() {
    const currentText = element.text()
    if (currentText.length > 0) {
      element.text(currentText.slice(0, -1))
      setTimeout(deleteText, deleteSpeed)
    } else {
      i = 0
      setTimeout(type, typeSpeed)
    }
  }

  type()
}

// 添加文字渐变效果
function addTextGradientEffect(element) {
  element.css({
    background: "linear-gradient(45deg, var(--primary-color), var(--secondary-color))",
    "background-size": "200% 200%",
    animation: "gradientAnimation 5s ease infinite",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  })
}

// 添加文字阴影动画
function addTextShadowAnimation(element) {
  element.css({
    "text-shadow": "0 0 5px var(--primary-color)",
    animation: "textShadowPulse 2s infinite",
  })
}

// 添加边框动画
function addBorderAnimation(element) {
  element.css({
    position: "relative",
    overflow: "hidden",
  })

  const border = document.createElement("div")
  border.classList.add("animated-border")

  element.append(border)
}

// 添加加载动画
function addLoadingAnimation(element, type = "spinner") {
  element.empty()

  switch (type) {
    case "spinner":
      element.append('<div class="spinner"></div>')
      break
    case "dots":
      element.append('<div class="loading-dots"><span></span><span></span><span></span></div>')
      break
    case "bar":
      element.append('<div class="loading-bar"><div class="bar-progress"></div></div>')
      break
    case "circle":
      element.append('<div class="loading-circle"></div>')
      break
  }
}

// 添加进度条动画
function animateProgressBar(element, progress, duration = 1000) {
  element.css({
    width: "0%",
    transition: `width ${duration}ms ease-out`,
  })

  setTimeout(() => {
    element.css("width", progress + "%")
  }, 100)
}

// 添加计数器动画
function animateCounter(element, start, end, duration = 2000) {
  let current = start
  const increment = (end - start) / (duration / 50)
  const timer = setInterval(() => {
    current += increment

    if (current >= end) {
      current = end
      clearInterval(timer)
    }

    element.text(Math.round(current))
  }, 50)
}

// 添加滚动显示动画
function addScrollRevealAnimation() {
  const elements = $(".scroll-reveal")

  elements.each(function () {
    const element = $(this)
    element.css("opacity", "0")

    const waypoint = new Waypoint({
      element: element[0],
      handler: function () {
        element.css({
          opacity: "1",
          transform: "translateY(0)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        })
        this.destroy()
      },
      offset: "90%",
    })
  })
}

// 添加滚动视差效果
function addScrollParallaxEffect(element, speed = 0.5) {
  $(window).scroll(() => {
    const scrollTop = $(window).scrollTop()
    element.css("transform", `translateY(${scrollTop * speed}px)`)
  })
}

// 添加鼠标悬停效果
function addHoverEffect(element) {
  element.hover(
    function () {
      $(this).css({
        transform: "scale(1.05)",
        transition: "transform 0.3s ease",
      })
    },
    function () {
      $(this).css({
        transform: "scale(1)",
        transition: "transform 0.3s ease",
      })
    },
  )
}

// 添加图片滤镜动画
function addImageFilterAnimation(element) {
  element.css({
    filter: "hue-rotate(0deg)",
    animation: "filterAnimation 5s infinite linear",
  })
}

// 添加模糊动画
function addBlurAnimation(element, maxBlur = 5) {
  element.css({
    filter: "blur(0px)",
    animation: `blurAnimation ${maxBlur}s infinite alternate`,
  })
}

// 添加颜色变化动画
function addColorChangeAnimation(element) {
  element.css({
    animation: "colorChange 5s infinite alternate",
  })
}

// 添加形状变化动画
function addShapeChangeAnimation(element) {
  element.css({
    animation: "shapeChange 5s infinite alternate",
  })
}

// 添加抖动文字效果
function addShakingTextEffect(element) {
  const text = element.text()
  let html = ""

  for (let i = 0; i < text.length; i++) {
    html += `<span style="animation: textShake 0.5s ${i * 0.05}s infinite;">${text[i]}</span>`
  }

  element.html(html)
}

// 添加分散文字效果
function addScatterTextEffect(element) {
  const text = element.text()
  let html = ""

  for (let i = 0; i < text.length; i++) {
    html += `<span style="animation: textScatter 1s ${i * 0.1}s forwards;">${text[i]}</span>`
  }

  element.html(html)
}

// 添加旋转文字效果
function addRotatingTextEffect(element) {
  const text = element.text()
  let html = ""

  for (let i = 0; i < text.length; i++) {
    html += `<span style="animation: textRotate 2s ${i * 0.1}s infinite;">${text[i]}</span>`
  }

  element.html(html)
}

// 添加弹跳文字效果
function addBouncingTextEffect(element) {
  const text = element.text()
  let html = ""

  for (let i = 0; i < text.length; i++) {
    html += `<span style="animation: textBounce 0.5s ${i * 0.05}s infinite alternate;">${text[i]}</span>`
  }

  element.html(html)
}

// 添加波浪文字效果
function addWaveTextEffect(element) {
  const text = element.text()
  let html = ""

  for (let i = 0; i < text.length; i++) {
    html += `<span style="animation: textWave 2s ${i * 0.1}s infinite ease-in-out;">${text[i]}</span>`
  }

  element.html(html)
}

// 添加3D文字效果
function add3DTextEffect(element) {
  element.css({
    "text-shadow": "1px 1px 0 var(--primary-light), 2px 2px 0 var(--primary-color), 3px 3px 0 var(--primary-dark)",
    transform: "perspective(500px) rotateX(10deg)",
  })
}

// 添加霓虹文字效果
function addNeonTextEffect(element) {
  element.css({
    "text-shadow":
      "0 0 5px var(--primary-color), 0 0 10px var(--primary-color), 0 0 15px var(--primary-color), 0 0 20px var(--primary-color)",
    animation: "neonPulse 1.5s infinite alternate",
  })
}

// 添加打字机效果
function addTypewriterEffect(element, text, speed = 100) {
  element.text("")
  let i = 0

  function typeWriter() {
    if (i < text.length) {
      element.text(element.text() + text.charAt(i))
      i++
      setTimeout(typeWriter, speed)
    }
  }

  typeWriter()
}
