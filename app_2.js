import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SURL   = atob('aHR0cHM6Ly91bHJhbG50aG10cmhscWd6bGJhai5zdXBhYmFzZS5jbw==');
const SANON  = atob('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5Wc2NtRnNiblJvYlhSeWFHeHhaM3BzWW1GcUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpReU9UTTVOakFzSW1WNGNDSTZNakE0T1RnMk9UazJNSDAuYlVaci1lZTdZcWhENEpTODIxYjZMOHJwQ2N5bFZNTTBfeHczT1NncG81Yw==');
const SHEETS = 'AIzaSyC-N81PirMeo2ARUgmgQcuVrWK5_HF9n7g';
const BACK   = 'http://localhost:8000';
const ADMIN  = 'cintojuanignacio' + String.fromCharCode(64) + 'gmail.com';
const sb     = createClient(SURL, SANON);

let currentUser = null, clienteConfig = null, allRecords = [];
let chatAbierto = false, archivoSel = null;
let chartMes = null, chartCat = null, todosClientes = [];
const COLORS = {materia_prima:'#c8a96e',suministros:'#5b8dee',servicios:'#9b7fe8',alquiler:'#4caf82',personal:'#e05a4e',mantenimiento:'#e8865a',otros:'#7a7875'};

function show(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function fmt(n) { return Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtE(n) { return fmt(n)+' €'; }
function ahora() { return new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}); }
function showErr(id,msg) { const el=document.getElementById(id); el.textContent=msg; el.style.display='block'; }
function hideEl(id) { document.getElementById(id).style.display='none'; }
function showOk(id,msg) { const el=document.getElementById(id); el.textContent=msg; el.style.display='block'; }
function tiempoRel(ts) {
  if (!ts) return 'Nunca';
  const d=Date.now()-new Date(ts).getTime();
  const m=Math.floor(d/60000),h=Math.floor(d/3600000),dias=Math.floor(d/86400000);
  if (m<2) return 'Ahora mismo';
  if (m<60) return 'Hace '+m+'m';
  if (h<24) return 'Hace '+h+'h';
  if (dias<7) return 'Hace '+dias+'d';
  return new Date(ts).toLocaleDateString('es-ES',{day:'2-digit',month:'short'});
}

// AUTH
document.getElementById('login-btn').addEventListener('click', async function() {
  hideEl('login-err');
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { showErr('login-err','Rellena email y contrasena.'); return; }
  this.disabled = true; this.textContent = 'Entrando...';
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    await iniciarSesion(data.user);
  } catch(e) {
    showErr('login-err', e.message === 'Invalid login credentials' ? 'Email o contrasena incorrectos.' : e.message);
  } finally {
    this.disabled = false; this.textContent = 'Entrar';
  }
});

document.getElementById('reg-btn').addEventListener('click', async function() {
  hideEl('reg-err');
  const neg   = document.getElementById('reg-neg').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if (!neg||!email||!pass) { showErr('reg-err','Rellena todos los campos.'); return; }
  if (pass.length<6) { showErr('reg-err','Contrasena minimo 6 caracteres.'); return; }
  this.disabled = true; this.textContent = 'Creando...';
  try {
    const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { nombre_negocio: neg } } });
    if (error) throw error;
    if (data.user) {
      await sb.from('clientes').insert({ user_id: data.user.id, email, nombre_negocio: neg, plan: 'basico' });
      showOk('reg-ok', 'Cuenta creada! Entrando...');
      setTimeout(() => iniciarSesion(data.user), 1000);
    }
  } catch(e) {
    showErr('reg-err', e.message || 'Error al crear la cuenta.');
  } finally {
    this.disabled = false; this.textContent = 'Crear cuenta gratis';
  }
});

document.getElementById('go-reg').addEventListener('click',    () => show('page-reg'));
document.getElementById('go-login2').addEventListener('click', () => show('page-login'));
document.getElementById('go-forgot').addEventListener('click', () => show('page-forgot'));
document.getElementById('go-login3').addEventListener('click', () => show('page-login'));

document.getElementById('forgot-btn').addEventListener('click', async function() {
  hideEl('forgot-err'); hideEl('forgot-ok');
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) { showErr('forgot-err', 'Introduce tu email.'); return; }
  this.disabled = true; this.textContent = 'Enviando...';
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
    showOk('forgot-ok', 'Enlace enviado! Revisa tu email.');
  } catch(e) {
    showErr('forgot-err', e.message);
  } finally {
    this.disabled = false; this.textContent = 'Enviar enlace';
  }
});

document.getElementById('newpass-btn').addEventListener('click', async function() {
  hideEl('newpass-err'); hideEl('newpass-ok');
  const pass = document.getElementById('newpass-pass').value;
  const pass2 = document.getElementById('newpass-pass2').value;
  if (!pass || pass.length < 6) { showErr('newpass-err', 'Minimo 6 caracteres.'); return; }
  if (pass !== pass2) { showErr('newpass-err', 'Las contraseñas no coinciden.'); return; }
  this.disabled = true; this.textContent = 'Guardando...';
  try {
    const { error } = await sb.auth.updateUser({ password: pass });
    if (error) throw error;
    showOk('newpass-ok', 'Contraseña actualizada!');
    setTimeout(() => show('page-login'), 1500);
  } catch(e) {
    showErr('newpass-err', e.message);
  } finally {
    this.disabled = false; this.textContent = 'Guardar contraseña';
  }
});

async function logout() {
  await sb.auth.signOut();
  currentUser = null; clienteConfig = null; allRecords = [];
  show('page-login');
}
document.getElementById('dash-logout').addEventListener('click',  logout);
document.getElementById('setup-logout').addEventListener('click', logout);
document.getElementById('admin-logout').addEventListener('click', logout);

async function iniciarSesion(user) {
  currentUser = user;
  if (user.email === ADMIN) { await cargarAdmin(); show('page-admin'); return; }
  const { data } = await sb.from('clientes').select('*').eq('user_id', user.id).single();
  clienteConfig = data;
  document.getElementById('dash-user').textContent = data?.nombre_negocio || user.email.split('@')[0];
  document.getElementById('setup-email').textContent = user.email;
  try { await sb.rpc('actualizar_ultimo_acceso', { p_user_id: user.id }); } catch(e) {}
  if (!data?.google_sheet_id) { show('page-setup'); }
  else { await cargarDashboard(); show('page-dash'); }
}

document.getElementById('setup-btn').addEventListener('click', async function() {
  const sheetId  = document.getElementById('setup-sheet').value.trim();
  const telegram = document.getElementById('setup-telegram').value.trim();
  if (!sheetId) { showErr('setup-err','El ID del Sheet es obligatorio.'); return; }
  const { error } = await sb.from('clientes').update({ google_sheet_id: sheetId, telegram_chat_id: telegram || null }).eq('user_id', currentUser.id);
  if (error) { showErr('setup-err', error.message); return; }
  clienteConfig = { ...clienteConfig, google_sheet_id: sheetId, telegram_chat_id: telegram };
  await cargarDashboard();
  show('page-dash');
});

async function cargarDashboard() {
  if (!clienteConfig?.google_sheet_id) return;
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + clienteConfig.google_sheet_id + '/values/Facturas_Compras?key=' + SHEETS;
    const res = await fetch(url);
    if (res.ok) {
      const d = await res.json();
      if (d.values && d.values.length > 1) {
        const h = d.values[0];
        allRecords = d.values.slice(1).map(r => { const o={}; h.forEach((k,i) => { o[k]=r[i]||''; }); return o; });
      } else { allRecords = generarEjemplo(); }
    } else { allRecords = generarEjemplo(); }
  } catch(e) { allRecords = generarEjemplo(); }
  renderizar(allRecords);
}

function filtrarPeriodo(r) {
  const v = parseInt(document.getElementById('periodSel').value);
  const hoy = new Date();
  return r.filter(x => {
    const f = new Date(x['Fecha']); if (isNaN(f)) return false;
    if (v===0) return f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();
    if (v===1) { const p=new Date(hoy.getFullYear(),hoy.getMonth()-1,1); return f>=p&&f<new Date(hoy.getFullYear(),hoy.getMonth(),1); }
    const d=new Date(hoy); d.setMonth(d.getMonth()-v); return f>=d;
  });
}
function cambiarPeriodo() { renderizar(allRecords); }
window.cambiarPeriodo = cambiarPeriodo;
function renderizar(todos) { const f=filtrarPeriodo(todos); renderKPIs(f); renderCharts(f,todos); renderIVA(f); renderTabla(f); }

function renderKPIs(r) {
  const a=r.filter(x=>x['Estado']?.toLowerCase()!=='rechazada');
  const tG=a.reduce((s,x)=>s+parseFloat(x['Total (€)']||0),0);
  const tB=a.reduce((s,x)=>s+parseFloat(x['Base Imponible (€)']||0),0);
  const tI=a.reduce((s,x)=>s+parseFloat(x['Cuota IVA (€)']||0),0);
  const pend=a.filter(x=>x['Estado']?.toLowerCase()==='pendiente').length;
  document.getElementById('kpiGrid').innerHTML =
    '<div class="kpi" style="--c:#c8a96e"><div class="kpi-l">Total gastos</div><div class="kpi-v">'+fmtE(tG)+'</div><div class="kpi-s">'+a.length+' facturas</div></div>'+
    '<div class="kpi" style="--c:#5b8dee"><div class="kpi-l">Base imponible</div><div class="kpi-v">'+fmtE(tB)+'</div><div class="kpi-s">Sin IVA</div></div>'+
    '<div class="kpi" style="--c:#9b7fe8"><div class="kpi-l">IVA soportado</div><div class="kpi-v">'+fmtE(tI)+'</div><div class="kpi-s">'+(tB>0?(tI/tB*100).toFixed(1):0)+'% efectivo</div></div>'+
    '<div class="kpi" style="--c:'+(pend>0?'#e05a4e':'#4caf82')+'"><div class="kpi-l">Pendientes</div><div class="kpi-v">'+pend+'</div><div class="kpi-s '+(pend>0?'dn':'up')+'">'+(pend>0?'Requieren atencion':'Todo verificado')+'</div></div>';
}

function renderCharts(f,todos) {
  const hoy=new Date(),meses=[],gastos=[],ivas=[];
  for(let i=5;i>=0;i--) {
    const d=new Date(hoy.getFullYear(),hoy.getMonth()-i,1);
    meses.push(d.toLocaleDateString('es-ES',{month:'short',year:'2-digit'}));
    const regs=todos.filter(r=>{const fe=new Date(r['Fecha']);return fe.getMonth()===d.getMonth()&&fe.getFullYear()===d.getFullYear()&&r['Estado']?.toLowerCase()!=='rechazada';});
    gastos.push(regs.reduce((s,r)=>s+parseFloat(r['Total (€)']||0),0));
    ivas.push(regs.reduce((s,r)=>s+parseFloat(r['Cuota IVA (€)']||0),0));
  }
  if(chartMes) chartMes.destroy();
  chartMes=new Chart(document.getElementById('chartMes'),{type:'bar',data:{labels:meses,datasets:[{label:'Gastos',data:gastos,backgroundColor:'rgba(200,169,110,.7)',borderRadius:5,borderSkipped:false},{label:'IVA',data:ivas,backgroundColor:'rgba(91,141,238,.5)',borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+fmtE(c.raw)}}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#7a7875',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#7a7875',font:{size:10},callback:v=>v>=1000?(v/1000).toFixed(0)+'k':v}}}}});
  const catD={};
  f.filter(r=>r['Estado']?.toLowerCase()!=='rechazada').forEach(r=>{const c=r['Categoria']||'otros';catD[c]=(catD[c]||0)+parseFloat(r['Total (€)']||0);});
  const cats=Object.keys(catD),tots=Object.values(catD),cols=cats.map(c=>COLORS[c]||'#7a7875');
  if(chartCat) chartCat.destroy();
  chartCat=new Chart(document.getElementById('chartCat'),{type:'doughnut',data:{labels:cats.map(c=>c.replace('_',' ')),datasets:[{data:tots,backgroundColor:cols,borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:true,cutout:'66%',plugins:{legend:{position:'bottom',labels:{color:'#7a7875',font:{size:10},padding:10,boxWidth:9,boxHeight:9}},tooltip:{callbacks:{label:c=>' '+c.label+': '+fmtE(c.raw)}}}}});
}

function renderIVA(r) {
  const a=r.filter(x=>x['Estado']?.toLowerCase()!=='rechazada');
  const s21=a.filter(x=>parseFloat(x['IVA %']||0)===21).reduce((s,x)=>s+parseFloat(x['Cuota IVA (€)']||0),0);
  const s10=a.filter(x=>parseFloat(x['IVA %']||0)===10).reduce((s,x)=>s+parseFloat(x['Cuota IVA (€)']||0),0);
  const s4=a.filter(x=>parseFloat(x['IVA %']||0)===4).reduce((s,x)=>s+parseFloat(x['Cuota IVA (€)']||0),0);
  const tot=s21+s10+s4,hoy=new Date(),trim=Math.ceil((hoy.getMonth()+1)/3);
  const mp={1:'Ene-Mar',2:'Abr-Jun',3:'Jul-Sep',4:'Oct-Dic'};
  const base=a.reduce((s,x)=>s+parseFloat(x['Base Imponible (€)']||0),0);
  const ver=a.filter(x=>x['Estado']?.toLowerCase()==='verificada').length;
  const pen=a.filter(x=>x['Estado']?.toLowerCase()==='pendiente').length;
  document.getElementById('ivaRow').innerHTML=
    '<div class="iva-card"><div class="iva-head"><div class="iva-title">IVA soportado</div><span class="badge b-blue">T'+trim+' '+mp[trim]+'</span></div>'+
    '<div class="iva-tr"><span class="iva-k">21% general</span><span>'+fmtE(s21)+'</span></div>'+
    '<div class="iva-tr"><span class="iva-k">10% hosteleria</span><span>'+fmtE(s10)+'</span></div>'+
    '<div class="iva-tr"><span class="iva-k">4% basicos</span><span>'+fmtE(s4)+'</span></div>'+
    '<div class="iva-total"><span>Total</span><span>'+fmtE(tot)+'</span></div></div>'+
    '<div class="iva-card"><div class="iva-head"><div class="iva-title">Modelo 303</div><span class="badge b-amber">Estimacion</span></div>'+
    '<div class="iva-tr"><span class="iva-k">IVA repercutido</span><span style="color:#7a7875">-</span></div>'+
    '<div class="iva-tr"><span class="iva-k">IVA soportado</span><span style="color:#4caf82">-'+fmtE(tot)+'</span></div>'+
    '<div class="iva-total" style="color:#7a7875"><span>Resultado</span><span>Pendiente</span></div></div>'+
    '<div class="iva-card"><div class="iva-head"><div class="iva-title">Estado</div><span class="badge b-green">Periodo</span></div>'+
    '<div class="iva-tr"><span class="iva-k">Verificadas</span><span style="color:#4caf82">'+ver+'</span></div>'+
    '<div class="iva-tr"><span class="iva-k">Pendientes</span><span style="color:#e8a030">'+pen+'</span></div>'+
    '<div class="iva-total"><span>Base total</span><span>'+fmtE(base)+'</span></div></div>';
}

function renderTabla(r) {
  if(!r.length) { document.getElementById('tablaWrap').innerHTML='<div style="padding:40px;text-align:center;color:#7a7875">Sin facturas en este periodo</div>'; return; }
  const sorted=[...r].sort((a,b)=>new Date(b['Fecha'])-new Date(a['Fecha']));
  let rows='';
  sorted.forEach(row => {
    rows+='<tr>'+
      '<td class="td-m">'+(row['Fecha']||'-')+'</td>'+
      '<td><strong>'+(row['Proveedor']||'-')+'</strong></td>'+
      '<td><span class="pill p-cat">'+(row['Categoria']||'otros').replace('_',' ')+'</span></td>'+
      '<td style="text-align:right">'+fmt(row['Base Imponible (€)']||0)+'</td>'+
      '<td class="td-m">'+(row['IVA %']||21)+'%</td>'+
      '<td style="text-align:right"><strong>'+fmt(row['Total (€)']||0)+' €</strong></td>'+
      '<td><span class="pill '+(row['Estado']?.toLowerCase()==='verificada'?'p-ok':'p-pend')+'">'+(row['Estado']||'pendiente')+'</span></td>'+
      '</tr>';
  });
  document.getElementById('tablaWrap').innerHTML='<table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Categoria</th><th style="text-align:right">Base</th><th>IVA</th><th style="text-align:right">Total</th><th>Estado</th></tr></thead><tbody>'+rows+'</tbody></table>';
}

function filtrar() {
  const q=document.getElementById('searchQ').value.toLowerCase();
  const cat=document.getElementById('catF').value;
  const est=document.getElementById('estadoF').value;
  let r=filtrarPeriodo(allRecords);
  if(q)   r=r.filter(x=>(x['Proveedor']||'').toLowerCase().includes(q));
  if(cat) r=r.filter(x=>(x['Categoria']||'').toLowerCase()===cat);
  if(est) r=r.filter(x=>(x['Estado']||'').toLowerCase()===est);
  renderTabla(r);
}
window.filtrar=filtrar;

function toggleChat() {
  chatAbierto=!chatAbierto;
  document.getElementById('chatPanel').classList.toggle('open',chatAbierto);
  document.getElementById('mainEl').classList.toggle('chat-open',chatAbierto);
}
window.toggleChat=toggleChat;

function addMsg(tipo,texto) {
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div'); d.className='msg '+tipo;
  d.innerHTML='<div class="msg-b">'+texto+'</div><div class="msg-t">'+ahora()+'</div>';
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}

function selFile(input) {
  const f=input.files[0]; if(!f) return;
  archivoSel=f;
  document.getElementById('filePrev').innerHTML='<div class="file-prev"><div class="file-icon">'+f.name.split('.').pop().toUpperCase()+'</div><span class="file-nm">'+f.name+'</span><span class="file-rm" onclick="quitarFile()">x</span></div>';
}
window.selFile=selFile;

function quitarFile() { archivoSel=null; document.getElementById('fileIn').value=''; document.getElementById('filePrev').innerHTML=''; }
window.quitarFile=quitarFile;

async function enviarChat() {
  const input=document.getElementById('chatIn');
  const texto=input.value.trim();
  if(!texto&&!archivoSel) return;
  addMsg('usr', archivoSel?('Archivo: '+archivoSel.name):texto);
  input.value=''; input.style.height='36px';
  const archivo=archivoSel; quitarFile();
  const typing=document.createElement('div'); typing.className='msg bot';
  typing.innerHTML='<div class="typing"><span></span><span></span><span></span></div>';
  document.getElementById('chatMsgs').appendChild(typing);
  let resp='';
  try {
    if(archivo) {
      const fd=new FormData(); fd.append('archivo',archivo); fd.append('origen','web');
      const res=await fetch(BACK+'/procesar-factura',{method:'POST',body:fd});
      resp=res.ok?(await res.json()).mensaje||'Procesada.':"Servidor no disponible. Arranca: python servidor.py";
    } else {
      const res=await fetch(BACK+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensaje:texto})});
      resp=res.ok?(await res.json()).respuesta:respLocal(texto);
    }
  } catch(e) { resp=respLocal(texto); }
  typing.remove(); addMsg('bot',resp);
}
window.enviarChat=enviarChat;

function respLocal(t) {
  t=t.toLowerCase();
  if(t.includes('resumen')||t.includes('gasto')) { const a=filtrarPeriodo(allRecords).filter(r=>r['Estado']?.toLowerCase()!=='rechazada'); return 'Total: '+fmtE(a.reduce((s,r)=>s+parseFloat(r['Total (€)']||0),0))+' - '+a.length+' facturas'; }
  if(t.includes('iva')) { const a=filtrarPeriodo(allRecords).filter(r=>r['Estado']?.toLowerCase()!=='rechazada'); return 'IVA soportado: '+fmtE(a.reduce((s,r)=>s+parseFloat(r['Cuota IVA (€)']||0),0)); }
  if(t.includes('pendiente')) { const p=filtrarPeriodo(allRecords).filter(r=>r['Estado']?.toLowerCase()==='pendiente'); return p.length?p.length+' pendientes.':'Sin pendientes.'; }
  return 'Puedo ayudarte con: resumen, IVA, pendientes o sube una factura.';
}

async function cargarAdmin() {
  const {data:clientes}=await sb.from('clientes').select('*').order('creado_en',{ascending:false});
  todosClientes=clientes||[]; renderAdmin(todosClientes);
}

function renderAdmin(lista) {
  const act=lista.filter(c=>c.activo),nuevos=lista.filter(c=>c.creado_en&&(Date.now()-new Date(c.creado_en).getTime())<30*86400000);
  const totalF=lista.reduce((s,c)=>s+(c.total_facturas||0),0),conSheet=lista.filter(c=>c.google_sheet_id);
  document.getElementById('adminKpis').innerHTML=
    '<div class="kpi" style="--c:#c8a96e"><div class="kpi-l">Total clientes</div><div class="kpi-v">'+lista.length+'</div><div class="kpi-s">'+nuevos.length+' nuevos este mes</div></div>'+
    '<div class="kpi" style="--c:#4caf82"><div class="kpi-l">Activos</div><div class="kpi-v" style="color:#4caf82">'+act.length+'</div><div class="kpi-s">'+(lista.length-act.length)+' pausados</div></div>'+
    '<div class="kpi" style="--c:#5b8dee"><div class="kpi-l">Facturas procesadas</div><div class="kpi-v">'+totalF+'</div><div class="kpi-s">Total historico</div></div>'+
    '<div class="kpi" style="--c:#9b7fe8"><div class="kpi-l">Con Sheet</div><div class="kpi-v">'+conSheet.length+'</div><div class="kpi-s">Configurados</div></div>';
  const inact=lista.filter(c=>c.activo&&c.ultimo_acceso&&(Date.now()-new Date(c.ultimo_acceso).getTime())>7*86400000);
  const sinSh=lista.filter(c=>c.activo&&!c.google_sheet_id);
  let al='';
  if(inact.length) al+='<div class="alert-box alert-warn">'+inact.length+' cliente(s) sin actividad +7 dias.</div>';
  if(sinSh.length) al+='<div class="alert-box alert-info">'+sinSh.length+' cliente(s) sin Sheet configurado.</div>';
  document.getElementById('adminAlertas').innerHTML=al;
  if(!lista.length){document.getElementById('adminClientes').innerHTML='<div style="padding:40px;text-align:center;color:#7a7875">Sin clientes todavia</div>';return;}
  let rows='';
  lista.forEach(c=>{
    const in7=c.activo&&c.ultimo_acceso&&(Date.now()-new Date(c.ultimo_acceso).getTime())>7*86400000;
    const ep=c.total_facturas>0?Math.round((c.facturas_error||0)/c.total_facturas*100):0;
    rows+='<tr>'+
      '<td><div style="display:flex;align-items:center;gap:10px"><div class="c-avatar">'+((c.nombre_negocio||c.email)[0].toUpperCase())+'</div><div><div style="font-weight:500">'+(c.nombre_negocio||'-')+'</div><div class="td-m">'+c.email+'</div></div></div></td>'+
      '<td><span class="pill '+(c.plan==='pro'?'p-ok':'p-pend')+'">'+c.plan+'</span></td>'+
      '<td><div style="font-weight:600">'+(c.total_facturas||0)+'</div>'+(ep>0?'<div class="td-m" style="color:#e05a4e">'+ep+'% errores</div>':'<div class="td-m" style="color:#4caf82">Sin errores</div>')+'</td>'+
      '<td><div style="'+(in7?'color:#e8a030':'')+'">'+tiempoRel(c.ultimo_acceso)+'</div>'+(c.ultima_factura?'<div class="td-m">Ult.factura: '+tiempoRel(c.ultima_factura)+'</div>':'')+'</td>'+
      '<td>'+(c.telegram_chat_id?'<span class="tag tag-tg">Telegram</span>':'<span class="tag tag-web">Web</span>')+'</td>'+
      '<td><span class="pill '+(c.activo?'p-ok':'p-pend')+'">'+(c.activo?'activo':'pausado')+'</span></td>'+
      '<td><button data-cid="'+c.id+'" style="background:none;border:1px solid rgba(255,255,255,.15);color:#7a7875;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px">Gestionar</button></td>'+
      '</tr>';
  });
  document.getElementById('adminClientes').innerHTML='<table><thead><tr><th>Cliente</th><th>Plan</th><th>Facturas</th><th>Ultimo acceso</th><th>Canal</th><th>Estado</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
}

document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-cid]');
  if (btn) abrirCliente(btn.dataset.cid);
});

function filtrarAdmin() {
  const q=document.getElementById('adminSearch').value.toLowerCase();
  const plan=document.getElementById('adminPlan').value;
  const estado=document.getElementById('adminEstado').value;
  let l=todosClientes;
  if(q)      l=l.filter(c=>(c.nombre_negocio||'').toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q));
  if(plan)   l=l.filter(c=>c.plan===plan);
  if(estado==='activo')   l=l.filter(c=>c.activo);
  if(estado==='pausado')  l=l.filter(c=>!c.activo);
  if(estado==='inactivo') l=l.filter(c=>c.activo&&c.ultimo_acceso&&(Date.now()-new Date(c.ultimo_acceso).getTime())>7*86400000);
  renderAdmin(l);
}
window.filtrarAdmin=filtrarAdmin;

function abrirCliente(id) {
  const c=todosClientes.find(x=>x.id===id); if(!c) return;
  document.getElementById('modal-title').textContent=c.nombre_negocio||c.email;
  document.getElementById('modal-content').innerHTML=
    '<div class="modal-field"><span class="modal-label">Email</span><div>'+c.email+'</div></div>'+
    '<div class="modal-field"><span class="modal-label">Plan</span><select id="modal-plan" class="f-sel" style="width:100%"><option value="basico"'+(c.plan==='basico'?' selected':'')+'>Basico 29/mes</option><option value="pro"'+(c.plan==='pro'?' selected':'')+'>Pro 59/mes</option></select></div>'+
    '<div class="modal-field"><span class="modal-label">Google Sheet ID</span><input id="modal-sheet" class="f-in" style="width:100%" value="'+(c.google_sheet_id||'')+'"></div>'+
    '<div class="modal-field"><span class="modal-label">Telegram Chat ID</span><input id="modal-tg" class="f-in" style="width:100%" value="'+(c.telegram_chat_id||'')+'"></div>'+
    '<div style="background:#1e1e21;border-radius:8px;padding:12px;margin-bottom:14px;font-size:12px">'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#7a7875">Facturas totales</span><strong>'+(c.total_facturas||0)+'</strong></div>'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#7a7875">Este mes</span><strong>'+(c.facturas_mes||0)+'</strong></div>'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#7a7875">Con error</span><strong style="color:#e05a4e">'+(c.facturas_error||0)+'</strong></div>'+
    '<div style="display:flex;justify-content:space-between"><span style="color:#7a7875">Ultimo acceso</span><strong>'+tiempoRel(c.ultimo_acceso)+'</strong></div>'+
    '</div>'+
    '<div class="modal-actions">'+
    '<button class="btn-accent" onclick="guardarCliente(''+c.id+'')">Guardar cambios</button>'+
    '<button class="'+(c.activo?'btn-danger':'btn-success')+'" onclick="toggleActivo(''+c.id+'','+(!c.activo)+')">'+(c.activo?'Pausar':'Activar')+' cuenta</button>'+
    '<button class="btn-sm" onclick="cerrarModal()">Cancelar</button>'+
    '</div>';
  document.getElementById('modalCliente').style.display='flex';
}
window.abrirCliente=abrirCliente;

function cerrarModal() { document.getElementById('modalCliente').style.display='none'; }
window.cerrarModal=cerrarModal;

async function guardarCliente(id) {
  const plan=document.getElementById('modal-plan').value;
  const sheetId=document.getElementById('modal-sheet').value.trim();
  const tg=document.getElementById('modal-tg').value.trim();
  const {error}=await sb.from('clientes').update({plan,google_sheet_id:sheetId||null,telegram_chat_id:tg||null}).eq('id',id);
  if(error){alert('Error: '+error.message);return;}
  cerrarModal(); await cargarAdmin();
}
window.guardarCliente=guardarCliente;

async function toggleActivo(id,nuevoEstado) {
  const {error}=await sb.from('clientes').update({activo:nuevoEstado}).eq('id',id);
  if(error){alert('Error: '+error.message);return;}
  cerrarModal(); await cargarAdmin();
}
window.toggleActivo=toggleActivo;

document.getElementById('admin-export').addEventListener('click',function(){
  const cols=['nombre_negocio','email','plan','activo','total_facturas','facturas_mes','ultimo_acceso','creado_en'];
  const csv=[cols.join(','),...todosClientes.map(c=>cols.map(k=>JSON.stringify(c[k]!==undefined?c[k]:'')).join(','))].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='gestio_clientes_'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
});

function generarEjemplo() {
  const hoy=new Date(),datos=[],provs=[{n:'Makro Espana',cat:'materia_prima',iva:10,min:400,max:900},{n:'Endesa Energia',cat:'suministros',iva:21,min:200,max:400},{n:'Cafes La Estrella',cat:'materia_prima',iva:4,min:150,max:300},{n:'Mercado Central',cat:'materia_prima',iva:4,min:50,max:150},{n:'Gestoria Lopez',cat:'servicios',iva:21,min:100,max:200}];
  for(let mes=5;mes>=0;mes--){
    const d=new Date(hoy.getFullYear(),hoy.getMonth()-mes,1);
    for(let i=0;i<4+Math.floor(Math.random()*4);i++){
      const p=provs[Math.floor(Math.random()*provs.length)];
      const base=Math.round((p.min+Math.random()*(p.max-p.min))*100)/100;
      const cuota=Math.round(base*p.iva)/100;
      const fecha=new Date(d.getFullYear(),d.getMonth(),1+Math.floor(Math.random()*26));
      datos.push({'Fecha':fecha.toISOString().split('T')[0],'Proveedor':p.n,'Categoria':p.cat,'Base Imponible (€)':base,'IVA %':p.iva,'Cuota IVA (€)':cu
