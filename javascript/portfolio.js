(function(){
  const grid=document.querySelector('#portfolio .portfolio-grid');
  if(!grid) return;
  const cards=[...grid.querySelectorAll('.project-card')];
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.style.transform='translateY(0)';e.target.style.opacity='1';obs.unobserve(e.target);}})},{threshold:.15,rootMargin:'0px 0px -10% 0px'});
  cards.forEach(c=>{c.style.transform='translateY(12px)';c.style.opacity='.001';c.style.transition='transform .4s ease, opacity .4s ease';obs.observe(c)});
})();