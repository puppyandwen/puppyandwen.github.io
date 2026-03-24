const batches = [
  {
    id: "osaka-2024",
    lat: 37.6937,
    lon: 135.5023,
    offsetX: 120,
    offsetY: -80,
    scale: 1.4,
    time: "2024.04.28 - 05.05",
    photos: [
      { src: "../images/year2/photo51.jpg", caption: "大阪城" },
      { src: "../images/year2/photo52.jpg", caption: "道顿堀夜景" },
      { src: "../images/year2/photo53.jpg", caption: "街头" },
      { src: "../images/year2/photo53.jpg", caption: "街头" },
      { src: "../images/year2/photo53.jpg", caption: "街头" },
      { src: "../images/year2/photo53.jpg", caption: "街头" },
      { src: "../images/year2/photo53.jpg", caption: "街头" },
      { src: "../images/year2/photo53.jpg", caption: "街头" }
    ]
  }
];



// 经纬度-坐标
// function project(lat, lon) {
//   const map = document.getElementById("map");

//   const width = map.offsetWidth;
//   const height = map.offsetHeight;

//   const x = (lon + 180) / 360 * width;
//   const y = (90 - lat) / 180 * height;

//   return { x, y };
// }

function project(lat, lon) {
  const map = document.getElementById("map");
  const rect = map.getBoundingClientRect();

  const x = (lon + 180) / 720 * rect.width;
  const y = (90 - lat) / 180 * rect.height;

  return {
    x: rect.left + x,
    y: rect.top + y
  };
}

// 经度中心
const CENTER_LON = 145;
function updateMapPosition() {
  const map = document.getElementById("map");
  const rect = map.getBoundingClientRect();

  const mapWidth = rect.width;

  // 经度 → x
  const centerX = (CENTER_LON +180 ) / 720 * mapWidth;

  // 屏幕中心
  const screenCenter = window.innerWidth / 2;

  // 偏移
  const offset = screenCenter - centerX;

  map.style.transform = `translateX(${offset}px)`;
}
updateMapPosition()
window.addEventListener("resize", updateMapPosition);
window.addEventListener("load", updateMapPosition);



//渲染batch
function batch_render_backup(){
  const container = document.getElementById("batches");

  batches.forEach(batch => {
    const { x, y } = project(batch.lat, batch.lon);

    const el = document.createElement("div");
    el.className = "batch";
    el.style.left = x + "px";
    el.style.top = y + "px";

    el.innerHTML = `
      <div class="bubble">
        <div class="thumb-row">
          ${batch.photos.slice(0,5).map(p => `<img src="${p.src}">`).join("")}
        </div>
        <div class="time-label">${batch.time}</div>
      </div>
    `;

    el.onclick = () => openViewer(batch);

    container.appendChild(el);
  });

}

function batch_render(){
  const container = document.getElementById("batches");
  container.innerHTML = "";

  batches.forEach(batch => {

    const { x, y } = project(batch.lat, batch.lon);

    const el = document.createElement("div");
    el.className = "batch";

    // ✅ pin位置（真实地理位置）
    el.style.left = x + "px";
    el.style.top = y + "px";

    el.innerHTML = `
      <div class="pin"></div>

      <div class="line"></div>

      <div class="bubble-wrap"
          style="transform: translate(${batch.offsetX}px, ${batch.offsetY}px) scale(${batch.scale || 1.4}">
        <div class="bubble">
          <div class="thumb-row">
            ${batch.photos.slice(0,5).map(p => `<img src="${p.src}">`).join("")}
          </div>
          <div class="time-label">${batch.time}</div>
        </div>
      </div>
    `;




    

    container.appendChild(el);

    function updateLine(el, batch){
      const line = el.querySelector(".line");
    
      const dx = batch.offsetX;
      const dy = batch.offsetY;
    
      const length = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
      line.style.height = length + "px";
      line.style.transform = `rotate(${angle-90}deg)`;
    }

    updateLine(el, batch)



    const wrap = el.querySelector(".bubble-wrap");


    let dragging = false;
    let startX, startY;
    let originX = batch.offsetX;
    let originY = batch.offsetY;
    let moved = false;

    wrap.addEventListener("pointerdown", (e) => {
      e.stopPropagation();

      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;

      wrap.setPointerCapture(e.pointerId);
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;

      moved = true;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      batch.offsetX = originX + dx;
      batch.offsetY = originY + dy;

      wrap.style.transform =
        `translate(${batch.offsetX}px, ${batch.offsetY}px) scale(${batch.scale || 1.4})`;

      updateLine(el, batch); // 👈 让线跟着动
    });

    window.addEventListener("pointerup", (e) => {
      if (dragging) {
        dragging = false;

        // 更新初始值（下一次拖拽用）
        originX = batch.offsetX;
        originY = batch.offsetY;

        wrap.releasePointerCapture(e.pointerId);
      }
    });


    // wrap.addEventListener("touchstart", (e) => {
    //   e.stopPropagation();

    //   dragging = true;
    //   moved = false;
    //   startX = e.clientX;
    //   startY = e.clientY;
    // });

    // window.addEventListener("touchmove", (e) => {
    //   if (!dragging) return;

    //   moved = true;

    //   const dx = e.clientX - startX;
    //   const dy = e.clientY - startY;

    //   batch.offsetX = originX + dx;
    //   batch.offsetY = originY + dy;

    //   wrap.style.transform =
    //     `translate(${batch.offsetX}px, ${batch.offsetY}px) scale(${batch.scale || 1.4})`;

    //   updateLine(el, batch); // 👈 让线跟着动
    // });

    // window.addEventListener("touchend", () => {
    //   if (dragging) {
    //     dragging = false;

    //     // 更新初始值（下一次拖拽用）
    //     originX = batch.offsetX;
    //     originY = batch.offsetY;
    //   }
    // });


    el.onclick = () => {
      if (!moved) openViewer(batch);
    };
    // el.onclick = () => openViewer(batch);
  });
}



//Viewer 进入batch
let currentIndex = 0
const viewer = document.getElementById("viewer");
const track = document.querySelector(".viewer-track");

function openViewer(batch) {
  viewer.classList.remove("hidden");
  track.innerHTML = "";

  currentIndex = 0;

  batch.photos.forEach(p => {
    const item = document.createElement("div");
    item.className = "viewer-item";

    item.innerHTML = `
      <img src="${p.src}">
      <div class="caption">${p.caption}</div>
    `;

    track.appendChild(item);
  });
  updateViewer();
}

function updateViewer(){
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

viewer.addEventListener("click", (e) => {
  if (e.target === viewer) {
    viewer.classList.add("hidden");
    return;
  }
  if (e.target.classList.contains("left")) {
    e.stopPropagation();
    prev();
    return;
  }
  if (e.target.classList.contains("right")) {
    e.stopPropagation();
    next();
    return;
  }

  if (e.target === viewer) {
    viewer.classList.add("hidden");
  }

  // 👉 左右点击区域判断
  const rect = viewer.getBoundingClientRect();
  const x = e.clientX - rect.left;

  if (x > rect.width / 2) {
    next();
  } else {
    prev();
  }


});

window.addEventListener("keydown", (e) => {
  if (viewer.classList.contains("hidden")) return;

  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "Escape") viewer.classList.add("hidden");
});

function next() {
  const total = track.children.length;
  if (currentIndex < total - 1) {
    currentIndex++;
    updateViewer();
  }
}

function prev() {
  if (currentIndex > 0) {
    currentIndex--;
    updateViewer();
  }
}

// viewer.onclick = (e) => {
//   if (e.target === viewer) {
//     viewer.classList.add("hidden");
//   }
// };

//晨昏线
const canvas = document.getElementById("terminator");
const ctx = canvas.getContext("2d");

function drawTerminator() {
  const canvas = document.getElementById("terminator");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const map = document.getElementById("map");
  const mapRect = map.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  //计算地图在canvas坐标系中的偏移量
  const offsetX = mapRect.left - canvasRect.left;
  const offsetY = mapRect.top - canvasRect.top;

  const now = new Date();
  //儒略日计算
  const day = Math.floor(
    (now - new Date(now.getFullYear(),0,0)) / 86400000
  );

  const declDeg = 23.44 * Math.sin((2*Math.PI/365)*(day-81));
  const declRad = declDeg * Math.PI / 180;

  const hours = now.getUTCHours() + now.getUTCMinutes()/60;

  let subsolarLon = - (hours - 12) * 15;
  subsolarLon = ((subsolarLon % 360) + 360) % 360;
  if (subsolarLon>180) subsolarLon -= 360;

  ctx.fillStyle = "rgba(0,0,0,0.25)";

  ctx.beginPath();

  let first = true;

  for (let x=0; x<canvas.width; x++){

    let lon = (x - mapRect.left) / mapRect.width * 720 - 180
    let hourAngleDeg = lon - subsolarLon;
    hourAngleDeg = ((hourAngleDeg % 360) + 360) % 360;
    if (hourAngleDeg > 180) hourAngleDeg -= 360;
    const hourAngleRad = hourAngleDeg * Math.PI / 180;

    const cosH = Math.cos(hourAngleRad);
    const tanDelta = Math.tan(declRad);

    let latRad;
    // 处理 δ=0 且 cosH=0 的罕见情况 (整条经线为晨昏线)
    if (Math.abs(declRad) < 1e-8 && Math.abs(cosH) < 1e-8) {
      latRad = 0; // 取赤道作为代表点
    } else {
      // 通用公式: φ = atan2(-cosH, tanδ)
      latRad = Math.atan2(-cosH, tanDelta);
    }

    let latDeg = latRad * 180 / Math.PI;
    // 确保纬度范围在 [-90, 90] 内
    latDeg = Math.min(90, Math.max(-90, latDeg));

    y = (90 - latDeg) / 180 * mapRect.height + mapRect.top
    if(first){
      ctx.moveTo(x,y);
      first = false;
    }else{
      ctx.lineTo(x,y);
    }
  }





  

  // for(let y=0;y<=canvas.height;y++){

  //   const lat = 90 - (y / canvas.height) * 180;

  //   const latRad = lat * Math.PI/180;
  //   const declRad = decl * Math.PI/180;

  //   const lon = subsolarLon +
  //     Math.atan(-Math.cos(latRad)/Math.tan(declRad)) * 180/Math.PI;

  //   const x = rect.left + ((lon + 180)/720)*rect.width;
  //   console.log(lat, lon)

  //   if(first){
  //     ctx.moveTo(x,y);
  //     first = false;
  //   }else{
  //     ctx.lineTo(x,y);
  //   }
  // }

  // ✅ 关键：只封闭“夜侧”
  if (day >= 81 && day <= 266){
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
  }else{
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, 0);
  }
  

  ctx.closePath();
  ctx.fill();
}



function debugPoint(lat, lon) {
  const { x, y } = project(lat, lon);

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = x + "px";
  dot.style.top = y + "px";
  dot.style.width = "6px";
  dot.style.height = "6px";
  dot.style.background = "red";
  dot.style.borderRadius = "50%";

  document.body.appendChild(dot);
}

// debugPoint(36.69, 135.50);
batch_render()
setInterval(drawTerminator, 60000);
drawTerminator();