const entries = document.querySelectorAll(".entry");
console.log(entries[0].offsetWidth);



let currentIndex = 0;

function updateCarousel(){

    entries.forEach((entry, i)=>{

        const offset = i - currentIndex;

        const abs = Math.abs(offset);

        /* 横向间距 */

        const cardWidth = entry.offsetWidth;

        const spacing = cardWidth * 1.1 * Math.exp(-abs*0.15);
        const x = offset * spacing;
        // const x = offset * spacing;

        /* scale */

        const scale = 1 - abs * 0.15;

        /* 轻微抬起 */

        const lift = Math.max(0, 40 - abs*20);

        /* z-index */

        const z = 100 - abs;

        /* 透明度 */

        const opacity = 1 - abs*0.2;

        entry.style.transform =
        `translate(-50%, -50%) translateX(${x}px) translateY(${-lift}px) scale(${scale})`;

        entry.style.zIndex = z;

        entry.style.opacity = opacity;

    });

}

updateCarousel();

let scrollAccumulator = 0;
const scrollThreshold = 120; // 数值越大越慢

window.addEventListener("wheel", (e)=>{

    e.preventDefault();

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.deltaY;

    scrollAccumulator += delta;

    if(Math.abs(scrollAccumulator) > scrollThreshold){

        if(scrollAccumulator > 0){
            currentIndex++;
        }else{
            currentIndex--;
        }

        currentIndex = Math.max(0, Math.min(entries.length-1,currentIndex));

        updateCarousel();
        updateTimeline();

        scrollAccumulator = 0;
    }

},{ passive:false });

let touchStartX = 0;
let touchDelta = 0;

window.addEventListener("touchstart",(e)=>{

    touchStartX = e.touches[0].clientX;

});

window.addEventListener("touchmove",(e)=>{

    const x = e.touches[0].clientX;

    touchDelta = touchStartX - x;

});

window.addEventListener("touchend",()=>{

    if(Math.abs(touchDelta) > 50){

        if(touchDelta > 0){
            currentIndex++;
        }else{
            currentIndex--;
        }

        currentIndex = Math.max(0, Math.min(entries.length-1,currentIndex));

        updateCarousel();
        updateTimeline();
    }

    touchDelta = 0;

});

//entry点击居中
entries.forEach((entry, i)=>{

    entry.addEventListener("click", ()=>{

        currentIndex = i;

        updateCarousel();
        updateTimeline();

    });

});

// timeline刻度
const timeline = document.querySelector(".timeline-ticks");

entries.forEach((entry,i)=>{

    const tick = document.createElement("div");

    tick.className = "tick";

    tick.addEventListener("click", ()=>{

        currentIndex = i;

        updateCarousel();
        updateTimeline();

    });

    timeline.appendChild(tick);

});


//动态刻度非均匀分布
function updateTimeline(){

    const ticks = document.querySelectorAll(".tick");

    const total = entries.length;

    

    ticks.forEach((tick,i)=>{

        let pos;

        if(i <= currentIndex){

            const ratio = i / currentIndex;

            pos = ratio * 50;

        }else{

            const ratio = (i-currentIndex)/(total-currentIndex-1);

            pos = 50 + ratio * 50;

        }

        tick.style.left = pos + "%";
        tick.classList.toggle("active", i===currentIndex);

    });

}

updateTimeline();


// timeline拖动支持

let dragging = false;

timeline.addEventListener("mousedown", ()=>{

    dragging = true;

});

window.addEventListener("mouseup", ()=>{

    dragging = false;

});

window.addEventListener("mousemove",(e)=>{

    if(!dragging) return;

    const rect = timeline.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const ratio = x / rect.width;

    const index = Math.round(ratio*(entries.length-1));

    currentIndex = index;

    updateCarousel();
    updateTimeline();

});