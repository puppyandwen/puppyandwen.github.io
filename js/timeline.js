const entries = document.querySelectorAll(".entry");

let currentIndex = 0;

function updateCarousel(){

    entries.forEach((entry, i)=>{

        const offset = i - currentIndex;

        const abs = Math.abs(offset);

        /* 横向间距 */

        const spacing = 420 * Math.exp(-abs*0.15);

        const x = offset * spacing;

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
    }

    touchDelta = 0;

});