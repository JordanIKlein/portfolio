(function(){
  const items=[...document.querySelectorAll('#skills .skill-item')];
  if(items.length){
    const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.2});
    items.forEach(el=>{el.style.opacity='.001';el.style.transform='translateY(8px)';el.style.transition='opacity .35s ease, transform .35s ease';io.observe(el)});
    const style=document.createElement('style');
    style.textContent='#skills .skill-item.in{opacity:1;transform:translateY(0)}';
    document.head.appendChild(style);
  }

  // Remove local seafloor decorations (plants/shrimp) in favor of global ocean floor
  // Previously generated `.plant` and `.shrimp` elements here; now omitted by request.
})();