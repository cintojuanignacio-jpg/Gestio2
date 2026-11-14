import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SURL   = atob('aHR0cHM6Ly91bHJhbG50aG10cmhscWd6bGJhai5zdXBhYmFzZS5jbw==');
const SANON  = atob('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5Wc2NtRnNiblJvYlhSeWFHeHhaM3BzWW1GcUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpReU9UTTVOakFzSW1WNGNDSTZNakE0T1RnMk9UazJNSDAuYlVaci1lZTdZcWhENEpTODIxYjZMOHJwQ2N5bFZNTTBfeHczT1NncG81Yw==');
const BACK   = 'https://web-production-a8f70.up.railway.app';
const ADMIN  = 'cintojuanignacio' + String.fromCharCode(64) + 'gmail.com';
// ── Rango del grafico "Gastos por mes" ───────────────────────────────────────
let chartRango = 6;   // meses a mostrar; 0 = desde la primera factura
function mesesDesdePrimera(todos) {
  let min = null;
  todos.forEach(r => { const d = new Date(r['Fecha']); if (!isNaN(d) && (!min || d < min)) min = d; });
  if (!min) return 6;
  const h = new Date();
  return Math.min(60, Math.max(1, (h.getFullYear() - min.getFullYear()) * 12 + h.getMonth() - min.getMonth() + 1));
}
window.setChartRango = function (n) {
  chartRango = n;
  document.querySelectorAll('#chartRangos button').forEach(b => b.classList.toggle('on', Number(b.dataset.r) === n));
  try { renderizar(allRecords); } catch (e) {}
};

// ── QR del bot (incrustado: sin depender de ningun servicio externo) ──────────
const QR_SRC = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2027%2027%27%20class%3D%27segno%27%3E%3Cpath%20class%3D%27qrline%27%20stroke%3D%27%23000%27%20d%3D%27M1%201.5h7m2%200h2m3%200h2m2%200h7m-25%201h1m5%200h1m1%200h1m1%200h1m2%200h4m1%200h1m5%200h1m-25%201h1m1%200h3m1%200h1m3%200h1m1%200h1m2%200h1m2%200h1m1%200h3m1%200h1m-25%201h1m1%200h3m1%200h1m4%200h1m2%200h2m2%200h1m1%200h3m1%200h1m-25%201h1m1%200h3m1%200h1m1%200h2m5%200h1m2%200h1m1%200h3m1%200h1m-25%201h1m5%200h1m3%200h2m3%200h1m2%200h1m5%200h1m-25%201h7m1%200h1m1%200h1m1%200h1m1%200h1m1%200h1m1%200h7m-16%201h8m-17%201h1m1%200h1m1%200h1m1%200h1m5%200h2m6%200h1m2%200h1m-23%201h3m1%200h1m6%200h3m1%200h4m4%200h1m-25%201h1m2%200h5m3%200h1m5%200h1m2%200h1m1%200h3m-24%201h2m1%200h1m3%200h1m2%200h1m1%200h1m2%200h3m4%200h1m-24%201h2m2%200h1m1%200h3m1%200h1m1%200h2m1%200h5m1%200h1m1%200h2m-23%201h1m4%200h1m1%200h3m4%200h3m2%200h1m2%200h1m-25%201h1m1%200h1m1%200h6m2%200h1m1%200h1m1%200h2m1%200h1m2%200h3m-24%201h2m1%200h1m2%200h1m1%200h6m5%200h1m2%200h1m-24%201h1m4%200h3m1%200h1m3%200h1m2%200h6m-14%201h1m1%200h1m1%200h1m2%200h2m3%200h2m1%200h2m-25%201h7m2%200h1m3%200h1m1%200h2m1%200h1m1%200h2m1%200h2m-25%201h1m5%200h1m2%200h1m2%200h3m1%200h1m3%200h2m1%200h2m-25%201h1m1%200h3m1%200h1m1%200h1m1%200h3m3%200h6m-22%201h1m1%200h3m1%200h1m5%200h1m1%200h1m1%200h1m2%200h4m-23%201h1m1%200h3m1%200h1m1%200h1m1%200h1m1%200h2m1%200h1m4%200h1m3%200h1m-25%201h1m5%200h1m2%200h2m2%200h4m3%200h2m1%200h1m-24%201h7m1%200h1m3%200h2m2%200h4m3%200h2%27%2F%3E%3C%2Fsvg%3E";

// ── Idioma (ES por defecto / EN). Traduce el DOM en tiempo de ejecucion ────────
const EN = {"Activos": "Active", "Ahora no": "Not now", "Alquiler": "Rent", "Alta": "High", "Arrastra un PDF o foto al chat, o enviasela al bot de Telegram desde tu movil.": "Drag a PDF or photo into the chat, or send it to the Telegram bot from your phone.", "Asistente IA": "AI Assistant", "Asunto *": "Subject *", "Baja": "Low", "Base imponible (EUR) *": "Taxable base (EUR) *", "Basico": "Basic", "Bienvenido": "Welcome", "Bienvenido a Gestio": "Welcome to Gestio", "Bot de Telegram": "Telegram bot", "Busca": "Search for", "Busca @botgestio_bot en Telegram, escribe /start y copia tu Chat ID": "Search for @botgestio_bot on Telegram, type /start and copy your Chat ID", "Busca el bot en Telegram": "Find the bot on Telegram", "Cambiar contraseña": "Change password", "Cancelar": "Cancel", "Carga manual de factura": "Manual invoice entry", "Cargando...": "Loading...", "Categoria *": "Category *", "Cerrar": "Close", "Chat ID de Telegram": "Telegram Chat ID", "Chat ID de Telegram (opcional)": "Telegram Chat ID (optional)", "Claude extrae proveedor, fecha, base imponible, IVA y categoria con un 98% de precision.": "Claude extracts supplier, date, taxable base, VAT and category with 98% accuracy.", "Cliente": "Client", "Clientes": "Clients", "Comercio": "Retail", "Como funciona": "How it works", "Conecta Telegram para subir facturas desde tu movil.": "Connect Telegram to upload invoices from your phone.", "Configuracion": "Settings", "Contraseña": "Password", "Crea tu cuenta": "Create your account", "Crear cuenta gratis": "Create free account", "Crear ticket de soporte": "Create support ticket", "Cuota IVA (EUR)": "VAT amount (EUR)", "Dashboard web completo": "Full web dashboard", "Datos basicos": "Basic details", "Descripcion": "Description", "Descripcion *": "Description *", "Detalle del ticket": "Ticket details", "Elige una contraseña nueva": "Choose a new password", "En progreso": "In progress", "Entra en tu cuenta": "Log in to your account", "Entrar": "Log in", "Enviar enlace": "Send link", "Enviar ticket": "Send ticket", "Escanea con la camara de tu movil para abrir el bot directamente en Telegram": "Scan with your phone camera to open the bot directly in Telegram", "Escribe": "Type", "Estado": "Status", "Este mes": "This month", "Evolucion": "Trends", "Exportar CSV": "Export CSV", "Facturacion inteligente para comercios espanoles": "Smart invoicing for Spanish businesses", "Facturas": "Invoices", "Facturas ilimitadas": "Unlimited invoices", "Fecha *": "Date *", "Gastos": "Spending", "Gastos por mes": "Monthly spending", "Guardar": "Save", "Guardar cambios": "Save changes", "Guardar contraseña": "Save password", "Guardar factura": "Save invoice", "Guardar y empezar": "Save and start", "Hasta 200 facturas al mes": "Up to 200 invoices per month", "Hasta 3 usuarios": "Up to 3 users", "Hola! Sube una o varias facturas, o preguntame sobre tus gastos.": "Hi! Upload one or more invoices, or ask me about your spending.", "Hosteleria": "Hospitality", "IVA": "VAT", "IVA %": "VAT %", "IVA soportado": "Input VAT", "IVA trimestral": "Quarterly VAT", "IVA trimestral automatico": "Automatic quarterly VAT", "Informacion personal": "Personal information", "Inteligencia artificial para tu negocio": "Artificial intelligence for your business", "KPIs, graficas de gastos e IVA trimestral calculado automaticamente. Listo para el 303.": "KPIs, spending charts and quarterly VAT calculated automatically. Ready for Form 303.", "La IA la lee": "AI reads it", "Log de auditoria IA": "AI audit log", "Mantenimiento": "Maintenance", "Marcar resuelto": "Mark as resolved", "Mas popular": "Most popular", "Materia prima": "Raw materials", "Mes anterior": "Last month", "Metricas del negocio": "Business metrics", "Mis tickets de soporte": "My support tickets", "NIF Proveedor": "Supplier tax ID", "No tienes cuenta?": "Don't have an account?", "Nombre de tu negocio": "Your business name", "Nombre del negocio": "Business name", "Nueva contraseña": "New password", "Numero de factura": "Invoice number", "O escanea el QR con tu movil": "Or scan the QR code with your phone", "Obten tu Chat ID": "Get your Chat ID", "Olvidé mi contraseña": "Forgot my password", "Otro": "Other", "Otros": "Other", "Para autonomos y pequenos negocios": "For freelancers and small businesses", "Para negocios con mas volumen": "For higher-volume businesses", "Pausados": "Paused", "Pega tu Chat ID aqui": "Paste your Chat ID here", "Pendiente": "Pending", "Pendientes": "Pending", "Personal": "Staff", "Personalizado...": "Custom...", "Planes": "Plans", "Podras cambiarlo despues en Perfil > Configuracion": "You can change it later in Profile > Settings", "Por categoria": "By category", "Precio simple y transparente": "Simple, transparent pricing", "Prioridad": "Priority", "Proveedor *": "Supplier *", "Prueba gratis 14 dias": "14-day free trial", "Recuperar contraseña": "Reset password", "Repetir contraseña": "Repeat password", "Requieren atencion": "Need attention", "Respuesta": "Reply", "Resumen del periodo": "Period summary", "Salir": "Log out", "Seleccionar": "Select", "Servicios": "Services", "Sin IVA": "Excl. VAT", "Sin tarjeta de credito · Cancela cuando quieras": "No credit card · Cancel anytime", "14 dias de prueba gratuita en ambos planes · Sin tarjeta de credito": "14-day free trial on both plans · No credit card required", "Soporte": "Support", "Soporte por tickets": "Ticket support", "Soporte prioritario": "Priority support", "Sube la factura": "Upload the invoice", "Sube una foto o PDF de tu factura — por web o por Telegram. La IA extrae todos los datos, calcula el IVA y actualiza tu dashboard en tiempo real.": "Upload a photo or PDF of your invoice, via web or Telegram. AI extracts all the data, calculates VAT and updates your dashboard in real time.", "Subir facturas (PDF o foto, multiple)": "Upload invoices (PDF or photo, multiple)", "Suministros": "Supplies", "Suscripcion": "Subscription", "Te enviamos un enlace a tu email": "We'll send a link to your email", "Telefono": "Phone", "Tickets de soporte": "Support tickets", "Tipo de negocio": "Business type", "Todas": "All", "Todas las facturas": "All invoices", "Todo": "All", "Todo verificado": "All verified", "Todos": "All", "Todos los planes": "All plans", "Total gastos": "Total spending", "Tres pasos para olvidarte de las facturas": "Three steps to forget about invoices", "Tu Chat ID": "Your Chat ID", "Tu cuenta esta lista. Te recomendamos conectar Telegram ahora para poder subir facturas desde tu movil con una simple foto.": "Your account is ready. We recommend connecting Telegram now so you can upload invoices from your phone with a simple photo.", "Tu cuenta esta lista. Tus facturas se guardan automaticamente en la nube. Opcionalmente conecta Telegram para subir facturas desde el movil.": "Your account is ready. Your invoices are saved automatically in the cloud. Optionally connect Telegram to upload invoices from your phone.", "Tu dashboard se actualiza": "Your dashboard updates", "Tu plan actual": "Your current plan", "Tus facturas organizadas": "Your organized invoices", "Ultimo año": "Last year", "Ultimos 3 meses": "Last 3 months", "Ultimos 6 meses": "Last 6 months", "Urgente": "Urgent", "Verificada": "Verified", "Verificadas": "Verified", "Volver al dashboard": "Back to dashboard", "Volver al login": "Back to login", "Ya tengo cuenta": "I already have an account", "Ya tienes cuenta?": "Already have an account?", "Abre Telegram en tu movil o en": "Open Telegram on your phone or at", "al bot. El bot te respondera con tu Chat ID — un numero de 9 o 10 digitos.": "to the bot. It will reply with your Chat ID, a 9 or 10-digit number.", "en Telegram o escanea el QR": "on Telegram or scan the QR code", "en menos de 10 segundos": "in under 10 seconds", "y busca el bot:": "and search for the bot:", "↻ Actualizar": "↻ Refresh", "Buscar cliente...": "Search client...", "Buscar...": "Search...", "Describe brevemente el problema": "Briefly describe the problem", "Describe el problema con detalle...": "Describe the problem in detail...", "Descripcion del gasto": "Expense description", "Escribe aqui...": "Type here...", "Escribe tu respuesta...": "Type your reply...", "Mi perfil": "My profile", "Minimo 6 caracteres": "Minimum 6 characters", "Nombre del proveedor": "Supplier name", "Repite la contraseña": "Repeat the password", "Tu contraseña": "Your password", "Rellena email y contraseña.": "Fill in email and password.", "Email o contraseña incorrectos.": "Incorrect email or password.", "Contraseña minimo 6 caracteres.": "Password must be at least 6 characters.", "Las contraseñas no coinciden.": "Passwords do not match.", "Contraseña actualizada. Entrando...": "Password updated. Logging in...", "Contraseña cambiada correctamente.": "Password changed successfully.", "Tu sesion ha expirado. Vuelve a iniciar sesion.": "Your session has expired. Please log in again."};
const PATRONES = [[/^(\d+) facturas$/, '$1 invoices'], [/^([\d.,]+)% efectivo$/, '$1% effective']];
let lang = 'es';
try { if (localStorage.getItem('gestio_lang') === 'en') lang = 'en'; } catch (e) {}
const tr = s => (lang === 'en' && EN[s]) ? EN[s] : s;
const _o = new WeakMap(), _oa = new WeakMap();
function trTexto(s) {
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), k = m[2].replace(/\s+/g, ' ');
  let v = EN[k];
  if (!v) for (const [re, rep] of PATRONES) if (re.test(k)) { v = k.replace(re, rep); break; }
  return v ? m[1] + v + m[3] : s;
}
function aplicar(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue;
    if (lang === 'en') {
      if (!_o.has(n)) _o.set(n, n.nodeValue);
      const t = trTexto(_o.get(n));
      if (n.nodeValue !== t) n.nodeValue = t;
    } else if (_o.has(n)) { n.nodeValue = _o.get(n); _o.delete(n); }
  }
  document.querySelectorAll('[placeholder],[title]').forEach(el => {
    const o = _oa.get(el) || {};
    ['placeholder', 'title'].forEach(a => {
      if (!el.hasAttribute(a)) return;
      if (lang === 'en') { if (!(a in o)) o[a] = el.getAttribute(a); el.setAttribute(a, trTexto(o[a])); }
      else if (a in o) el.setAttribute(a, o[a]);
    });
    _oa.set(el, o);
  });
}
function setLang(l) {
  lang = l;
  try { localStorage.setItem('gestio_lang', l); } catch (e) {}
  document.documentElement.lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  aplicar(document.body);
  try { renderizar(allRecords); } catch (e) {}   // redibuja el grafico con el idioma nuevo
}
window.setLang = setLang;
function montarSelector() {
  const mk = () => { const d = document.createElement('div'); d.className = 'lang-sw';
    d.innerHTML = '<button class="lang-btn" data-lang="es">ES</button><button class="lang-btn" data-lang="en">EN</button>'; return d; };
  document.querySelectorAll('.hdr-right').forEach(h => h.prepend(mk()));
  const nav = document.querySelector('#page-landing nav > div:last-child'); if (nav) nav.prepend(mk());
  ['page-login', 'page-forgot', 'page-newpass', 'page-reg', 'page-setup'].forEach(id => {
    const p = document.getElementById(id); if (p) { const d = mk(); d.classList.add('lang-fixed'); p.appendChild(d); } });
  document.addEventListener('click', e => { const b = e.target.closest('.lang-btn'); if (b) setLang(b.dataset.lang); });
}
montarSelector();
document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
if (lang === 'en') aplicar(document.body);
let _tm;
new MutationObserver(() => { if (lang !== 'en') return; clearTimeout(_tm); _tm = setTimeout(() => aplicar(document.body), 30); })
  .observe(document.body, { childList: true, subtree: true, characterData: true });

const sb     = createClient(SURL, SANON);

// Llama al backend adjuntando el token de la sesion de Supabase.
// getSession() renueva el token solo si ya expiro.
async function authFetch(url, opts = {}) {
  const { data: { session } } = await sb.auth.getSession();
  const headers = { ...(opts.headers || {}) };
  if (session && session.access_token) headers['Authorization'] = 'Bearer ' + session.access_token;
  return fetch(url, { ...opts, headers });
}

let currentUser=null,clienteConfig=null,allRecords=[],chatAbierto=false,archivoSel=null,archivosSeleccionados=[];
let chartMes=null,chartCat=null,todosClientes=[];
const COLORS={materia_prima:'#c8a96e',suministros:'#5b8dee',servicios:'#9b7fe8',alquiler:'#4caf82',personal:'#e05a4e',mantenimiento:'#e8865a',otros:'#7a7875'};

function show(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');}
function fmt(n){return Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtE(n){return fmt(n)+' \u20ac';}
function ahora(){return new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});}
function showErr(id,msg){const el=document.getElementById(id);el.textContent=msg;el.style.display='block';}
function hideEl(id){document.getElementById(id).style.display='none';}
function showOk(id,msg){const el=document.getElementById(id);el.textContent=msg;el.style.display='block';}
function tiempoRel(ts){
  if(!ts)return 'Nunca';
  const d=Date.now()-new Date(ts).getTime(),m=Math.floor(d/60000),h=Math.floor(d/3600000),dias=Math.floor(d/86400000);
  if(m<2)return 'Ahora';if(m<60)return 'Hace '+m+'m';if(h<24)return 'Hace '+h+'h';if(dias<7)return 'Hace '+dias+'d';
  return new Date(ts).toLocaleDateString('es-ES',{day:'2-digit',month:'short'});
}
window.show=show;

document.addEventListener('click',function(e){const btn=e.target.closest('[data-goto]');if(!btn)return;show(btn.dataset.goto);});


document.getElementById('login-btn').addEventListener('click',async function(){
  hideEl('login-err');
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-pass').value;
  if(!email||!pass){showErr('login-err','Rellena email y contraseña.');return;}
  this.disabled=true;this.textContent='Entrando...';
  try{
    const{data,error}=await sb.auth.signInWithPassword({email,password:pass});
    if(error)throw error;
    await iniciarSesion(data.user);
  }catch(e){showErr('login-err',e.message==='Invalid login credentials'?'Email o contraseña incorrectos.':e.message);}
  finally{this.disabled=false;this.textContent='Entrar';}
});

document.getElementById('reg-btn').addEventListener('click',async function(){
  hideEl('reg-err');
  const neg=document.getElementById('reg-neg').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  if(!neg||!email||!pass){showErr('reg-err','Rellena todos los campos.');return;}
  if(pass.length<6){showErr('reg-err','Contraseña minimo 6 caracteres.');return;}
  this.disabled=true;this.textContent='Creando...';
  try{
    const{data,error}=await sb.auth.signUp({email,password:pass,options:{data:{nombre_negocio:neg}}});
    if(error)throw error;
    if(data.user){
      await sb.from('clientes').insert({user_id:data.user.id,email,nombre_negocio:neg,plan:'basico'});
      showOk('reg-ok','Cuenta creada! Entrando...');
      setTimeout(async()=>{await iniciarSesion(data.user);mostrarBienvenida();},1000);
    }
  }catch(e){showErr('reg-err',e.message||'Error al crear la cuenta.');}
  finally{this.disabled=false;this.textContent='Crear cuenta gratis';}
});

document.getElementById('go-reg').addEventListener('click',()=>show('page-reg'));
document.getElementById('go-login2').addEventListener('click',()=>show('page-login'));
document.getElementById('go-forgot').addEventListener('click',()=>show('page-forgot'));
document.getElementById('go-login3').addEventListener('click',()=>show('page-login'));

async function logout(){await sb.auth.signOut();currentUser=null;clienteConfig=null;allRecords=[];show('page-login');}
document.getElementById('dash-logout').addEventListener('click',logout);
document.getElementById('setup-logout').addEventListener('click',logout);
document.getElementById('admin-logout').addEventListener('click',logout);

document.getElementById('forgot-btn').addEventListener('click',async function(){
  hideEl('forgot-err');
  const email=document.getElementById('forgot-email').value.trim();
  if(!email){showErr('forgot-err','Introduce tu email.');return;}
  this.disabled=true;this.textContent='Enviando...';
  try{
    const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:'https://cintojuanignacio-jpg.github.io/Gestio2/'});
    if(error)throw error;
    showOk('forgot-ok','Email enviado. Revisa tu bandeja.');
  }catch(e){showErr('forgot-err',e.message||'Error al enviar.');}
  finally{this.disabled=false;this.textContent='Enviar enlace';}
});

document.getElementById('newpass-btn').addEventListener('click',async function(){
  hideEl('newpass-err');
  const pass=document.getElementById('newpass-pass').value;
  const pass2=document.getElementById('newpass-pass2').value;
  if(!pass||!pass2){showErr('newpass-err','Rellena los dos campos.');return;}
  if(pass.length<6){showErr('newpass-err','Minimo 6 caracteres.');return;}
  if(pass!==pass2){showErr('newpass-err','Las contraseñas no coinciden.');return;}
  this.disabled=true;this.textContent='Guardando...';
  try{
    const{error}=await sb.auth.updateUser({password:pass});
    if(error)throw error;
    showOk('newpass-ok','Contraseña actualizada. Entrando...');
    setTimeout(async()=>{
      const{data:{session}}=await sb.auth.getSession();
      if(session?.user)await iniciarSesion(session.user);else show('page-login');
    },1500);
  }catch(e){showErr('newpass-err',e.message||'Error.');}
  finally{this.disabled=false;this.textContent='Guardar contraseña';}
});

const hashParams=new URLSearchParams(window.location.hash.replace('#','?'));
if(hashParams.get('type')==='recovery')show('page-newpass');

async function iniciarSesion(user){
  currentUser=user;
  if(user.email===ADMIN){await cargarAdmin();show('page-admin');return;}
  const{data}=await sb.from('clientes').select('*').eq('user_id',user.id).single();
  clienteConfig=data;
  document.getElementById('dash-user').textContent=data?.nombre_negocio||user.email.split('@')[0];
  document.getElementById('setup-email').textContent=user.email;
  try{await sb.rpc('actualizar_ultimo_acceso',{p_user_id:user.id});}catch(e){}
  await cargarDashboard();
  show('page-dash');
}

document.getElementById('setup-btn').addEventListener('click',async function(){
  const telegram=document.getElementById('setup-telegram').value.trim();
  this.disabled=true;this.textContent='Guardando...';
  try{
    const{error}=await sb.from('clientes').update({telegram_chat_id:telegram||null}).eq('user_id',currentUser.id);
    if(error)throw error;
    clienteConfig={...clienteConfig,telegram_chat_id:telegram};
    await cargarDashboard();show('page-dash');
  }catch(e){showErr('setup-err',e.message||'Error al guardar.');}
  finally{this.disabled=false;this.textContent='Empezar';}
});

async function cargarDashboard(){
  if(!currentUser)return;
  try{
    const{data,error}=await sb.from('facturas')
      .select('*')
      .eq('user_id',currentUser.id)
      .eq('eliminada',false)
      .order('fecha',{ascending:false});
    if(error)throw error;
    allRecords=(data||[]).map(r=>({
      'Fecha':r.fecha||'',
      'Proveedor':r.proveedor||'',
      'Descripcion':r.descripcion||'',
      'Categoria':r.categoria||'otros',
      'Base Imponible (€)':parseFloat(r.base_imponible)||0,
      'IVA %':parseFloat(r.iva_pct)||21,
      'Cuota IVA (€)':parseFloat(r.cuota_iva)||0,
      'Total (€)':parseFloat(r.total)||0,
      'Estado':r.estado||'pendiente',
      'Confianza IA (%)':parseFloat(r.confianza_ia)||0,
      'Canal':r.canal||'web',
      'id':r.id
    }));
  }catch(e){console.error('Error cargando facturas:',e);allRecords=[];}
  renderizar(allRecords);
}
window.cargarDashboard=cargarDashboard;

function filtrarPeriodo(r){
  const v=document.getElementById('periodSel').value;
  const hoy=new Date();
  return r.filter(x=>{
    const f=new Date(x['Fecha']);if(isNaN(f))return true;
    if(v==='all')return true;
    if(v==='custom'){
      const desde=document.getElementById('fechaDesde').value;
      const hasta=document.getElementById('fechaHasta').value;
      if(desde&&f<new Date(desde))return false;
      if(hasta&&f>new Date(hasta+'T23:59:59'))return false;
      return true;
    }
    const n=parseInt(v);
    if(n===0)return f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();
    if(n===1){const p=new Date(hoy.getFullYear(),hoy.getMonth()-1,1);return f>=p&&f<new Date(hoy.getFullYear(),hoy.getMonth(),1);}
    const d=new Date(hoy);d.setMonth(d.getMonth()-n);return f>=d;
  });
}
function cambiarPeriodo(){
  const v=document.getElementById('periodSel').value;
  const customDiv=document.getElementById('customRange');
  if(v==='custom'){
    customDiv.style.display='flex';
    // Set defaults: from 1 year ago to today
    if(!document.getElementById('fechaDesde').value){
      const d=new Date();d.setFullYear(d.getFullYear()-1);
      document.getElementById('fechaDesde').value=d.toISOString().split('T')[0];
    }
    if(!document.getElementById('fechaHasta').value){
      document.getElementById('fechaHasta').value=new Date().toISOString().split('T')[0];
    }
  } else {
    customDiv.style.display='none';
  }
  renderizar(allRecords);
}
window.cambiarPeriodo=cambiarPeriodo;
function renderizar(todos){const f=filtrarPeriodo(todos);renderKPIs(f);renderCharts(f,todos);renderIVA(f);renderTabla(f);}

function renderKPIs(r){
  const a=r.filter(x=>x['Estado']?.toLowerCase()!=='rechazada');
  const tG=a.reduce((s,x)=>s+parseFloat(x['Total (€)']||0),0);
  const tB=a.reduce((s,x)=>s+parseFloat(x['Base Imponible (€)']||0),0);
  const tI=a.reduce((s,x)=>s+parseFloat(x['Cuota IVA (€)']||0),0);
  const pend=a.filter(x=>x['Estado']?.toLowerCase()==='pendiente').length;
  document.getElementById('kpiGrid').innerHTML=
    '<div class="kpi" style="--c:#c8a96e"><div class="kpi-l">Total gastos</div><div class="kpi-v">'+fmtE(tG)+'</div><div class="kpi-s">'+a.length+' facturas</div></div>'+
    '<div class="kpi" style="--c:#5b8dee"><div class="kpi-l">Base imponible</div><div class="kpi-v">'+fmtE(tB)+'</div><div class="kpi-s">Sin IVA</div></div>'+
    '<div class="kpi" style="--c:#9b7fe8"><div class="kpi-l">IVA soportado</div><div class="kpi-v">'+fmtE(tI)+'</div><div class="kpi-s">'+(tB>0?(tI/tB*100).toFixed(1):0)+'% efectivo</div></div>'+
    '<div class="kpi" style="--c:'+(pend>0?'#e05a4e':'#4caf82')+'"><div class="kpi-l">Pendientes</div><div class="kpi-v">'+pend+'</div><div class="kpi-s '+(pend>0?'dn':'up')+'">'+(pend>0?'Requieren atencion':'Todo verificado')+'</div></div>';
}

function renderCharts(f,todos){
  // Destroy and clear canvas
  if(chartMes){try{chartMes.destroy();}catch(e){} chartMes=null;}
  if(chartCat){try{chartCat.destroy();}catch(e){} chartCat=null;}
  const canvasMes=document.getElementById('chartMes');
  const canvasCat=document.getElementById('chartCat');
  if(canvasMes){const ctx=canvasMes.getContext('2d');ctx.clearRect(0,0,canvasMes.width,canvasMes.height);}
  if(canvasCat){const ctx=canvasCat.getContext('2d');ctx.clearRect(0,0,canvasCat.width,canvasCat.height);}
  const hoy=new Date(),meses=[],gastos=[],ivas=[];
  const nM=chartRango>0?chartRango:mesesDesdePrimera(todos);for(let i=nM-1;i>=0;i--){
    const d=new Date(hoy.getFullYear(),hoy.getMonth()-i,1);
    meses.push(d.toLocaleDateString(lang==='en'?'en-GB':'es-ES',{month:'short',year:'2-digit'}));
    const regs=todos.filter(r=>{const fe=new Date(r['Fecha']);return fe.getMonth()===d.getMonth()&&fe.getFullYear()===d.getFullYear()&&r['Estado']?.toLowerCase()!=='rechazada';});
    gastos.push(regs.reduce((s,r)=>s+parseFloat(r['Total (€)']||0),0));
    ivas.push(regs.reduce((s,r)=>s+parseFloat(r['Cuota IVA (€)']||0),0));
  }
  chartMes=new Chart(document.getElementById('chartMes'),{type:'bar',data:{labels:meses,datasets:[{label:tr('Gastos'),data:gastos,backgroundColor:'rgba(200,169,110,.7)',borderRadius:5,borderSkipped:false},{label:tr('IVA'),data:ivas,backgroundColor:'rgba(91,141,238,.5)',borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+fmtE(c.raw)}}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#7a7875',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#7a7875',font:{size:10},callback:v=>v>=1000?(v/1000).toFixed(0)+'k':v}}}}});
  const catD={};
  f.filter(r=>r['Estado']?.toLowerCase()!=='rechazada').forEach(r=>{const c=r['Categoria']||'otros';catD[c]=(catD[c]||0)+parseFloat(r['Total (€)']||0);});
  const cats=Object.keys(catD),tots=Object.values(catD),cols=cats.map(c=>COLORS[c]||'#7a7875');
  chartCat=new Chart(document.getElementById('chartCat'),{type:'doughnut',data:{labels:cats.map(c=>c.replace('_',' ')),datasets:[{data:tots,backgroundColor:cols,borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:true,cutout:'66%',plugins:{legend:{position:'bottom',labels:{color:'#7a7875',font:{size:10},padding:10,boxWidth:9,boxHeight:9}},tooltip:{callbacks:{label:c=>' '+c.label+': '+fmtE(c.raw)}}}}});
}

function renderIVA(r){
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

function renderTabla(r){
  if(!r.length){document.getElementById('tablaWrap').innerHTML='<div style="padding:40px;text-align:center;color:#7a7875">Sin facturas en este periodo</div>';return;}
  const sorted=[...r].sort((a,b)=>new Date(b['Fecha'])-new Date(a['Fecha']));
  let rows='';
  sorted.forEach(row=>{
    const estado=row['Estado']?.toLowerCase()==='verificada'?'p-ok':'p-pend';
    rows+='<tr>'+
      '<td class="td-m">'+(row['Fecha']||'-')+'</td>'+
      '<td><strong>'+(row['Proveedor']||'-')+'</strong></td>'+
      '<td><span class="pill p-cat">'+(row['Categoria']||'otros').replace('_',' ')+'</span></td>'+
      '<td style="text-align:right">'+fmt(row['Base Imponible (€)']||0)+'</td>'+
      '<td class="td-m">'+(row['IVA %']||21)+'%</td>'+
      '<td style="text-align:right"><strong>'+fmtE(row['Total (€)']||0)+'</strong></td>'+
      '<td><span class="pill '+estado+'">'+(row['Estado']||'pendiente')+'</span></td>'+
      '<td><button data-factura-id="'+row['id']+'" data-proveedor="'+(row['Proveedor']||'')+'" class="btn-eliminar" style="background:none;border:none;color:#4a4845;cursor:pointer;font-size:15px;padding:2px 6px" title="Eliminar">&#x1F5D1;</button></td>'+
      '</tr>';
  });
  document.getElementById('tablaWrap').innerHTML='<table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Categoria</th><th>Base</th><th>IVA</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
}

function filtrar(){
  const q=document.getElementById('searchQ').value.toLowerCase();
  const cat=document.getElementById('catF').value;
  const est=document.getElementById('estadoF').value;
  let r=filtrarPeriodo(allRecords);
  if(q)r=r.filter(x=>(x['Proveedor']||'').toLowerCase().includes(q));
  if(cat)r=r.filter(x=>(x['Categoria']||'').toLowerCase()===cat);
  if(est)r=r.filter(x=>(x['Estado']||'').toLowerCase()===est);
  renderTabla(r);
}
window.filtrar=filtrar;

function toggleChat(){
  chatAbierto=!chatAbierto;
  document.getElementById('chatPanel').classList.toggle('open',chatAbierto);
  document.getElementById('mainEl').classList.toggle('chat-open',chatAbierto);
  if(!chatAbierto) cargarDashboard();
}
window.toggleChat=toggleChat;

function addMsg(tipo,texto){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div');d.className='msg '+tipo;
  d.innerHTML='<div class="msg-b">'+texto+'</div><div class="msg-t">'+ahora()+'</div>';
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}

function selFile(input){
  const files=Array.from(input.files);if(!files.length)return;
  archivosSeleccionados=files;
  archivoSel=files[0];
  const html=files.map(f=>'<div class="file-prev"><div class="file-icon">'+f.name.split('.').pop().toUpperCase()+'</div><span class="file-nm">'+f.name+'</span></div>').join('');
  document.getElementById('filePrev').innerHTML=html+'<span class="file-rm" onclick="quitarFile()" style="display:block;text-align:right;cursor:pointer;color:#7a7875;font-size:11px;margin-top:4px">Quitar todos</span>';
}
window.selFile=selFile;
document.getElementById('fileIn').addEventListener('change', function(){ selFile(this); });

function quitarFile(){archivoSel=null;archivosSeleccionados=[];document.getElementById('fileIn').value='';document.getElementById('filePrev').innerHTML='';}
window.quitarFile=quitarFile;

async function procesarUnArchivo(archivo) {
  const fd = new FormData();
  fd.append('archivo', archivo);
  fd.append('origen', 'web');
  const res = await authFetch(BACK+'/procesar-factura', {method:'POST', body:fd});
  if (!res.ok) {
    if (res.status === 401) return {ok:false, msg:'Tu sesion ha expirado. Vuelve a iniciar sesion.'};
    let m = '';
    try { m = (await res.json()).mensaje; } catch(e) {}
    return {ok:false, msg: m || ('Error al procesar '+archivo.name)};
  }
  const d = await res.json();
  if (d.duplicado) return {ok:false, msg:'Ya existe en el sistema.'};
  if (d.guardado || d.mensaje) return {ok:true, msg:d.mensaje||'Guardada.', datos:d.datos};
  return {ok:false, msg:d.mensaje||'Error desconocido'};
}

async function enviarChat(){
  const input=document.getElementById('chatIn');
  const texto=input.value.trim();
  if(!texto&&!archivosSeleccionados.length)return;

  if(archivosSeleccionados.length>0){
    const nombres=archivosSeleccionados.map(f=>f.name).join(', ');
    addMsg('usr', archivosSeleccionados.length===1?'Archivo: '+nombres:archivosSeleccionados.length+' archivos: '+nombres);
    input.value='';input.style.height='36px';
    const archivos=[...archivosSeleccionados];
    quitarFile();
    const typing=document.createElement('div');typing.className='msg bot';
    typing.innerHTML='<div class="typing"><span></span><span></span><span></span></div>';
    document.getElementById('chatMsgs').appendChild(typing);
    const resultados=[];
    for(const archivo of archivos){
      try{
        const r=await procesarUnArchivo(archivo);
        const num=(resultados.length+1)+') ';
        if(!r.ok){
          resultados.push(num+'<span style="color:#e8a030">No guardada</span> - '+r.msg);
        } else {
          const partes=r.msg.split(' | ');
          const proveedor=(partes[0]||'').replace('OK: ','').trim()||'?';
          const fecha=partes[1]||'';
          const total=partes[2]||'';
          const iva=partes[3]||'';
          const confianza=partes[4]||'';
          const estado=partes[5]||'Verificada';
          const color=estado==='Verificada'?'#4caf82':'#e8a030';
          resultados.push(
            num+'<strong>'+proveedor+'</strong><br>'+
            fecha+' &nbsp;|&nbsp; '+total+'<br>'+
            iva+' &nbsp;|&nbsp; '+confianza+' &nbsp;|&nbsp; '+
            '<span style="color:'+color+'">'+estado+'</span>'
          );
        }
      }
      catch(e){resultados.push(archivo.name+': Error al procesar');}
    }
    typing.remove();
    addMsg('bot',resultados.join('<br><br><br>'));


    await cargarDashboard();
  } else {
    addMsg('usr',texto);
    input.value='';input.style.height='36px';
    const typing=document.createElement('div');typing.className='msg bot';
    typing.innerHTML='<div class="typing"><span></span><span></span><span></span></div>';
    document.getElementById('chatMsgs').appendChild(typing);
    let resp='';
    try{
      const res=await authFetch(BACK+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensaje:texto})});
      resp=res.ok?(await res.json()).respuesta:respLocal(texto);
    }catch(e){resp=respLocal(texto);}
    typing.remove();addMsg('bot',resp);
  }
}
window.enviarChat=enviarChat;

function respLocal(t){
  t=t.toLowerCase();
  if(t.includes('resumen')||t.includes('gasto')){const a=filtrarPeriodo(allRecords).filter(r=>r['Estado']?.toLowerCase()!=='rechazada');return 'Total: '+fmtE(a.reduce((s,r)=>s+parseFloat(r['Total (€)']||0),0))+' - '+a.length+' facturas';}
  if(t.includes('iva')){const a=filtrarPeriodo(allRecords).filter(r=>r['Estado']?.toLowerCase()!=='rechazada');return 'IVA soportado: '+fmtE(a.reduce((s,r)=>s+parseFloat(r['Cuota IVA (€)']||0),0));}
  if(t.includes('pendiente')){const p=filtrarPeriodo(allRecords).filter(r=>r['Estado']?.toLowerCase()==='pendiente');return p.length?p.length+' pendientes.':'Sin pendientes.';}
  return 'Puedo ayudarte con: resumen, IVA, pendientes o sube una factura.';
}

async function cargarAdmin(){
  const{data:clientes}=await sb.from('clientes').select('*').order('creado_en',{ascending:false});
  todosClientes=clientes||[];
  renderAdmin(todosClientes);
  await cargarTicketsAdmin();
  await cargarLogsAdmin();
}

async function cargarTicketsAdmin(){
  try{
    const res=await authFetch(BACK+'/admin/tickets');
    if(!res.ok)return;
    const d=await res.json();
    const tickets=d.tickets||[];
    const cont=document.getElementById('adminTickets');
    if(!cont)return;
    if(!tickets.length){cont.innerHTML='<div style="padding:20px;text-align:center;color:#7a7875">Sin tickets</div>';return;}
    const priorColor={'urgente':'#e05a4e','alta':'#e8a030','normal':'#5b8dee','baja':'#7a7875'};
    const estadoColor={'abierto':'#e05a4e','en_progreso':'#e8a030','resuelto':'#4caf82'};
    cont.innerHTML='<table><thead><tr><th>Fecha</th><th>Cliente</th><th>Asunto</th><th>Prioridad</th><th>Estado</th><th></th></tr></thead><tbody>'+
      tickets.map(t=>'<tr>'+
        '<td class="td-m">'+(t.creado_en||'').split('T')[0]+'</td>'+
        '<td><div style="font-weight:500">'+(t.negocio||'-')+'</div><div class="td-m">'+t.email+'</div></td>'+
        '<td>'+(t.asunto||'-')+'<br><span class="td-m">'+(t.descripcion||'').substring(0,60)+'...</span></td>'+
        '<td><span class="pill" style="background:rgba(0,0,0,.2);color:'+(priorColor[t.prioridad]||'#7a7875')+'">'+(t.prioridad||'normal')+'</span></td>'+
        '<td><span class="pill" style="background:rgba(0,0,0,.2);color:'+(estadoColor[t.estado]||'#7a7875')+'">'+(t.estado||'abierto')+'</span></td>'+
        '<td><button data-ticket-id="'+t.id+'" class="btn-ticket" style="background:none;border:1px solid rgba(255,255,255,.15);color:#7a7875;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px">Gestionar</button></td>'+
        '</tr>').join('')+
      '</tbody></table>';
  }catch(e){console.error('Error cargando tickets:',e);}
}

async function cargarLogsAdmin(){
  try{
    const res=await authFetch(BACK+'/admin/logs');
    if(!res.ok)return;
    const d=await res.json();
    const logs=d.logs||[];
    const cont=document.getElementById('adminLogs');
    if(!cont)return;
    if(!logs.length){cont.innerHTML='<div style="padding:20px;text-align:center;color:#7a7875">Sin logs</div>';return;}
    const accionColor={'procesada':'#4caf82','duplicada':'#e8a030','eliminada':'#e05a4e','error':'#e05a4e'};
    cont.innerHTML='<table><thead><tr><th>Fecha</th><th>Archivo</th><th>Accion</th><th>Proveedor</th><th>Total</th><th>Confianza</th></tr></thead><tbody>'+
      logs.map(l=>'<tr>'+
        '<td class="td-m">'+(l.creado_en||'').replace('T',' ').split('.')[0]+'</td>'+
        '<td class="td-m">'+(l.nombre_archivo||'-')+'</td>'+
        '<td><span class="pill" style="background:rgba(0,0,0,.2);color:'+(accionColor[l.accion]||'#7a7875')+'">'+(l.accion||'-')+'</span></td>'+
        '<td>'+(l.proveedor||'-')+'</td>'+
        '<td>'+(l.total?l.total+' EUR':'-')+'</td>'+
        '<td>'+(l.confianza_ia?l.confianza_ia+'%':'-')+'</td>'+
        '</tr>').join('')+
      '</tbody></table>';
  }catch(e){console.error('Error cargando logs:',e);}
}

async function responderTicket(id){
  const resp=prompt('Respuesta para el ticket:');
  if(!resp)return;
  const estado=confirm('Marcar como resuelto?')?'resuelto':'en_progreso';
  try{
    const res=await authFetch(BACK+'/admin/tickets/'+id,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({respuesta:resp,estado,respondido_en:new Date().toISOString()})
    });
    if(res.ok){alert('Ticket actualizado.');await cargarTicketsAdmin();}
  }catch(e){alert('Error al actualizar.');}
}
window.responderTicket=responderTicket;



function renderAdmin(lista){
  const act=lista.filter(c=>c.activo),nuevos=lista.filter(c=>c.creado_en&&(Date.now()-new Date(c.creado_en).getTime())<30*86400000);
  const totalF=lista.reduce((s,c)=>s+(c.total_facturas||0),0),conSheet=lista.filter(c=>c.google_sheet_id);
  document.getElementById('adminKpis').innerHTML=
    '<div class="kpi" style="--c:#c8a96e"><div class="kpi-l">Total clientes</div><div class="kpi-v">'+lista.length+'</div><div class="kpi-s">'+nuevos.length+' nuevos este mes</div></div>'+
    '<div class="kpi" style="--c:#4caf82"><div class="kpi-l">Activos</div><div class="kpi-v" style="color:#4caf82">'+act.length+'</div><div class="kpi-s">'+(lista.length-act.length)+' pausados</div></div>'+
    '<div class="kpi" style="--c:#5b8dee"><div class="kpi-l">Facturas procesadas</div><div class="kpi-v">'+totalF+'</div><div class="kpi-s">Total historico</div></div>'+
    '<div class="kpi" style="--c:#9b7fe8"><div class="kpi-l">Con Sheet</div><div class="kpi-v">'+conSheet.length+'</div><div class="kpi-s">Configurados</div></div>';
  const inact=lista.filter(c=>c.activo&&c.ultimo_acceso&&(Date.now()-new Date(c.ultimo_acceso).getTime())>7*86400000);
  let al='';
  if(inact.length)al+='<div class="alert-box alert-warn">'+inact.length+' cliente(s) sin actividad +7 dias.</div>';
  document.getElementById('adminAlertas').innerHTML=al;
  if(!lista.length){document.getElementById('adminClientes').innerHTML='<div style="padding:40px;text-align:center;color:#7a7875">Sin clientes todavia</div>';return;}
  let rows='';
  lista.forEach(c=>{
    const in7=c.activo&&c.ultimo_acceso&&(Date.now()-new Date(c.ultimo_acceso).getTime())>7*86400000;
    const ep=c.total_facturas>0?Math.round((c.facturas_error||0)/c.total_facturas*100):0;
    rows+='<tr>'+
      '<td><div style="display:flex;align-items:center;gap:10px"><div class="c-avatar">'+((c.nombre_negocio||c.email)[0].toUpperCase())+'</div>'+
      '<div><div style="font-weight:500">'+(c.nombre_negocio||'-')+'</div><div class="td-m">'+c.email+'</div></div></div></td>'+
      '<td><span class="pill '+(c.plan==='pro'?'p-ok':'p-pend')+'">'+c.plan+'</span></td>'+
      '<td><div style="font-weight:600">'+(c.total_facturas||0)+'</div>'+(ep>0?'<div class="td-m" style="color:#e05a4e">'+ep+'% errores</div>':'<div class="td-m" style="color:#4caf82">Sin errores</div>')+'</td>'+
      '<td><div style="'+(in7?'color:#e8a030':'')+'">'+tiempoRel(c.ultimo_acceso)+'</div>'+(c.ultima_factura?'<div class="td-m">Ult: '+tiempoRel(c.ultima_factura)+'</div>':'')+'</td>'+
      '<td>'+(c.telegram_chat_id?'<span class="tag tag-tg">Telegram</span>':'<span class="tag tag-web">Web</span>')+'</td>'+
      '<td><span class="pill '+(c.activo?'p-ok':'p-pend')+'">'+(c.activo?'activo':'pausado')+'</span></td>'+
      '<td><button data-cid="'+c.id+'" style="background:none;border:1px solid rgba(255,255,255,.15);color:#7a7875;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px">Gestionar</button></td>'+
      '</tr>';
  });
  document.getElementById('adminClientes').innerHTML='<table><thead><tr><th>Cliente</th><th>Plan</th><th>Facturas</th><th>Ultimo acceso</th><th>Canal</th><th>Estado</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
}

document.addEventListener('click',function(e){
  const btn=e.target.closest('[data-cid]');
  if(btn)abrirCliente(btn.dataset.cid);
});

function filtrarAdmin(){
  const q=document.getElementById('adminSearch').value.toLowerCase();
  const plan=document.getElementById('adminPlan').value;
  const estado=document.getElementById('adminEstado').value;
  let l=todosClientes;
  if(q)l=l.filter(c=>(c.nombre_negocio||'').toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q));
  if(plan)l=l.filter(c=>c.plan===plan);
  if(estado==='activo')l=l.filter(c=>c.activo);
  if(estado==='pausado')l=l.filter(c=>!c.activo);
  if(estado==='inactivo')l=l.filter(c=>c.activo&&c.ultimo_acceso&&(Date.now()-new Date(c.ultimo_acceso).getTime())>7*86400000);
  renderAdmin(l);
}
window.filtrarAdmin=filtrarAdmin;

function abrirCliente(id){
  const c=todosClientes.find(x=>x.id===id);if(!c)return;
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
    '<div class="modal-actions" id="modal-actions-'+c.id+'">'+
    '<button id="btn-guardar" style="background:#c8a96e;color:#1a1208;border:none;padding:8px 16px;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer">Guardar</button>'+
    '<button id="btn-toggle" style="background:'+(c.activo?'rgba(224,90,78,.15)':'rgba(76,175,130,.15)')+';border:.5px solid '+(c.activo?'rgba(224,90,78,.4)':'rgba(76,175,130,.4)')+';color:'+(c.activo?'#e05a4e':'#4caf82')+';padding:8px 16px;border-radius:7px;font-size:13px;cursor:pointer">'+(c.activo?'Pausar':'Activar')+'</button>'+
    '<button id="btn-cancelar" style="background:transparent;border:1px solid rgba(255,255,255,.15);color:#7a7875;padding:8px 16px;border-radius:7px;font-size:13px;cursor:pointer">Cancelar</button>'+
    '</div>';
  document.getElementById('modalCliente').style.display='flex';
  document.getElementById('btn-guardar').onclick=()=>guardarCliente(c.id);
  document.getElementById('btn-toggle').onclick=()=>toggleActivo(c.id,!c.activo);
  document.getElementById('btn-cancelar').onclick=cerrarModal;
}
window.abrirCliente=abrirCliente;

function cerrarModal(){document.getElementById('modalCliente').style.display='none';}
window.cerrarModal=cerrarModal;

async function guardarCliente(id){
  const plan=document.getElementById('modal-plan').value;
  const sheetId=document.getElementById('modal-sheet').value.trim();
  const tg=document.getElementById('modal-tg').value.trim();
  const{error}=await sb.from('clientes').update({plan,google_sheet_id:sheetId||null,telegram_chat_id:tg||null}).eq('id',id);
  if(error){alert('Error: '+error.message);return;}
  cerrarModal();await cargarAdmin();
}
window.guardarCliente=guardarCliente;

async function toggleActivo(id,nuevoEstado){
  const{error}=await sb.from('clientes').update({activo:nuevoEstado}).eq('id',id);
  if(error){alert('Error: '+error.message);return;}
  cerrarModal();await cargarAdmin();
}
window.toggleActivo=toggleActivo;

document.getElementById('admin-export').addEventListener('click',function(){
  const cols=['nombre_negocio','email','plan','activo','total_facturas','facturas_mes','ultimo_acceso','creado_en'];
  const csv=[cols.join(','),...todosClientes.map(c=>cols.map(k=>JSON.stringify(c[k]!==undefined?c[k]:'')).join(','))].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='gestio_'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
});

function generarEjemplo(){
  const hoy=new Date(),datos=[],provs=[
    {n:'Makro Espana',cat:'materia_prima',iva:10,min:400,max:900},
    {n:'Endesa Energia',cat:'suministros',iva:21,min:200,max:400},
    {n:'Cafes La Estrella',cat:'materia_prima',iva:4,min:150,max:300},
    {n:'Mercado Central',cat:'materia_prima',iva:4,min:50,max:150},
    {n:'Gestoria Lopez',cat:'servicios',iva:21,min:100,max:200}
  ];
  for(let mes=5;mes>=0;mes--){
    const d=new Date(hoy.getFullYear(),hoy.getMonth()-mes,1);
    for(let i=0;i<4+Math.floor(Math.random()*4);i++){
      const p=provs[Math.floor(Math.random()*provs.length)];
      const base=Math.round((p.min+Math.random()*(p.max-p.min))*100)/100;
      const cuota=Math.round(base*p.iva)/100;
      const fecha=new Date(d.getFullYear(),d.getMonth(),1+Math.floor(Math.random()*26));
      datos.push({'Fecha':fecha.toISOString().split('T')[0],'Proveedor':p.n,'Categoria':p.cat,'Base Imponible (€)':base,'IVA %':p.iva,'Cuota IVA (€)':cuota,'Total (€)':Math.round((base+cuota)*100)/100,'Estado':Math.random()>0.2?'verificada':'pendiente'});
    }
  }
  return datos;
}

const{data:{session}}=await sb.auth.getSession();
if(session?.user) await iniciarSesion(session.user);
else show('page-landing');


// ── PERFIL ─────────────────────────────────────────
function abrirPerfil() {
  if (!currentUser || !clienteConfig) return;
  
  // Cargar datos en el formulario
  document.getElementById('p-negocio').value   = clienteConfig.nombre_negocio || '';
  document.getElementById('p-tipo').value       = clienteConfig.tipo_negocio   || 'comercio';
  document.getElementById('p-email').value      = currentUser.email || '';
  document.getElementById('p-telefono').value   = clienteConfig.telefono        || '';
  document.getElementById('p-telegram').value   = clienteConfig.telegram_chat_id || '';

  // Avatar
  const inicial = (clienteConfig.nombre_negocio || currentUser.email)[0].toUpperCase();
  const avatarEl = document.getElementById('perfil-avatar');
  if (clienteConfig.avatar_url) {
    avatarEl.innerHTML = '<img src="'+clienteConfig.avatar_url+'" style="width:80px;height:80px;border-radius:50%;object-fit:cover">';
  } else {
    avatarEl.textContent = inicial;
  }

  // Header del perfil
  document.getElementById('perfil-nombre-display').textContent = clienteConfig.nombre_negocio || currentUser.email;
  document.getElementById('perfil-email-display').textContent  = currentUser.email;
  document.getElementById('perfil-plan-display').innerHTML     = '<span class="pill '+(clienteConfig.plan==='pro'?'p-ok':'p-pend')+'">Plan '+(clienteConfig.plan||'basico')+'</span>';

  // Plan actual
  const precio = clienteConfig.plan === 'pro' ? '59' : '29';
  document.getElementById('plan-actual-info').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:#1e1e21;border-radius:8px">'+
    '<div><div style="font-weight:600">Plan '+(clienteConfig.plan||'basico').charAt(0).toUpperCase()+(clienteConfig.plan||'basico').slice(1)+'</div>'+
    '<div style="font-size:12px;color:#7a7875;margin-top:2px">'+precio+' EUR/mes</div></div>'+
    '<span class="pill '+(clienteConfig.plan==='pro'?'p-ok':'p-pend')+'">Activo</span>'+
    '</div>'+
    '<div style="font-size:12px;color:#7a7875;margin-top:12px">Para cambiar de plan contacta con soporte. La integracion con Stripe estara disponible proximamente.</div>';

  // Resaltar plan actual
  document.getElementById('plan-basico-card').style.borderColor = clienteConfig.plan==='basico' ? '#c8a96e' : 'rgba(255,255,255,0.07)';
  document.getElementById('plan-pro-card').style.borderColor    = clienteConfig.plan==='pro'    ? '#c8a96e' : 'rgba(255,255,255,0.07)';

  show('page-perfil');
}
window.abrirPerfil = abrirPerfil;

function switchTab(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.style.display='none');
  btn.classList.add('active');
  document.getElementById('tab-'+btn.dataset.tab).style.display='block';
  if (btn.dataset.tab === 'sistema') { cargarMisTickets(); setTimeout(() => generarQR('qr-perfil'), 100); }
}
window.switchTab = switchTab;

function cambiarAvatar(input) {
  const f = input.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('perfil-avatar').innerHTML = '<img src="'+e.target.result+'" style="width:80px;height:80px;border-radius:50%;object-fit:cover">';
  };
  reader.readAsDataURL(f);
}
window.cambiarAvatar = cambiarAvatar;

document.getElementById('perfil-back').addEventListener('click', () => { show('page-dash'); });
document.getElementById('perfil-logout').addEventListener('click', logout);

document.getElementById('btn-guardar-basicos').addEventListener('click', async function() {
  hideEl('basicos-err'); hideEl('basicos-ok');
  const negocio  = document.getElementById('p-negocio').value.trim();
  const tipo     = document.getElementById('p-tipo').value;
  const telefono = document.getElementById('p-telefono').value.trim();
  const email    = document.getElementById('p-email').value.trim();
  if (!negocio) { showErr('basicos-err','El nombre del negocio es obligatorio.'); return; }
  this.disabled=true; this.textContent='Guardando...';
  try {
    // Update Supabase clientes table
    const { error } = await sb.from('clientes').update({
      nombre_negocio: negocio, tipo_negocio: tipo, telefono: telefono||null
    }).eq('user_id', currentUser.id);
    if (error) throw error;
    
    // Update email if changed
    if (email && email !== currentUser.email) {
      const { error: emailErr } = await sb.auth.updateUser({ email });
      if (emailErr) throw emailErr;
    }
    
    clienteConfig = { ...clienteConfig, nombre_negocio: negocio, tipo_negocio: tipo, telefono };
    document.getElementById('dash-user').textContent = negocio;
    document.getElementById('perfil-nombre-display').textContent = negocio;
    showOk('basicos-ok', 'Datos actualizados correctamente.');
  } catch(e) { showErr('basicos-err', e.message || 'Error al guardar.'); }
  finally { this.disabled=false; this.textContent='Guardar cambios'; }
});

document.getElementById('btn-cambiar-pass').addEventListener('click', async function() {
  hideEl('pass-err'); hideEl('pass-ok');
  const pass1 = document.getElementById('p-pass1').value;
  const pass2 = document.getElementById('p-pass2').value;
  if (!pass1||!pass2) { showErr('pass-err','Rellena los dos campos.'); return; }
  if (pass1.length<6)  { showErr('pass-err','Minimo 6 caracteres.'); return; }
  if (pass1!==pass2)   { showErr('pass-err','Las contraseñas no coinciden.'); return; }
  this.disabled=true; this.textContent='Cambiando...';
  try {
    const { error } = await sb.auth.updateUser({ password: pass1 });
    if (error) throw error;
    document.getElementById('p-pass1').value='';
    document.getElementById('p-pass2').value='';
    showOk('pass-ok','Contraseña cambiada correctamente.');
  } catch(e) { showErr('pass-err', e.message||'Error al cambiar la contraseña.'); }
  finally { this.disabled=false; this.textContent='Cambiar contraseña'; }
});

document.getElementById('btn-guardar-sistema').addEventListener('click', async function() {
  hideEl('sistema-err'); hideEl('sistema-ok');
  const telegram = document.getElementById('p-telegram').value.trim();
  this.disabled=true; this.textContent='Guardando...';
  try {
    const { error } = await sb.from('clientes').update({
      telegram_chat_id: telegram || null
    }).eq('user_id', currentUser.id);
    if (error) throw error;
    clienteConfig = { ...clienteConfig, telegram_chat_id: telegram };
    showOk('sistema-ok', 'Configuracion guardada correctamente.');
  } catch(e) { showErr('sistema-err', e.message || 'Error al guardar.'); }
  finally { this.disabled=false; this.textContent='Guardar'; }
});

document.getElementById('btn-plan-basico').addEventListener('click', function() {
  alert('Para cambiar al plan Basico contacta con soporte. La integracion con Stripe estara disponible proximamente.');
});
document.getElementById('btn-plan-pro').addEventListener('click', function() {
  alert('Para cambiar al plan Pro contacta con soporte. La integracion con Stripe estara disponible proximamente.');
});

// ── EXPORTAR EXCEL ──────────────────────────────────────────────────────────
async function exportarExcel() {
  if (!allRecords.length) { alert('No hay facturas para exportar.'); return; }
  
  // Build CSV with all data
  const cols = ['Fecha','Proveedor','NIF Proveedor','Numero Factura','Descripcion',
                 'Categoria','Base Imponible','IVA %','Cuota IVA','Total','Estado',
                 'Confianza IA','Canal'];
  const colMap = {
    'Fecha':'Fecha','Proveedor':'Proveedor','NIF Proveedor':'nif_proveedor',
    'Numero Factura':'numero_factura','Descripcion':'Descripcion','Categoria':'Categoria',
    'Base Imponible':'Base Imponible (€)','IVA %':'IVA %','Cuota IVA':'Cuota IVA (€)',
    'Total':'Total (€)','Estado':'Estado','Confianza IA':'Confianza IA (%)','Canal':'Canal'
  };

  const rows = [cols];
  allRecords.forEach(r => {
    rows.push(cols.map(c => {
      const v = r[colMap[c]] || r[c] || '';
      return typeof v === 'string' && v.includes(',') ? '"'+v+'"' : v;
    }));
  });

  const csv = '\uFEFF' + rows.map(r => r.join(';')).join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'gestio_facturas_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
window.exportarExcel = exportarExcel;

// ── CARGA MANUAL ────────────────────────────────────────────────────────────
function abrirModalManual() {
  // Pre-fill date with today
  document.getElementById('m-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('m-base').value = '';
  document.getElementById('m-cuota').value = '';
  document.getElementById('m-total').value = '';
  document.getElementById('m-proveedor').value = '';
  document.getElementById('m-nif').value = '';
  document.getElementById('m-numero').value = '';
  document.getElementById('m-descripcion').value = '';
  hideEl('manual-err'); hideEl('manual-ok');

  // Fill datalist with existing providers
  const proveedores = [...new Set(allRecords.map(r => r['Proveedor']).filter(Boolean))];
  document.getElementById('list-proveedores').innerHTML = 
    proveedores.map(p => '<option value="'+p+'">').join('');

  document.getElementById('m-iva').addEventListener('change', calcularIVA);
  document.getElementById('modalManual').style.display = 'flex';
}
window.abrirModalManual = abrirModalManual;

function cerrarModalManual() {
  document.getElementById('modalManual').style.display = 'none';
}
window.cerrarModalManual = cerrarModalManual;

function calcularIVA() {
  const base = parseFloat(document.getElementById('m-base').value) || 0;
  const pct  = parseFloat(document.getElementById('m-iva').value) || 0;
  const cuota = Math.round(base * pct) / 100;
  const total = Math.round((base + cuota) * 100) / 100;
  document.getElementById('m-cuota').value = cuota.toFixed(2);
  document.getElementById('m-total').value = total.toFixed(2);
}
window.calcularIVA = calcularIVA;


document.getElementById('btn-guardar-manual').addEventListener('click', async function() {
  hideEl('manual-err'); hideEl('manual-ok');
  const fecha      = document.getElementById('m-fecha').value;
  const proveedor  = document.getElementById('m-proveedor').value.trim();
  const base       = parseFloat(document.getElementById('m-base').value) || 0;
  
  if (!fecha || !proveedor || !base) {
    showErr('manual-err', 'Fecha, proveedor y base imponible son obligatorios.');
    return;
  }

  // Check duplicate
  const cuota = parseFloat(document.getElementById('m-cuota').value) || 0;
  const total  = parseFloat(document.getElementById('m-total').value) || 0;
  const dup = allRecords.some(r =>
    r['Proveedor'] === proveedor && r['Fecha'] === fecha &&
    parseFloat(r['Total (€)']) === total
  );
  if (dup) { showErr('manual-err', 'Esta factura parece duplicada (mismo proveedor, fecha y total).'); return; }

  this.disabled = true; this.textContent = 'Guardando...';
  try {
    const row = {
      user_id:       currentUser.id,
      fecha,
      proveedor,
      nif_proveedor: document.getElementById('m-nif').value.trim() || null,
      numero_factura:document.getElementById('m-numero').value.trim() || null,
      descripcion:   document.getElementById('m-descripcion').value.trim() || null,
      categoria:     document.getElementById('m-categoria').value,
      base_imponible:base,
      iva_pct:       parseFloat(document.getElementById('m-iva').value),
      cuota_iva:     cuota,
      total,
      estado:        document.getElementById('m-estado').value,
      confianza_ia:  100,
      canal:         'manual'
    };

    const { error } = await sb.from('facturas').insert(row);
    if (error) throw error;

    showOk('manual-ok', 'Factura guardada correctamente.');
    await cargarDashboard();
    setTimeout(cerrarModalManual, 1500);
  } catch(e) {
    showErr('manual-err', e.message || 'Error al guardar.');
  } finally {
    this.disabled = false; this.textContent = 'Guardar factura';
  }
});

// ── ELIMINAR FACTURA ─────────────────────────────────────────────────────────
async function eliminarFactura(id, proveedor) {
  if (!confirm('Eliminar factura de '+(proveedor||'este proveedor')+'?')) return;
  try {
    const { error } = await sb.from('facturas')
      .update({ eliminada: true, eliminada_en: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', currentUser.id);
    if (error) throw error;
    await cargarDashboard();
  } catch(e) {
    console.error('Error eliminando:', e);
    alert('Error al eliminar: ' + (e.message||'intenta de nuevo'));
  }
}
window.eliminarFactura = eliminarFactura;

// Event delegation for delete buttons
document.addEventListener('click', async function(e) {
  const btn = e.target.closest('.btn-eliminar');
  if (!btn) return;
  const id = btn.dataset.facturaId;
  const proveedor = btn.dataset.proveedor;
  await eliminarFactura(id, proveedor);
});

// ── TICKETS DE SOPORTE ───────────────────────────────────────────────────────
function abrirTicket() {
  document.getElementById('modalTicket').style.display='flex';
  hideEl('ticket-err'); hideEl('ticket-ok');
  document.getElementById('t-asunto').value='';
  document.getElementById('t-descripcion').value='';
  document.getElementById('t-prioridad').value='normal';
}
window.abrirTicket = abrirTicket;

function cerrarTicket() { document.getElementById('modalTicket').style.display='none'; }
window.cerrarTicket = cerrarTicket;

document.getElementById('btn-enviar-ticket').addEventListener('click', async function() {
  hideEl('ticket-err'); hideEl('ticket-ok');
  const asunto = document.getElementById('t-asunto').value.trim();
  const desc   = document.getElementById('t-descripcion').value.trim();
  if (!asunto||!desc) { showErr('ticket-err','Rellena todos los campos.'); return; }
  this.disabled=true; this.textContent='Enviando...';
  try {
    const { error } = await sb.from('tickets').insert({
      user_id:     currentUser.id,
      email:       currentUser.email,
      negocio:     clienteConfig?.nombre_negocio||'',
      asunto,
      descripcion: desc,
      prioridad:   document.getElementById('t-prioridad').value
    });
    if (error) throw error;
    showOk('ticket-ok','Ticket enviado. Te responderemos pronto.');
    setTimeout(cerrarTicket, 2000);
  } catch(e) { showErr('ticket-err', e.message||'Error al enviar.'); }
  finally { this.disabled=false; this.textContent='Enviar ticket'; }
});

// ── TICKET DETAIL ADMIN ──────────────────────────────────────────────────────
let ticketActualId = null;

function abrirTicketAdmin(ticket) {
  ticketActualId = ticket.id;
  const priorColor={'urgente':'#e05a4e','alta':'#e8a030','normal':'#5b8dee','baja':'#7a7875'};
  const estadoColor={'abierto':'#e05a4e','en_progreso':'#e8a030','resuelto':'#4caf82'};
  document.getElementById('ticketAdminContent').innerHTML =
    '<div style="display:grid;gap:10px;margin-bottom:16px">'+
    '<div style="display:flex;gap:12px;flex-wrap:wrap">'+
    '<span class="pill" style="background:rgba(0,0,0,.3);color:'+(priorColor[ticket.prioridad]||'#7a7875')+'">'+ticket.prioridad+'</span>'+
    '<span class="pill" style="background:rgba(0,0,0,.3);color:'+(estadoColor[ticket.estado]||'#7a7875')+'">'+ticket.estado+'</span>'+
    '<span class="td-m">'+(ticket.creado_en||'').split('T')[0]+'</span>'+
    '</div>'+
    '<div><span style="color:#7a7875;font-size:12px">Cliente</span><div style="font-weight:500">'+ticket.negocio+'</div><div class="td-m">'+ticket.email+'</div></div>'+
    '<div><span style="color:#7a7875;font-size:12px">Asunto</span><div style="font-weight:600;font-size:15px">'+ticket.asunto+'</div></div>'+
    '<div><span style="color:#7a7875;font-size:12px">Descripcion</span><div style="line-height:1.6;white-space:pre-wrap">'+ticket.descripcion+'</div></div>'+
    (ticket.respuesta ? '<div style="background:#1e1e21;border-radius:8px;padding:12px"><span style="color:#7a7875;font-size:12px">Respuesta enviada</span><div style="margin-top:4px;line-height:1.6">'+ticket.respuesta+'</div></div>' : '')+
    '</div>';
  document.getElementById('ta-respuesta').value = ticket.respuesta || '';
  document.getElementById('modalTicketAdmin').style.display = 'flex';
}
window.abrirTicketAdmin = abrirTicketAdmin;

function cerrarTicketAdmin() { document.getElementById('modalTicketAdmin').style.display = 'none'; }
window.cerrarTicketAdmin = cerrarTicketAdmin;

async function actualizarTicket(estado) {
  if (!ticketActualId) return;
  const resp = document.getElementById('ta-respuesta').value.trim();
  try {
    const res = await authFetch(BACK+'/admin/tickets/'+ticketActualId, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ estado, respuesta: resp || null, respondido_en: new Date().toISOString() })
    });
    if (res.ok) { cerrarTicketAdmin(); await cargarTicketsAdmin(); }
    else alert('Error al actualizar el ticket.');
  } catch(e) { alert('Error de conexion.'); }
}

document.getElementById('btn-ticket-progreso').addEventListener('click', () => actualizarTicket('en_progreso'));
document.getElementById('btn-ticket-resuelto').addEventListener('click', () => actualizarTicket('resuelto'));

// Override event delegation for tickets to open modal
document.addEventListener('click', async function(e){
  const btn = e.target.closest('.btn-ticket');
  if (!btn) return;
  const id = btn.dataset.ticketId;
  // Find ticket data
  const res = await authFetch(BACK+'/admin/tickets');
  if (!res.ok) return;
  const d = await res.json();
  const ticket = (d.tickets||[]).find(t=>t.id===id);
  if (ticket) abrirTicketAdmin(ticket);
});

// ── MIS TICKETS (perfil cliente) ─────────────────────────────────────────────
async function cargarMisTickets() {
  const cont = document.getElementById('mis-tickets');
  if (!cont || !currentUser) return;
  const { data, error } = await sb.from('tickets')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('creado_en', { ascending: false });
  if (error || !data?.length) {
    cont.innerHTML = '<div style="color:#7a7875;font-size:13px">No tienes tickets abiertos. Usa el boton "Soporte" del dashboard para crear uno.</div>';
    return;
  }
  const estadoColor = {'abierto':'#e05a4e','en_progreso':'#e8a030','resuelto':'#4caf82'};
  cont.innerHTML = data.map(t =>
    '<div style="background:#1e1e21;border-radius:8px;padding:14px;margin-bottom:10px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
    '<div style="font-weight:500">'+t.asunto+'</div>'+
    '<span class="pill" style="background:rgba(0,0,0,.3);color:'+(estadoColor[t.estado]||'#7a7875')+'">'+t.estado+'</span>'+
    '</div>'+
    '<div style="font-size:12px;color:#7a7875;margin-bottom:6px">'+(t.creado_en||'').split('T')[0]+'</div>'+
    '<div style="font-size:12px;line-height:1.5;margin-bottom:8px">'+t.descripcion+'</div>'+
    (t.respuesta ? '<div style="background:#161618;border-radius:6px;padding:10px;border:.5px solid rgba(76,175,130,.3)"><div style="font-size:11px;color:#4caf82;margin-bottom:4px">Respuesta del equipo</div><div style="font-size:12px;line-height:1.5">'+t.respuesta+'</div></div>' : '<div style="font-size:11px;color:#7a7875">Pendiente de respuesta</div>')+
    '</div>'
  ).join('');
}


// ── MODAL BIENVENIDA TELEGRAM ────────────────────────────────────────────────
function mostrarBienvenida() {
  document.getElementById('modalBienvenida').style.display = 'flex';
  setTimeout(() => generarQR('qr-bienvenida'), 100);
}

function cerrarBienvenida() {
  document.getElementById('modalBienvenida').style.display = 'none';
}

document.getElementById('btn-bienvenida-saltar').addEventListener('click', cerrarBienvenida);

document.getElementById('btn-bienvenida-guardar').addEventListener('click', async function() {
  const chatId = document.getElementById('bienvenida-telegram').value.trim();
  hideEl('bienvenida-err');
  hideEl('bienvenida-ok');

  if (!chatId) {
    cerrarBienvenida();
    return;
  }

  if (!/^\d{6,12}$/.test(chatId)) {
    showErr('bienvenida-err', 'El Chat ID debe ser solo numeros (6-12 digitos).');
    return;
  }

  this.disabled = true;
  this.textContent = 'Guardando...';

  try {
    const { error } = await sb.from('clientes')
      .update({ telegram_chat_id: chatId })
      .eq('user_id', currentUser.id);
    if (error) throw error;
    clienteConfig = { ...clienteConfig, telegram_chat_id: chatId };
    showOk('bienvenida-ok', 'Telegram conectado correctamente.');
    setTimeout(cerrarBienvenida, 1500);
  } catch(e) {
    showErr('bienvenida-err', e.message || 'Error al guardar.');
    this.disabled = false;
    this.textContent = 'Guardar y empezar';
  }
});

// ── QR CODES ─────────────────────────────────────────────────────────────────
function generarQR(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const url = 'https://t.me/botgestio_bot';
  // Use Google Charts API to generate QR
  const size = el.offsetWidth || 100;
  const img = document.createElement('img');
  img.src = QR_SRC;
  img.style.cssText = 'width:100%;height:100%;border-radius:4px;display:block';
  img.alt = 'QR @botgestio_bot';
  el.innerHTML = '';
  el.appendChild(img);
}

// Generate QRs when modal opens
const _origMostrarBienvenida = typeof mostrarBienvenida === 'function' ? mostrarBienvenida : null;
