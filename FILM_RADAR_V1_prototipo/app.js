const data={
clients:[
{id:1,score:96,type:"Cliente",name:"Clínica Dental Sonrisa",place:"Zaragoza",reason:"RRSS activa, mucho contenido visual y poca presencia de vídeo profesional.",service:"Reels + vídeo corporativo",contact:"hola@clinicasonrisa.es"},
{id:2,score:92,type:"Cliente",name:"Restaurante La Esquina",place:"Zaragoza",reason:"Nueva carta y actividad alta en Instagram; oportunidad para contenido recurrente.",service:"12 reels/mes + vídeo de carta",contact:"info@laesquina.example"},
{id:3,score:87,type:"Cliente",name:"Inmobiliaria Norte",place:"Utebo",reason:"Alto volumen de propiedades y poco vídeo detectado.",service:"Vídeo inmobiliario + reels",contact:"comercial@inmobiliarianorte.example"},
{id:4,score:81,type:"Cliente",name:"Hotel Río",place:"Zaragoza",reason:"Buen posicionamiento web y campaña de temporada próxima.",service:"Vídeo promocional",contact:"marketing@hotelrio.example"}],
productions:[
{id:5,score:97,type:"Rodaje",name:"Serie X — Producción Aragón",place:"Zaragoza · 24 km",reason:"Rodaje previsto en octubre; perfil compatible con cámara.",service:"Operador de cámara",contact:"produccion@seriex.example"},
{id:6,score:89,type:"Rodaje",name:"Cortometraje 'La Última Toma'",place:"Teruel · 165 km",reason:"Producción independiente con necesidades de cámara e iluminación.",service:"Cámara / apoyo de rodaje",contact:"rodaje@ultima.example"}],
music:[
{id:7,score:94,type:"Música",name:"Artista X — Nuevo single",place:"Zaragoza",reason:"Lanzamiento anunciado en octubre, audiencia creciente y sin videoclip reciente detectado.",service:"Videoclip + 5 verticales",contact:"management@artistax.example"},
{id:8,score:86,type:"Música",name:"Banda Y — Gira 2026",place:"Huesca",reason:"Gira anunciada y fuerte actividad social; posible cobertura y piezas promocionales.",service:"Live session + contenido social",contact:"booking@banday.example"}],
jobs:[
{id:9,score:95,type:"Oferta",name:"Operador/a de cámara freelance",place:"Zaragoza",reason:"Experiencia y localización encajan muy bien con tu perfil.",service:"Cámara",contact:"rrhh@productoraz.example"},
{id:10,score:83,type:"Oferta",name:"Editor freelance — proyecto documental",place:"Madrid · remoto parcial",reason:"Proyecto compatible si aceptas desplazamiento y edición.",service:"Edición / postproducción",contact:"jobs@docu.example"}]
};

const state={crm:JSON.parse(localStorage.getItem("filmRadarCRM")||"{}"),profile:JSON.parse(localStorage.getItem("filmRadarProfile")||"{}")};
const all=()=>Object.values(data).flat();
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function card(o){
 return `<div class="opportunity"><div class="score ${o.score>=90?'hot':''}">${o.score}</div><div class="op-main"><b>${esc(o.name)}</b><small>${esc(o.place)} · ${esc(o.type)}</small><span class="tag">${esc(o.service)}</span></div><button class="btn" onclick="openOpportunity(${o.id})">Ver</button></div>`
}
function renderDashboard(){
 const top=all().sort((a,b)=>b.score-a.score).slice(0,5);
 const high=all().filter(x=>x.score>=85).length;
 const crmCount=Object.keys(state.crm).length;
 document.querySelector("#view-dashboard").innerHTML=`<div class="hero"><div><h2>Tu radar de oportunidades</h2><p>Encuentra, prioriza y prepara contactos para conseguir más trabajos audiovisuales.</p></div><button onclick="refresh()">🔎 Buscar oportunidades</button></div>
 <div class="stats"><div class="stat"><div class="label">Oportunidades detectadas</div><div class="num">${all().length}</div></div><div class="stat"><div class="label">Alta prioridad</div><div class="num">${high}</div></div><div class="stat"><div class="label">Contactos guardados</div><div class="num">${crmCount}</div></div><div class="stat"><div class="label">Puntuación máxima</div><div class="num">${top[0].score}/100</div></div></div>
 <div class="grid"><div class="card"><h3>🔥 Mejores oportunidades</h3>${top.map(card).join("")}</div><div class="card"><h3>💡 Cómo funciona</h3><p><b>1. Detectar</b><br><small>Negocios, rodajes, artistas y ofertas.</small></p><p><b>2. Analizar</b><br><small>Señales de necesidad audiovisual y encaje.</small></p><p><b>3. Contactar</b><br><small>La IA prepara un mensaje personalizado para que lo revises.</small></p><p><b>4. Hacer seguimiento</b><br><small>Guarda la oportunidad en el CRM.</small></p></div></div>`;
}
function renderList(key,title,subtitle){
 const arr=data[key];
 document.querySelector("#view-"+({clients:"clients",productions:"productions",music:"music",jobs:"jobs"}[key])).innerHTML=`<div class="card"><div class="row"><div><h3>${title}</h3><small>${subtitle}</small></div><button class="btn dark" onclick="refresh()">↻ Actualizar radar</button></div><br><div class="filters"><input placeholder="Buscar..." oninput="filterList('${key}',this.value)"><select><option>Ordenar: puntuación</option><option>Más recientes</option></select></div><div id="list-${key}" class="list">${arr.sort((a,b)=>b.score-a.score).map(card).join("")}</div></div>`;
}
function filterList(key,q){document.querySelector("#list-"+key).innerHTML=data[key].filter(o=>(o.name+" "+o.place+" "+o.service).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.score-a.score).map(card).join("")||'<div class="empty">No hay resultados.</div>'}
function renderCRM(){
 const saved=all().filter(o=>state.crm[o.id]);
 document.querySelector("#view-crm").innerHTML=`<div class="card"><div class="row"><div><h3>📋 CRM de oportunidades</h3><small>Seguimiento desde descubrimiento hasta cliente.</small></div><span class="tag">${saved.length} guardadas</span></div><br>${saved.length?saved.map(o=>`<div class="opportunity"><div class="score">${o.score}</div><div class="op-main"><b>${esc(o.name)}</b><small>${esc(state.crm[o.id]?.status||"Nueva")}</small></div><select onchange="setStatus(${o.id},this.value)">${["Nueva","Contactar","Contactado","Respondió","Reunión","Presupuesto","Ganada","Perdida"].map(s=>`<option ${s===state.crm[o.id]?.status?"selected":""}>${s}</option>`).join("")}</select><button class="btn" onclick="openOpportunity(${o.id})">Abrir</button></div>`).join(""):'<div class="empty">Todavía no has guardado oportunidades. Pulsa “Guardar en CRM” desde cualquier ficha.</div>'}</div>`;
}
function renderProfile(){
 const p=state.profile;
 document.querySelector("#view-profile").innerHTML=`<div class="card profile"><h3>👤 Mi perfil profesional</h3><p><small>Estos datos se utilizarán para calcular el encaje y personalizar los mensajes.</small></p><div class="form-grid">
 <div class="field"><label>Nombre</label><input id="pname" value="${esc(p.name||"Videógrafo freelance")}"></div>
 <div class="field"><label>Ciudad base</label><input id="pcity" value="${esc(p.city||"Zaragoza")}"></div>
 <div class="field"><label>Radio de trabajo (km)</label><input id="pradius" value="${esc(p.radius||"150")}"></div>
 <div class="field"><label>Tarifa mínima (€)</label><input id="pmin" value="${esc(p.min||"500")}"></div>
 <div class="field full"><label>Servicios</label><input id="pservices" value="${esc(p.services||"Reels, vídeo corporativo, publicidad, eventos, videoclips")}"></div>
 <div class="field full"><label>Portfolio / web</label><input id="pweb" value="${esc(p.web||"")}"></div>
 <div class="field full"><label>Estilo de comunicación</label><textarea id="pstyle">${esc(p.style||"Profesional, cercano y directo. Sin sonar agresivo ni demasiado vendedor.")}</textarea></div>
 </div><br><button class="btn dark" onclick="saveProfile()">Guardar perfil</button></div>`;
}
function openOpportunity(id){
 const o=all().find(x=>x.id===id); if(!o)return;
 document.querySelector("#modal-content").innerHTML=`<div class="eyebrow">${esc(o.type)}</div><h2>${esc(o.name)}</h2><p><b>📍</b> ${esc(o.place)} &nbsp; · &nbsp; <b>🎯 ${o.score}/100</b></p>
 <div class="detail-grid"><div class="metric"><small>Necesidad</small><b>${Math.min(99,o.score+1)}/100</b></div><div class="metric"><small>Encaje contigo</small><b>${Math.max(70,o.score-2)}/100</b></div><div class="metric"><small>Servicio sugerido</small><b>${esc(o.service)}</b></div></div>
 <p><b>🧠 Análisis</b></p><p>${esc(o.reason)}</p><p><b>📬 Contacto detectado</b><br>${esc(o.contact)}</p>
 <div class="row"><button class="btn dark" onclick="generateMessage(${o.id})">🤖 Generar contacto</button><button class="btn" onclick="saveCRM(${o.id})">📋 Guardar en CRM</button></div>`;
 document.querySelector("#modal").classList.remove("hidden");
}
function generateMessage(id){
 const o=all().find(x=>x.id===id), p=state.profile;
 const name=p.name||"un videógrafo freelance";
 const text=`Hola,\n\nSoy ${name} y trabajo creando contenido audiovisual para empresas, marcas y proyectos creativos.\n\nHe estado viendo ${o.name} y creo que hay una oportunidad interesante para potenciar vuestro contenido mediante ${o.service.toLowerCase()}.\n\n${o.reason}\n\nSi os encaja, puedo enseñaros algunos trabajos y comentaros una idea concreta que podría funcionar para vosotros, sin compromiso.\n\nUn saludo,\n${p.name||"[Tu nombre]"}\n${p.web||"[Portfolio / web]"}`;
 document.querySelector("#modal-content").innerHTML=`<h2>✉️ Contacto preparado</h2><p><small>Propuesta generada para ${esc(o.name)}. Revísala antes de enviarla.</small></p><div class="email">${esc(text)}</div><br><div class="row"><button class="btn dark" onclick="copyText(${JSON.stringify(text)})">Copiar</button><button class="btn" onclick="showToast('En V1 el envío es manual: copia el mensaje y envíalo desde tu cuenta.')">Enviar</button></div>`;
}
function copyText(t){navigator.clipboard?.writeText(t);showToast("Mensaje copiado");}
function saveCRM(id){state.crm[id]={status:"Nueva"};localStorage.setItem("filmRadarCRM",JSON.stringify(state.crm));showToast("Guardado en CRM");renderCRM();}
function setStatus(id,status){state.crm[id].status=status;localStorage.setItem("filmRadarCRM",JSON.stringify(state.crm));showToast("Estado actualizado");}
function saveProfile(){state.profile={name:pname.value,city:pcity.value,radius:pradius.value,min:pmin.value,services:pservices.value,web:pweb.value,style:pstyle.value};localStorage.setItem("filmRadarProfile",JSON.stringify(state.profile));showToast("Perfil guardado");}
function closeModal(){document.querySelector("#modal").classList.add("hidden")}
function showToast(t){const e=document.querySelector("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
function refresh(){showToast("Radar actualizado · datos de demostración");}
function renderAll(){renderDashboard();renderList("clients","🎯 Radar de clientes","Negocios con posible necesidad audiovisual");renderList("productions","🎬 Radar de rodajes","Películas, series, cortos y producciones");renderList("music","🎵 Radar de artistas y música","Artistas, videoclips, giras y lanzamientos");renderList("jobs","💼 Radar de ofertas","Trabajos y puestos audiovisuales");renderCRM();renderProfile();}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));document.querySelector("#view-"+b.dataset.view).classList.add("active");document.querySelector("#page-title").textContent={dashboard:"Buenos días 👋",clients:"Radar de clientes",productions:"Radar de rodajes",music:"Artistas & música",jobs:"Ofertas de trabajo",crm:"Seguimiento comercial",profile:"Mi perfil profesional"}[b.dataset.view]});
document.querySelector("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
renderAll();