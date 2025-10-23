(function(){
  const items=[...document.querySelectorAll('#skills .skill-item')];
  if(items.length){
    const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.2});
    items.forEach(el=>{el.style.opacity='.001';el.style.transform='translateY(8px)';el.style.transition='opacity .35s ease, transform .35s ease';io.observe(el)});
    const style=document.createElement('style');
    style.textContent='#skills .skill-item.in{opacity:1;transform:translateY(0)}';
    document.head.appendChild(style);
  }

  const floor=document.querySelector('#skills .ocean-floor');
  if(floor){
    const decor=document.createElement('div');
    decor.className='seafloor-decor';
    floor.appendChild(decor);
    const width=window.innerWidth;
    for(let i=0;i<10;i++){
      const p=document.createElement('div');
      p.className='plant';
      p.style.left=(5+Math.random()*90)+'%';
      p.style.height=(60+Math.random()*60)+'px';
      p.style.animationDelay=(Math.random()*2).toFixed(2)+'s';
      decor.appendChild(p);
    }
    for(let s=0;s<4;s++){
      const shr=document.createElement('div');
      shr.className='shrimp';
      shr.style.left=(10+Math.random()*80)+'%';
      decor.appendChild(shr);
    }
  }
})();