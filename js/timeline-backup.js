const track = document.querySelector(".timeline-track");
const entries = document.querySelectorAll(".entry");
let snapping = false

function updateFocus(){

    if(snapping) return;

    const center = window.innerWidth / 2;

    entries.forEach(entry => {

        const rect = entry.getBoundingClientRect();
        const entryCenter = rect.left + rect.width/2;


        const distance = Math.abs(center - entryCenter);

        const maxDistance = window.innerWidth/2;

        const ratio = Math.min(distance / maxDistance, 1);

        const scale = 1.2 - ratio * 0.4;

        const offset = ratio * 120;

        const direction = entryCenter < center ? 1 : -1;

        const lift = (1 - ratio) * 40;

        entry.style.transform =
        `translateX(${direction * offset}px) translateY(${-lift}px) scale(${scale})`;

        entry.style.boxShadow =
        `0 ${10 + lift}px ${20 + lift}px rgba(0,0,0,0.15)`;

        entry.style.zIndex = 1000 - Math.floor(distance);

    });

}

track.addEventListener("scroll", updateFocus);

updateFocus();



/* 滚轮转横向滚动 */

track.addEventListener("wheel", (e) => {

    e.preventDefault();
    track.scrollLeft += e.deltaY;

}, { passive:false });



/* 自动吸附居中 */

let scrollTimeout;

track.addEventListener("scroll", () => {

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

        snapToCenter();

    }, 220);

});



function snapToCenter(){

    snapping = true;

    const center = window.innerWidth/2;

    let closest;
    let minDistance = Infinity;

    entries.forEach(entry => {

        const rect = entry.getBoundingClientRect();
        const entryCenter = rect.left + rect.width/2;

        const distance = Math.abs(center - entryCenter);

        if(distance < minDistance){
            minDistance = distance;
            closest = entry;
        }

    });

    // if(!closest) return;

    if(!closest){
        snapping = false;
        return;
    }

    const rect = closest.getBoundingClientRect();

    const offset = rect.left + rect.width/2 - center;

    track.scrollBy({
        left: offset,
        behavior: "smooth"
    });

    setTimeout(()=>{
        snapping = false;
        updateFocus();
    },400);

}