fetch('/api/tabs').then(r=>r.json()).then(t=>{
  document.getElementById('tabs').innerHTML = JSON.stringify(t);
});