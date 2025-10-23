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
    
    if (isNight) {
        skySection.classList.add('night');
        contentSection.classList.add('night');
    } else {
        skySection.classList.remove('night');
        contentSection.classList.remove('night');
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

// Lazy load section content
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
const lazyObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(async (entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const src = el.getAttribute('data-src');
        const section = el.closest('section');
        ensureSectionAssets(section ? section.id : null);
        if (src && !el.dataset.loaded) {
            try {
                const res = await fetch(src, { cache: 'no-store' });
                const html = await res.text();
                el.innerHTML = html;
                el.dataset.loaded = 'true';
            } catch (err) {
                el.innerHTML = '<div style="color:#fff;opacity:.8">Failed to load content.</div>';
            }
        }
        obs.unobserve(el);
    });
}, { rootMargin: '0px 0px -20% 0px', threshold: 0.15 });

lazyContainers.forEach(c => lazyObserver.observe(c));

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

const fishTypes = ['clownfish', 'blue-tang', 'angelfish', 'tropical', 'yellow-tang'];
const fishContainer = document.getElementById('fishContainer');
const activeFish = [];
const maxFish = 12;

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

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
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