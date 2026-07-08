(function () {
  "use strict";

  var FLOWER_COUNT = 13;
  var DOUBLE_TAP_MS = 350;
  var BURN_DURATION_MS = 45000;
  var BLESSING_INTERVAL_MS = 12000;

  /* 抛物线：|v_y| < APEX_VY_THRESHOLD 的时段 ≈ APEX_HOVER_SEC */
  var APEX_HOVER_SEC = 0.5;
  var APEX_VY_THRESHOLD = 52;
  var GRAVITY = (2 * APEX_VY_THRESHOLD) / APEX_HOVER_SEC;

  var BLESSINGS = [
    "生日快乐，愿你每一天都被温柔包围。",
    "又长大一岁啦，但在我眼里你永远是最可爱的那一个。",
    "许个愿吧，所有的美好都会慢慢向你走来。",
    "谢谢你出现在我的生命里，这是最棒的礼物。",
    "愿新的一岁，平安、喜乐、万事胜意。",
    "蛋糕上的烛光，是我为你点亮的所有祝福。",
    "不管几岁，快乐万岁！",
    "希望你的笑容，永远像今天这样明亮。",
    "每一岁都珍贵，每一天都值得庆祝。",
    "生日快乐，我的小朋友。"
  ];

  var state = "unlit";
  var lastTap = 0;
  var burnStart = 0;
  var burnTimer = null;
  var blessingTimer = null;
  var rafId = null;

  var candleZone = document.getElementById("candleZone");
  var candle = document.getElementById("candle");
  var wick = document.getElementById("wick");
  var flameWrap = document.getElementById("flameWrap");
  var smoke = document.getElementById("smoke");
  var hint = document.getElementById("hint");
  var blessingStage = document.getElementById("blessingStage");

  var CANDLE_FULL = 86;
  var WICK_FULL = 14;

  function randomFlowerSrc() {
    var n = Math.floor(Math.random() * FLOWER_COUNT) + 1;
    var num = n < 10 ? "0" + n : String(n);
    return "../images/flowers/f" + num + ".jpg";
  }

  function randomBlessing() {
    return BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function setHint(text) {
    hint.textContent = text;
    hint.classList.remove("hidden");
  }

  function buildTrajectory() {
    var W = window.innerWidth;
    var H = window.innerHeight;

    var x0 = randomBetween(W * 0.22, W * 0.78);
    var y0 = H + randomBetween(40, 100);
    var xa = randomBetween(W * 0.14, W * 0.86);
    var ya = randomBetween(H * 0.08, H * 0.30);
    var y1 = H + randomBetween(60, 120);

    var g = GRAVITY;
    var rise = y0 - ya;
    if (rise < 120) rise = 120;

    var tApex = Math.sqrt((2 * rise) / g);
    var vy0 = -g * tApex;
    var vx0 = (xa - x0) / tApex;

    var fall = y1 - ya;
    var tFall = Math.sqrt((2 * fall) / g);
    var totalT = tApex + tFall;

    return {
      x0: x0,
      y0: y0,
      vx0: vx0,
      vy0: vy0,
      g: g,
      totalT: totalT,
      tApex: tApex,
      rot: randomBetween(-10, 10)
    };
  }

  function showBlessing() {
    var traj = buildTrajectory();

    var card = document.createElement("div");
    card.className = "blessing-card-flying";

    var img = document.createElement("img");
    img.alt = "祝福图片";
    img.src = randomFlowerSrc();
    img.onerror = function () {
      var png = img.src.replace(".jpg", ".png");
      if (img.src !== png) img.src = png;
    };

    var text = document.createElement("p");
    text.textContent = randomBlessing();

    card.appendChild(img);
    card.appendChild(text);
    blessingStage.appendChild(card);

    var start = performance.now();
    var animId = null;

    function frame(now) {
      var t = (now - start) / 1000;

      if (t >= traj.totalT) {
        card.remove();
        return;
      }

      var x = traj.x0 + traj.vx0 * t;
      var y = traj.y0 + traj.vy0 * t + 0.5 * traj.g * t * t;
      var vy = traj.vy0 + traj.g * t;

      var opacity = 1;
      if (t < 0.12) opacity = t / 0.12;
      if (t > traj.totalT - 0.28) opacity = Math.max(0, (traj.totalT - t) / 0.28);

      var tilt = traj.rot + vy * 0.015;
      var scale = 0.88 + Math.min(t / traj.tApex, 1) * 0.12;

      card.style.transform =
        "translate(" + x + "px, " + y + "px) translate(-50%, -50%) " +
        "rotate(" + tilt.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
      card.style.opacity = String(opacity);

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    setTimeout(function () {
      cancelAnimationFrame(animId);
      if (card.parentNode) card.remove();
    }, traj.totalT * 1000 + 300);
  }

  function lightCandle() {
    if (state !== "unlit") return;

    state = "burning";
    burnStart = performance.now();
    flameWrap.classList.add("lit");
    flameWrap.classList.remove("out");
    smoke.classList.remove("active");
    setHint("蜡烛燃烧中… 双击吹灭");
    showBlessing();

    burnTimer = setTimeout(function () {
      blowOut(true);
    }, BURN_DURATION_MS);

    blessingTimer = setInterval(function () {
      if (state === "burning") showBlessing();
    }, BLESSING_INTERVAL_MS);

    tickBurn();
  }

  function blowOut(auto) {
    if (state !== "burning") return;

    state = "out";
    clearTimeout(burnTimer);
    clearInterval(blessingTimer);
    cancelAnimationFrame(rafId);

    flameWrap.classList.remove("lit");
    flameWrap.classList.add("out");
    smoke.classList.add("active");

    setHint(auto ? "蜡烛燃尽了，再双击可以重新点燃" : "呼—— 再双击可以重新点燃");

    setTimeout(function () {
      resetCandleVisual();
      state = "unlit";
      setHint("双击蜡烛点火");
    }, 2200);
  }

  function setCandleHeight(h) {
    candle.style.height = h + "px";
    candleZone.style.setProperty("--candle-h", h + "px");
  }

  function resetCandleVisual() {
    setCandleHeight(CANDLE_FULL);
    wick.style.height = WICK_FULL + "px";
    smoke.classList.remove("active");
    flameWrap.classList.remove("out");
  }

  function tickBurn() {
    if (state !== "burning") return;

    var elapsed = performance.now() - burnStart;
    var progress = Math.min(elapsed / BURN_DURATION_MS, 1);

    var candleH = CANDLE_FULL - progress * (CANDLE_FULL * 0.35);
    var wickH = WICK_FULL - progress * WICK_FULL;

    setCandleHeight(candleH);
    wick.style.height = Math.max(wickH, 2) + "px";

    rafId = requestAnimationFrame(tickBurn);
  }

  function handleTap(e) {
    e.preventDefault();
    var now = Date.now();

    if (now - lastTap < DOUBLE_TAP_MS) {
      lastTap = 0;
      if (state === "unlit") {
        lightCandle();
      } else if (state === "burning") {
        blowOut(false);
      }
      return;
    }

    lastTap = now;
  }

  candleZone.addEventListener("touchend", handleTap, { passive: false });
  candleZone.addEventListener("click", function (e) {
    if ("ontouchstart" in window) return;
    handleTap(e);
  });

  setCandleHeight(CANDLE_FULL);
  wick.style.height = WICK_FULL + "px";
  setHint("双击蜡烛点火");
})();
