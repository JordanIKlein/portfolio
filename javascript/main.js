(function attachProfileToHook() {
    const hookEl = document.querySelector('.hook');
    const pic = document.getElementById('profilePic');
    if (hookEl && pic) {
        pic.classList.add('on-hook');
        hookEl.appendChild(pic);
    }
})();

function updateDayNight() {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    
    const skySection = document.getElementById('skySection');
    const contentSection = document.getElementById('contentSection');
    const oceanGradient = document.getElementById('oceanGradient');
    
    if (isNight) {
        skySection.classList.add('night');
        contentSection.classList.add('night');
        if(oceanGradient) oceanGradient.classList.add('night');
    } else {
        skySection.classList.remove('night');
        contentSection.classList.remove('night');
        if(oceanGradient) oceanGradient.classList.remove('night');
    }
}

// Smooth-scroll for in-page anchors
document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

// Lazy load section content (with retry and fallbacks)
const lazyContainers = Array.from(document.querySelectorAll('.lazy[data-src]'));
const loadedAssets = new Set();
function ensureSectionAssets(sectionId){
    if(!sectionId) return;
    const cssPath = `/css/${sectionId}.css`;
    const jsPath = `/javascript/${sectionId}.js`;
    if(!loadedAssets.has(cssPath)){
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
        loadedAssets.add(cssPath);
    }
    if(!loadedAssets.has(jsPath)){
        const script = document.createElement('script');
        script.src = jsPath;
        document.body.appendChild(script);
        loadedAssets.add(jsPath);
    }
}
async function loadLazyContainer(el, retries = 1){
    if(el.dataset.loaded || el.dataset.loading) return;
    const src = el.getAttribute('data-src');
    const section = el.closest('section');
    ensureSectionAssets(section ? section.id : null);
    if(!src) return;
    try{
        el.dataset.loading = 'true';
        const res = await fetch(src, { cache: 'no-store' });
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        el.innerHTML = html;
        el.dataset.loaded = 'true';
    }catch(err){
        delete el.dataset.loading;
        if(retries > 0){
            setTimeout(()=>loadLazyContainer(el, retries - 1), 800);
        } else {
            el.innerHTML = '<div style="color:#fff;opacity:.8">Failed to load content. Retrying soon…</div>';
        }
    }
}

const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        loadLazyContainer(el, 2);
        // keep observing until actually loaded, then we can unobserve
        if(el.dataset.loaded){
            lazyObserver.unobserve(el);
        }
    });
}, { rootMargin: '0px 0px 30% 0px', threshold: 0.01 });

lazyContainers.forEach(c => lazyObserver.observe(c));

// Fallbacks: try loading anything already near viewport after window load and on idle
window.addEventListener('load', () => {
    lazyContainers.forEach(el => {
        const r = el.getBoundingClientRect();
        if(r.top < window.innerHeight + 200){
            loadLazyContainer(el, 2);
        }
    });
    if('requestIdleCallback' in window){
        requestIdleCallback(()=> lazyContainers.forEach(el => loadLazyContainer(el, 1)), { timeout: 3000 });
    } else {
        setTimeout(()=> lazyContainers.forEach(el => loadLazyContainer(el, 1)), 3000);
    }
});

// Global bubbles across all sections
function initBubbles(){
    const layer = document.getElementById('bubbleLayer');
    if(!layer) return;
    const BUBBLES = 14;
    for(let i=0;i<BUBBLES;i++){
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = Math.round(12 + Math.random()*24);
        b.style.width = size+'px';
        b.style.height = size+'px';
        b.style.left = Math.round(Math.random()*100)+'%';
        b.style.animationDelay = (Math.random()*3).toFixed(2)+'s';
        b.style.animationDuration = (5 + Math.random()*5).toFixed(2)+'s';
        layer.appendChild(b);
    }
}
initBubbles();

// Prevent bubbles from rendering above the water line by clipping the bubble layer
(function initBubbleClipping(){
    const bubbleLayer = document.getElementById('bubbleLayer');
    if(!bubbleLayer) return;
    let lastY = -1; let rafId = null;
    function computeWaterlineY(){
        const ws = document.querySelector('.water-surface');
        if(!ws) return 0;
        const r = ws.getBoundingClientRect();
        // If the water-surface has scrolled above the viewport, allow bubbles from the very top
        if(r.bottom <= 0) return 0;
        return Math.max(0, Math.floor(r.bottom));
    }
    function applyClip(){
        const y = computeWaterlineY();
        if(y !== lastY){
            lastY = y;
            const val = `inset(${y}px 0 0 0)`;
            bubbleLayer.style.clipPath = val;
            bubbleLayer.style.webkitClipPath = val;
        }
        rafId = null;
    }
    function schedule(){ if(rafId==null) rafId = requestAnimationFrame(applyClip); }
    window.addEventListener('scroll', schedule, { passive:true });
    window.addEventListener('resize', schedule);
    schedule();
})();

// Clip the global ocean gradient to stay below the waterline
(function initOceanClipping(){
    const oceanLayer = document.getElementById('oceanGradient');
    if(!oceanLayer) return;
    let lastY = -1; let rafId = null;
    function computeWaterlineY(){
        const ws = document.querySelector('.water-surface');
        if(!ws) return 0;
        const r = ws.getBoundingClientRect();
        if(r.bottom <= 0) return 0;
        return Math.max(0, Math.floor(r.bottom));
    }
    function applyClip(){
        const y = computeWaterlineY();
        if(y !== lastY){
            lastY = y;
            const val = `inset(${y}px 0 0 0)`;
            oceanLayer.style.clipPath = val;
            oceanLayer.style.webkitClipPath = val;
        }
        rafId = null;
    }
    function schedule(){ if(rafId==null) rafId = requestAnimationFrame(applyClip); }
    window.addEventListener('scroll', schedule, { passive:true });
    window.addEventListener('resize', schedule);
    schedule();
})();

const fishTypes = ['clownfish', 'blue-tang', 'angelfish', 'tropical', 'yellow-tang'];
const fishContainer = document.getElementById('fishContainer');
const activeFish = [];
const maxFish = 12;

// Prevent fish from appearing above the water line by clipping the fish layer
(function initFishClipping(){
    if(!fishContainer) return;
    let lastY = -1; let rafId = null; 
    function computeWaterlineY(){
        const ws = document.querySelector('.water-surface');
        if(!ws) return 0;
        const r = ws.getBoundingClientRect();
        // If the water-surface has scrolled above the viewport, allow fish from the very top
        if(r.bottom <= 0) return 0;
        // Otherwise clip above the current visible water line
        return Math.max(0, Math.floor(r.bottom));
    }
    function applyClip(){
        const y = computeWaterlineY();
        if(y !== lastY){
            lastY = y;
            const val = `inset(${y}px 0 0 0)`;
            fishContainer.style.clipPath = val;
            fishContainer.style.webkitClipPath = val;
        }
        rafId = null;
    }
    function schedule(){ if(rafId==null) rafId = requestAnimationFrame(applyClip); }
    window.addEventListener('scroll', schedule, { passive:true });
    window.addEventListener('resize', schedule);
    schedule();
})();

class Fish {
    constructor() {
        this.element = document.createElement('div');
        this.type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        this.element.className = `fish ${this.type}`;
        
        const body = document.createElement('div');
        body.className = 'fish-body';
        const tail = document.createElement('div');
        tail.className = 'fish-tail';
        const eye = document.createElement('div');
        eye.className = 'fish-eye';
        
        body.appendChild(tail);
        body.appendChild(eye);
        
        if (this.type === 'yellow-tang') {
            const dorsalFin = document.createElement('div');
            dorsalFin.className = 'dorsal-fin';
            body.appendChild(dorsalFin);
        }
        
        this.element.appendChild(body);
        
        this.x = Math.random() < 0.5 ? -100 : window.innerWidth + 100;
        this.y = Math.random() * 400 + 100;
        this.speed = Math.random() * 0.6 + 0.3;
        this.direction = this.x < 0 ? 1 : -1;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        if (this.direction === 1) {
            this.element.style.transform = 'scaleX(-1)';
        } else {
            this.element.style.transform = 'scaleX(1)';
        }
        
        this.avoidX = 0;
        this.avoidY = 0;
        
        fishContainer.appendChild(this.element);
    }
    
    update(mouseX, mouseY) {
        const rect = this.element.getBoundingClientRect();
        
        const fishCenterX = rect.left + rect.width / 2;
        const fishCenterY = rect.top + rect.height / 2;
        
        if (mouseActive) {
            const deltaX = mouseX - fishCenterX;
            const deltaY = mouseY - fishCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const avoidRadius = 150;
            if (distance < avoidRadius && distance > 0) {
                const force = (avoidRadius - distance) / avoidRadius;
                const angle = Math.atan2(deltaY, deltaX);
                this.avoidX = -Math.cos(angle) * 2.5 * force;
                this.avoidY = -Math.sin(angle) * 2.5 * force;
            } else {
                this.avoidX *= 0.92;
                this.avoidY *= 0.92;
            }
        } else {
            // If no mouse present, relax avoidance to zero smoothly
            this.avoidX *= 0.9;
            this.avoidY *= 0.9;
        }
        
        const swimX = this.speed * this.direction;
        
        this.x += swimX + this.avoidX;
        this.y += this.avoidY;
        
        if (this.y < 50) {
            this.y = 50;
            this.avoidY = Math.abs(this.avoidY) * 0.5;
        } else if (this.y > 450) {
            this.y = 450;
            this.avoidY = -Math.abs(this.avoidY) * 0.5;
        }
        
        const totalVelX = swimX + this.avoidX;
        if (Math.abs(totalVelX) > 0.1) {
            if (totalVelX > 0) {
                this.element.style.transform = 'scaleX(-1)';
            } else {
                this.element.style.transform = 'scaleX(1)';
            }
        }
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        if ((this.direction === 1 && this.x > window.innerWidth + 100) ||
            (this.direction === -1 && this.x < -100)) {
            return false;
        }
        return true;
    }
    
    remove() {
        this.element.remove();
    }
}

let mouseX = -1000;
let mouseY = -1000;
let mouseActive = false;

document.addEventListener('mousemove', (e) => {
    mouseActive = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function deactivateMouseTracking(){
    mouseActive = false;
    mouseX = -10000;
    mouseY = -10000;
}
document.addEventListener('mouseleave', deactivateMouseTracking);
window.addEventListener('blur', deactivateMouseTracking);
document.addEventListener('visibilitychange', () => {
    if(document.visibilityState !== 'visible') deactivateMouseTracking();
});

function spawnFish() {
    if (activeFish.length < maxFish && Math.random() < 0.02) {
        activeFish.push(new Fish());
    }
}

function updateFish() {
    for (let i = activeFish.length - 1; i >= 0; i--) {
        if (!activeFish[i].update(mouseX, mouseY)) {
            activeFish[i].remove();
            activeFish.splice(i, 1);
        }
    }
}

function animate() {
    spawnFish();
    updateFish();
    requestAnimationFrame(animate);
}

updateDayNight();
setInterval(updateDayNight, 60000);

for (let i = 0; i < 6; i++) {
    setTimeout(() => activeFish.push(new Fish()), i * 500);
}

animate();

// Populate global ocean floor with plants and shrimp
(function initOceanFloorDecor(){
    const floor = document.getElementById('oceanFloor');
    if(!floor) return;
    const vw = () => Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    const plantWraps = [];
    const plantCenters = [];
    const plantTargetTilt = [];
    const plantTilt = [];
    let tiltRAF = null;

    function addPlant(type, left, height, sway){
        const wrap = document.createElement('div');
        wrap.className = 'plant-wrap';
        wrap.style.left = left + '%';
        const p = document.createElement('div');
        p.className = `plant ${type}`;
        p.style.setProperty('--h', height + 'px');
        p.style.setProperty('--sway', sway + 's');
        wrap.appendChild(p);
        floor.appendChild(wrap);
        plantWraps.push(wrap);
        plantTargetTilt.push(0);
        plantTilt.push(0);
        return wrap;
    }


    const plantTypes = ['seaweed','kelp','seagrass','coral'];
    const plantCount = vw() < 640 ? 12 : 18;
    const usedSlots = new Set();
    for(let i=0;i<plantCount;i++){
        const type = plantTypes[Math.floor(Math.random()*plantTypes.length)];
        let slot = Math.floor(Math.random()*50);
        let guard = 0;
        while(usedSlots.has(slot) && guard++ < 60){ slot = Math.floor(Math.random()*50); }
        usedSlots.add(slot);
        const left = slot*2 + (Math.random()*1.2-0.6);
        const height = 70 + Math.random()*120;
        const sway = 7 + Math.random()*6;
        addPlant(type, left, height, sway);
    }
    // compute centers once laid out and on resize
    function computeCenters(){
        plantCenters.length = 0;
        for(const w of plantWraps){
            const r = w.getBoundingClientRect();
            plantCenters.push(r.left + r.width/2);
        }
    }
    computeCenters();
    window.addEventListener('resize', computeCenters);

    // mouse-influenced swaying on top of base animation
    function schedulePlantTilt(){
        if(tiltRAF!=null) return;
        tiltRAF = requestAnimationFrame(function tick(){
            tiltRAF = null;
            const maxTilt = 8; // degrees
            const radius = Math.min(260, Math.max(180, window.innerWidth*0.18));
            let needsMore = false;
            for(let i=0;i<plantWraps.length;i++){
                const dx = mouseX - plantCenters[i];
                let t = 0;
                if(mouseActive){
                    const influence = Math.max(0, 1 - Math.abs(dx)/radius);
                    t = Math.max(-1, Math.min(1, (plantCenters[i] - mouseX)/radius)) * maxTilt * influence;
                }
                plantTargetTilt[i] = t;
                const next = plantTilt[i] + (plantTargetTilt[i] - plantTilt[i]) * 0.12;
                if(Math.abs(next - plantTilt[i]) > 0.02) needsMore = true;
                plantTilt[i] = next;
                plantWraps[i].style.transform = `rotate(${plantTilt[i].toFixed(2)}deg)`;
            }
            if(needsMore) {
                tiltRAF = requestAnimationFrame(tick);
            }
        });
    }

    document.addEventListener('mousemove', schedulePlantTilt);
    document.addEventListener('mouseleave', schedulePlantTilt);
})();