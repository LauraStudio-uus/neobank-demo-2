const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('vi-VN').format(Number(n || 0)) + ' ₫';
const clone = obj => JSON.parse(JSON.stringify(obj));
const nowText = () => new Intl.DateTimeFormat('vi-VN', {
  day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
}).format(new Date());

const STORAGE = {
  users: 'neobank_users_v3',
  audit: 'neobank_admin_audit_v3',
  theme: 'neobank_theme',
  rememberSession: 'neobank_session_user',
  session: 'neobank_session_user_tmp'
};

const DEFAULT_TRANSACTIONS = [
  {id:1,name:'Lương tháng 09',note:'Công ty Aurora Creative',amount:32500000,type:'in',date:'29/09/2026 09:05',icon:'↙'},
  {id:2,name:'Adobe Creative Cloud',note:'Thanh toán dịch vụ',amount:1320000,type:'out',date:'28/09/2026 21:14',icon:'◈'},
  {id:3,name:'Nguyễn Minh Anh',note:'Chuyen tien an toi',amount:850000,type:'out',date:'28/09/2026 18:42',icon:'↗'},
  {id:4,name:'Grab',note:'Di chuyển',amount:186000,type:'out',date:'27/09/2026 11:33',icon:'⌁'},
  {id:5,name:'Hoàn tiền Shopee',note:'Refund order #NB-1024',amount:540000,type:'in',date:'26/09/2026 16:20',icon:'↙'},
  {id:6,name:'Highlands Coffee',note:'Ăn uống',amount:89000,type:'out',date:'25/09/2026 10:15',icon:'◌'},
  {id:7,name:'Apple Store',note:'Mua phụ kiện',amount:2490000,type:'out',date:'22/09/2026 14:09',icon:'◈'}
];

const DEFAULT_USERS = [
  {
    id:'admin-001', role:'admin', status:'active', name:'Quản trị NeoBank', email:'admin@neobank.vn',
    password:'admin123', phone:'0900 111 999', accountNumber:'ADMIN001', checking:0, savings:0,
    tier:'Administrator', cardLocked:false, transactions:[]
  },
  {
    id:'user-001', role:'user', status:'active', name:'Lê Thành Đạt', email:'demo@neobank.vn',
    password:'123456', phone:'0900 000 000', accountNumber:'1900008899', checking:86780000, savings:38700000,
    tier:'Premium', cardLocked:false, transactions:clone(DEFAULT_TRANSACTIONS)
  },
  {
    id:'user-002', role:'user', status:'active', name:'Nguyễn Minh Anh', email:'minhanh@neobank.vn',
    password:'123456', phone:'0912 345 678', accountNumber:'1900007712', checking:24500000, savings:8200000,
    tier:'Standard', cardLocked:false,
    transactions:[
      {id:201,name:'Lương tháng 09',note:'Thu nhập',amount:18000000,type:'in',date:'27/09/2026 08:20',icon:'↙'},
      {id:202,name:'Siêu thị',note:'Mua sắm',amount:1260000,type:'out',date:'28/09/2026 19:04',icon:'◈'}
    ]
  },
  {
    id:'user-003', role:'user', status:'locked', name:'Trần Gia Huy', email:'giahuy@neobank.vn',
    password:'123456', phone:'0938 222 111', accountNumber:'1900006635', checking:12480000, savings:5000000,
    tier:'Standard', cardLocked:true,
    transactions:[
      {id:301,name:'Nạp tiền',note:'Giao dịch demo',amount:7000000,type:'in',date:'24/09/2026 13:15',icon:'↙'}
    ]
  }
];

function parseJSON(value, fallback){
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function initUsers(){
  let users = parseJSON(localStorage.getItem(STORAGE.users), null);
  if(!Array.isArray(users) || !users.length){
    users = clone(DEFAULT_USERS);
    const oldChecking = Number(localStorage.getItem('neobank_checking'));
    const oldTx = parseJSON(localStorage.getItem('neobank_transactions'), null);
    const demo = users.find(u=>u.id==='user-001');
    if(demo && Number.isFinite(oldChecking) && oldChecking > 0) demo.checking = oldChecking;
    if(demo && Array.isArray(oldTx) && oldTx.length) demo.transactions = oldTx;
    localStorage.setItem(STORAGE.users, JSON.stringify(users));
  }
  return users;
}

const state = {
  users: initUsers(),
  audit: parseJSON(localStorage.getItem(STORAGE.audit), []),
  hideBalance: false,
  theme: localStorage.getItem(STORAGE.theme) || 'light'
};

function persistUsers(){ localStorage.setItem(STORAGE.users, JSON.stringify(state.users)); }
function persistAudit(){ localStorage.setItem(STORAGE.audit, JSON.stringify(state.audit)); }
function currentSessionId(){ return sessionStorage.getItem(STORAGE.session) || localStorage.getItem(STORAGE.rememberSession); }
function currentUser(){ return state.users.find(u=>u.id===currentSessionId()) || null; }
function userById(id){ return state.users.find(u=>u.id===id); }
function isAdmin(){ return currentUser()?.role === 'admin'; }

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}

function toast(message, type='success'){
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.textContent=message;
  $('#toastContainer').appendChild(el);
  setTimeout(()=>el.remove(),3200);
}

function setTheme(theme){
  state.theme=theme;
  document.body.classList.toggle('dark',theme==='dark');
  localStorage.setItem(STORAGE.theme,theme);
  if($('#themeBtn')) $('#themeBtn').textContent=theme==='dark'?'☀':'☾';
  if($('#loginThemeBtn')) $('#loginThemeBtn').textContent=theme==='dark'?'☀':'☾';
}
setTheme(state.theme);

function openModal(html, wide=false){
  $('#modalContent').innerHTML=html;
  $('.modal-card').classList.toggle('modal-wide', wide);
  $('#modal').classList.remove('hidden');
}
function closeModal(){
  $('#modal').classList.add('hidden');
  $('.modal-card').classList.remove('modal-wide');
}
$('#modalClose').onclick=closeModal;
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });

function addAudit(action, targetUser, details=''){
  const actor=currentUser();
  state.audit.unshift({
    id:Date.now(),
    actor:actor?.name || 'System',
    action,
    targetId:targetUser?.id || '',
    targetName:targetUser?.name || 'Hệ thống',
    details,
    date:nowText()
  });
  state.audit=state.audit.slice(0,100);
  persistAudit();
}

function userTransactions(user){ return Array.isArray(user?.transactions) ? user.transactions : []; }
function monthlyTotals(user){
  const tx=userTransactions(user);
  return tx.reduce((acc,t)=>{
    if(t.type==='in') acc.in+=Number(t.amount||0);
    if(t.type==='out') acc.out+=Number(t.amount||0);
    return acc;
  },{in:0,out:0});
}

function renderChart(){
  const data=[
    {m:'T4',i:29,e:13},{m:'T5',i:31,e:15},{m:'T6',i:28,e:12},{m:'T7',i:36,e:17},{m:'T8',i:30,e:16},{m:'T9',i:32.5,e:14.28}
  ];
  $('#cashflowChart').innerHTML=data.map(x=>`<div class="chart-group"><div class="bar income" style="height:${x.i/40*100}%" title="Thu: ${x.i} triệu"></div><div class="bar expense" style="height:${x.e/40*100}%" title="Chi: ${x.e} triệu"></div><span class="chart-label">${x.m}</span></div>`).join('');
}

function renderTransactions(){
  const user=currentUser();
  if(!user || user.role!=='user') return;
  const make=t=>`<div class="transaction-item" data-type="${escapeHtml(t.type)}" data-search="${escapeHtml((t.name+' '+t.note).toLowerCase())}"><div class="tx-icon">${escapeHtml(t.icon||'↗')}</div><div class="tx-main"><b>${escapeHtml(t.name)}</b><span>${escapeHtml(t.note)}</span></div><span class="tx-date">${escapeHtml(t.date)}</span><div class="tx-amount ${escapeHtml(t.type)}">${t.type==='in'?'+':'-'}${money(t.amount)}</div></div>`;
  const tx=userTransactions(user);
  $('#recentTransactions').innerHTML=tx.slice(0,5).map(make).join('') || '<p class="empty-state">Chưa có giao dịch.</p>';
  $('#allTransactions').innerHTML=tx.map(make).join('') || '<p class="empty-state">Chưa có giao dịch.</p>';
}

function renderBalances(){
  const user=currentUser();
  if(!user || user.role!=='user') return;
  const total=Number(user.checking||0)+Number(user.savings||0);
  const hidden='•••••••• ₫';
  $('#totalBalance').textContent=state.hideBalance?hidden:money(total);
  $('#checkingBalance').textContent=state.hideBalance?hidden:money(user.checking);
  $('#savingsBalance').textContent=state.hideBalance?hidden:money(user.savings);
  $('#sourceBalance').textContent=money(user.checking);
  const totals=monthlyTotals(user);
  $('#monthlyIncome').textContent=money(totals.in);
  $('#monthlySpending').textContent=money(totals.out);
}

function renderProfile(){
  const user=currentUser();
  if(!user) return;
  $('#profileName').value=user.name || '';
  $('#profileEmail').value=user.email || '';
  $('#profilePhone').value=user.phone || '';
}

function renderIdentity(){
  const user=currentUser();
  if(!user) return;
  const first=(user.name||'N').trim().charAt(0).toUpperCase();
  $('#topAvatar').textContent=first;
  $('#topUserName').textContent=user.name;
  $('#topUserRole').textContent=user.role==='admin'?'Quản trị viên':'Khách hàng '+(user.tier||'Standard');
  if(user.role==='user'){
    const shortName=(user.name||'bạn').trim().split(/\s+/).slice(-1)[0];
    $('#welcomeTitle').textContent=`Xin chào, ${shortName} 👋`;
    $('#cardHolderName').textContent=(user.name||'NEOBANK USER').toUpperCase();
    const last4=String(user.accountNumber||'8899').slice(-4).padStart(4,'0');
    $('#cardNumberDisplay').textContent=`5429 •••• •••• ${last4}`;
    $('#cardLockToggle').checked=!!user.cardLocked;
    $('#cardLockedOverlay').classList.toggle('hidden',!user.cardLocked);
    $('#transferNote').value=`${(user.name||'NEOBANK').toUpperCase()} chuyen tien`;
  }
}

function renderRoleUI(){
  const admin=isAdmin();
  $$('.role-admin').forEach(el=>el.classList.toggle('hidden',!admin));
  $$('.role-user').forEach(el=>el.classList.toggle('hidden',admin));
}

function filteredAdminUsers(){
  const q=($('#adminUserSearch')?.value||'').trim().toLowerCase();
  const status=$('#adminStatusFilter')?.value || 'all';
  return state.users.filter(u=>u.role==='user').filter(u=>{
    const hay=`${u.name} ${u.email} ${u.accountNumber} ${u.phone}`.toLowerCase();
    return (!q || hay.includes(q)) && (status==='all' || u.status===status);
  });
}

function renderAdmin(){
  if(!isAdmin()) return;
  const users=state.users.filter(u=>u.role==='user');
  $('#adminUserCount').textContent=users.length;
  $('#adminActiveCount').textContent=users.filter(u=>u.status==='active').length;
  $('#adminTotalBalance').textContent=money(users.reduce((sum,u)=>sum+Number(u.checking||0)+Number(u.savings||0),0));

  const rows=filteredAdminUsers().map(u=>`<tr>
    <td><div class="admin-user-cell"><div class="table-avatar">${escapeHtml((u.name||'U').charAt(0).toUpperCase())}</div><div><b>${escapeHtml(u.name)}</b><span>${escapeHtml(u.email)}</span></div></div></td>
    <td><b>${escapeHtml(u.accountNumber)}</b><span class="table-sub">${escapeHtml(u.tier||'Standard')}</span></td>
    <td class="money-cell">${money(u.checking)}</td>
    <td class="money-cell">${money(u.savings)}</td>
    <td><span class="status-pill ${u.status}">${u.status==='active'?'Hoạt động':'Đã khóa'}</span></td>
    <td><div class="table-actions"><button class="mini-btn" data-admin-action="balance" data-user-id="${u.id}">Số dư</button><button class="mini-btn" data-admin-action="edit" data-user-id="${u.id}">Sửa</button><button class="mini-btn ${u.status==='active'?'danger-text':'success-text'}" data-admin-action="status" data-user-id="${u.id}">${u.status==='active'?'Khóa':'Mở'}</button></div></td>
  </tr>`).join('');
  $('#adminUsersTable').innerHTML=rows || '<tr><td colspan="6"><div class="empty-state">Không tìm thấy tài khoản phù hợp.</div></td></tr>';

  $('#adminAuditList').innerHTML=state.audit.length ? state.audit.slice(0,30).map(log=>`<div class="audit-item"><div class="audit-dot">${escapeHtml(log.action.includes('Số dư')?'₫':'✓')}</div><div><b>${escapeHtml(log.action)}</b><span>${escapeHtml(log.actor)} → ${escapeHtml(log.targetName)}${log.details?` · ${escapeHtml(log.details)}`:''}</span></div><time>${escapeHtml(log.date)}</time></div>`).join('') : '<p class="empty-state">Chưa có thao tác quản trị nào.</p>';
}

function renderAll(){
  renderIdentity();
  renderRoleUI();
  renderProfile();
  if(isAdmin()) renderAdmin();
  else { renderChart(); renderTransactions(); renderBalances(); }
}

const today=new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());
$('#todayLabel').textContent=today.charAt(0).toUpperCase()+today.slice(1);

$('#togglePassword').onclick=()=>{
  const input=$('#passwordInput');
  input.type=input.type==='password'?'text':'password';
  $('#togglePassword').textContent=input.type==='password'?'Hiện':'Ẩn';
};
$('#loginThemeBtn').onclick=()=>setTheme(state.theme==='dark'?'light':'dark');
$('#themeBtn').onclick=()=>setTheme(state.theme==='dark'?'light':'dark');

const titles={dashboard:'Tổng quan',transfer:'Chuyển tiền',transactions:'Giao dịch',cards:'Thẻ',savings:'Tiết kiệm',accounts:'Tài khoản người dùng',settings:'Cài đặt'};
function go(page){
  const user=currentUser();
  if(!user) return;
  if(user.role==='admin' && ['dashboard','transfer','transactions','cards','savings'].includes(page)) page='accounts';
  if(user.role==='user' && page==='accounts') page='dashboard';
  const target=$(`#page-${page}`);
  if(!target) return;
  $$('.page').forEach(p=>p.classList.remove('active'));
  target.classList.add('active');
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  $('#pageTitle').textContent=titles[page]||'NeoBank';
  $('#sidebar').classList.remove('open');
  if(page==='accounts') renderAdmin();
  window.scrollTo({top:0,behavior:'smooth'});
}

function enterApp(){
  const user=currentUser();
  if(!user){
    $('#loginScreen').classList.remove('hidden');
    $('#appShell').classList.add('hidden');
    return;
  }
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('hidden');
  renderAll();
  go(user.role==='admin'?'accounts':'dashboard');
}

const existingSession=currentSessionId();
if(existingSession && currentUser()) enterApp();
else {
  localStorage.removeItem(STORAGE.rememberSession);
  sessionStorage.removeItem(STORAGE.session);
}

$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const email=$('#emailInput').value.trim().toLowerCase();
  const password=$('#passwordInput').value;
  const user=state.users.find(u=>u.email.toLowerCase()===email && u.password===password);
  if(!user){ toast('Sai email hoặc mật khẩu demo','error'); return; }
  if(user.role==='user' && user.status==='locked'){ toast('Tài khoản này đang bị admin khóa','error'); return; }
  localStorage.removeItem(STORAGE.rememberSession);
  sessionStorage.removeItem(STORAGE.session);
  if($('#rememberMe').checked) localStorage.setItem(STORAGE.rememberSession,user.id);
  else sessionStorage.setItem(STORAGE.session,user.id);
  enterApp();
  toast(user.role==='admin'?'Đăng nhập trang quản trị thành công':'Đăng nhập thành công');
});

$('#forgotBtn').onclick=()=>openModal(`<span class="eyebrow">TÀI KHOẢN DEMO</span><h3>Thông tin đăng nhập</h3><p>User mặc định: <b>demo@neobank.vn</b> / <b>123456</b><br>Admin mặc định: <b>admin@neobank.vn</b> / <b>admin123</b>.</p><div class="modal-actions"><button class="primary-btn" id="closeInfoBtn">Đã hiểu</button></div>`);
document.addEventListener('click',e=>{ if(e.target.id==='closeInfoBtn') closeModal(); });

$('#logoutBtn').onclick=()=>{
  localStorage.removeItem(STORAGE.rememberSession);
  sessionStorage.removeItem(STORAGE.session);
  location.reload();
};

$$('.nav-item').forEach(btn=>btn.onclick=()=>go(btn.dataset.page));
$$('[data-go]').forEach(btn=>btn.onclick=()=>go(btn.dataset.go));
$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
$('#toggleBalanceBtn').onclick=()=>{state.hideBalance=!state.hideBalance;renderBalances()};

$$('.quick-amounts button').forEach(btn=>btn.onclick=()=>{$('#transferAmount').value=btn.dataset.amount});
$('#accountNumber').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,''));
$('#recipientName').addEventListener('input',e=>e.target.value=e.target.value.toUpperCase());

$('#transferForm').addEventListener('submit',e=>{
  e.preventDefault();
  const sender=currentUser();
  if(!sender || sender.role!=='user') return;
  if(sender.status!=='active'){toast('Tài khoản đang bị khóa','error');return}
  const bank=$('#bankSelect').value;
  const acc=$('#accountNumber').value.trim();
  const name=$('#recipientName').value.trim();
  const amount=Number($('#transferAmount').value);
  const note=$('#transferNote').value.trim();
  if(!bank||acc.length<6||!name||amount<1000){toast('Vui lòng nhập đủ thông tin hợp lệ','error');return}
  if(amount>Number(sender.checking||0)){toast('Số dư demo không đủ','error');return}

  openModal(`<span class="eyebrow">XÁC NHẬN GIAO DỊCH</span><h3>Kiểm tra thông tin</h3><p>Đây là giao dịch mô phỏng, không chuyển tiền thật.</p><div class="transfer-review"><div><span>Người nhận</span><b>${escapeHtml(name)}</b></div><div><span>Ngân hàng</span><b>${escapeHtml(bank)}</b></div><div><span>Số tài khoản</span><b>${escapeHtml(acc)}</b></div><div><span>Số tiền</span><b>${money(amount)}</b></div><div><span>Phí</span><b>0 ₫</b></div></div><div class="modal-actions"><button class="secondary-btn" id="cancelTransfer">Hủy</button><button class="primary-btn" id="confirmTransfer">Xác nhận</button></div>`);
  $('#cancelTransfer').onclick=closeModal;
  $('#confirmTransfer').onclick=()=>{
    sender.checking=Number(sender.checking)-amount;
    sender.transactions.unshift({id:Date.now(),name,note:note||'Chuyển tiền',amount,type:'out',date:nowText(),icon:'↗'});

    if(bank==='NeoBank'){
      const recipient=state.users.find(u=>u.role==='user' && u.accountNumber===acc && u.id!==sender.id);
      if(recipient){
        recipient.checking=Number(recipient.checking||0)+amount;
        recipient.transactions.unshift({id:Date.now()+1,name:sender.name,note:note||'Nhận tiền NeoBank',amount,type:'in',date:nowText(),icon:'↙'});
      }
    }
    persistUsers();
    renderAll();
    closeModal();
    e.target.reset();
    $('#transferNote').value=`${sender.name.toUpperCase()} chuyen tien`;
    toast(`Đã mô phỏng chuyển ${money(amount)} đến ${name}`);
    go('dashboard');
  };
});

function filterTransactions(){
  const q=$('#transactionSearch').value.toLowerCase().trim();
  const f=$('#transactionFilter').value;
  $$('#allTransactions .transaction-item').forEach(el=>{
    const matchesQ=!q||el.dataset.search.includes(q);
    const matchesF=f==='all'||el.dataset.type===f;
    el.style.display=matchesQ&&matchesF?'grid':'none';
  });
}
$('#transactionSearch').addEventListener('input',filterTransactions);
$('#transactionFilter').addEventListener('change',filterTransactions);

$('#cardLockToggle').addEventListener('change',e=>{
  const user=currentUser();
  if(!user || user.role!=='user') return;
  user.cardLocked=e.target.checked;
  persistUsers();
  $('#cardLockedOverlay').classList.toggle('hidden',!e.target.checked);
  toast(e.target.checked?'Đã khóa thẻ demo':'Đã mở khóa thẻ demo');
});

$('#changePinBtn').onclick=()=>openModal(`<span class="eyebrow">THẺ DEMO</span><h3>Đổi PIN</h3><p>Tính năng này chỉ minh họa luồng giao diện. Bản demo không xử lý PIN ngân hàng thật.</p><div class="modal-actions"><button class="primary-btn" id="closePinBtn">Đóng</button></div>`);
$('#addGoalBtn').onclick=()=>openModal(`<span class="eyebrow">TIẾT KIỆM</span><h3>Tạo mục tiêu mới</h3><p>Phiên bản demo hiện chỉ mô phỏng giao diện tạo mục tiêu. Bạn có thể mở rộng bằng backend sau.</p><div class="modal-actions"><button class="primary-btn" id="closeGoalBtn">Đã hiểu</button></div>`);
document.addEventListener('click',e=>{
  if(e.target.id==='closePinBtn' || e.target.id==='closeGoalBtn') closeModal();
});

$('#saveProfileBtn').onclick=()=>{
  const user=currentUser();
  if(!user) return;
  const name=$('#profileName').value.trim();
  const email=$('#profileEmail').value.trim().toLowerCase();
  const phone=$('#profilePhone').value.trim();
  if(!name || !email){toast('Tên và email không được để trống','error');return}
  if(state.users.some(u=>u.id!==user.id && u.email.toLowerCase()===email)){toast('Email đã được sử dụng','error');return}
  user.name=name; user.email=email; user.phone=phone;
  persistUsers(); renderIdentity(); toast('Đã lưu hồ sơ demo');
};

$('#twoFactorToggle').onchange=e=>toast(e.target.checked?'Đã bật xác thực 2 bước demo':'Đã tắt xác thực 2 bước demo');
$('#resetDataBtn').onclick=()=>openModal(`<span class="eyebrow">KHÔI PHỤC</span><h3>Khôi phục toàn bộ dữ liệu demo?</h3><p>Danh sách user, số dư, giao dịch và nhật ký admin sẽ trở về dữ liệu mặc định.</p><div class="modal-actions"><button class="secondary-btn" id="cancelReset">Hủy</button><button class="danger-btn" id="confirmReset">Khôi phục</button></div>`);

document.addEventListener('click',e=>{
  if(e.target.id==='cancelReset') closeModal();
  if(e.target.id==='confirmReset'){
    state.users=clone(DEFAULT_USERS);
    state.audit=[];
    persistUsers(); persistAudit();
    localStorage.removeItem('neobank_checking');
    localStorage.removeItem('neobank_transactions');
    closeModal();
    toast('Đã khôi phục dữ liệu demo');
    renderAll();
    go(isAdmin()?'accounts':'dashboard');
  }
});

$('#notificationBtn').onclick=()=>{
  const user=currentUser();
  const content=user?.role==='admin'
    ? `<div class="transaction-list"><div class="transaction-item"><div class="tx-icon">♙</div><div class="tx-main"><b>Chế độ quản trị demo</b><span>Bạn có thể quản lý tài khoản và số dư người dùng.</span></div></div><div class="transaction-item"><div class="tx-icon">!</div><div class="tx-main"><b>Lưu ý bảo mật</b><span>Phân quyền localStorage không phù hợp cho hệ thống thật.</span></div></div></div>`
    : `<div class="transaction-list"><div class="transaction-item"><div class="tx-icon">✓</div><div class="tx-main"><b>Tài khoản hoạt động</b><span>Dữ liệu của bạn đang được lưu cục bộ trên trình duyệt.</span></div></div><div class="transaction-item"><div class="tx-icon">◈</div><div class="tx-main"><b>Nhắc nhở bảo mật</b><span>Không sử dụng thông tin ngân hàng thật trong bản demo.</span></div></div></div>`;
  openModal(`<span class="eyebrow">THÔNG BÁO</span><h3>Thông báo NeoBank</h3>${content}`);
};

function createAccountModal(){
  openModal(`<span class="eyebrow">ADMIN</span><h3>Tạo tài khoản người dùng</h3><p>Thông tin dưới đây chỉ được lưu trên trình duyệt cho bản demo.</p><div class="modal-form-grid"><label>Họ và tên<input id="newUserName" placeholder="Nguyễn Văn A"></label><label>Email<input id="newUserEmail" type="email" placeholder="user@neobank.vn"></label><label>Mật khẩu tạm<input id="newUserPassword" type="text" value="123456" minlength="6"></label><label>Số điện thoại<input id="newUserPhone" placeholder="0900 000 000"></label><label>Số tài khoản<input id="newUserAccount" inputmode="numeric" placeholder="1900001234"></label><label>Hạng tài khoản<select id="newUserTier"><option>Standard</option><option>Premium</option></select></label><label>Số dư thanh toán<input id="newUserChecking" type="number" min="0" step="1000" value="0"></label><label>Số dư tiết kiệm<input id="newUserSavings" type="number" min="0" step="1000" value="0"></label></div><div class="modal-actions"><button class="secondary-btn" id="cancelCreateUser">Hủy</button><button class="primary-btn" id="confirmCreateUser">Tạo tài khoản</button></div>`,true);
  $('#cancelCreateUser').onclick=closeModal;
  $('#newUserAccount').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,''));
  $('#confirmCreateUser').onclick=()=>{
    const name=$('#newUserName').value.trim();
    const email=$('#newUserEmail').value.trim().toLowerCase();
    const password=$('#newUserPassword').value;
    const phone=$('#newUserPhone').value.trim();
    const accountNumber=$('#newUserAccount').value.trim();
    const tier=$('#newUserTier').value;
    const checking=Number($('#newUserChecking').value);
    const savings=Number($('#newUserSavings').value);
    if(!name || !email || password.length<6 || accountNumber.length<6 || checking<0 || savings<0){toast('Vui lòng nhập thông tin hợp lệ','error');return}
    if(state.users.some(u=>u.email.toLowerCase()===email)){toast('Email đã tồn tại','error');return}
    if(state.users.some(u=>u.accountNumber===accountNumber)){toast('Số tài khoản đã tồn tại','error');return}
    const user={id:`user-${Date.now()}`,role:'user',status:'active',name,email,password,phone,accountNumber,checking,savings,tier,cardLocked:false,transactions:[]};
    state.users.push(user); persistUsers(); addAudit('Tạo tài khoản',user,`Số TK ${accountNumber}`); closeModal(); renderAdmin(); toast('Đã tạo tài khoản người dùng');
  };
}

function editAccountModal(user){
  openModal(`<span class="eyebrow">ADMIN</span><h3>Chỉnh sửa tài khoản</h3><p>${escapeHtml(user.accountNumber)} · ${escapeHtml(user.email)}</p><div class="modal-form-grid"><label>Họ và tên<input id="editUserName" value="${escapeHtml(user.name)}"></label><label>Email<input id="editUserEmail" type="email" value="${escapeHtml(user.email)}"></label><label>Số điện thoại<input id="editUserPhone" value="${escapeHtml(user.phone||'')}"></label><label>Hạng tài khoản<select id="editUserTier"><option ${user.tier==='Standard'?'selected':''}>Standard</option><option ${user.tier==='Premium'?'selected':''}>Premium</option></select></label><label class="span-2">Đặt mật khẩu mới <span class="label-note">(để trống nếu giữ nguyên)</span><input id="editUserPassword" type="text" placeholder="Tối thiểu 6 ký tự"></label></div><div class="modal-actions"><button class="secondary-btn" id="cancelEditUser">Hủy</button><button class="primary-btn" id="saveEditUser">Lưu thay đổi</button></div>`,true);
  $('#cancelEditUser').onclick=closeModal;
  $('#saveEditUser').onclick=()=>{
    const name=$('#editUserName').value.trim();
    const email=$('#editUserEmail').value.trim().toLowerCase();
    const phone=$('#editUserPhone').value.trim();
    const tier=$('#editUserTier').value;
    const password=$('#editUserPassword').value;
    if(!name || !email){toast('Tên và email không được để trống','error');return}
    if(state.users.some(u=>u.id!==user.id && u.email.toLowerCase()===email)){toast('Email đã được sử dụng','error');return}
    if(password && password.length<6){toast('Mật khẩu mới phải có ít nhất 6 ký tự','error');return}
    user.name=name; user.email=email; user.phone=phone; user.tier=tier; if(password) user.password=password;
    persistUsers(); addAudit('Sửa hồ sơ',user,password?'Có đặt lại mật khẩu':'Cập nhật thông tin'); closeModal(); renderAdmin(); toast('Đã cập nhật tài khoản');
  };
}

function balanceModal(user){
  openModal(`<span class="eyebrow">ADMIN · QUYỀN SỐ DƯ</span><h3>Chỉnh sửa số tiền</h3><p>${escapeHtml(user.name)} · ${escapeHtml(user.accountNumber)}</p><div class="balance-editor-summary"><div><span>Hiện tại</span><b>${money(Number(user.checking)+Number(user.savings))}</b></div></div><div class="modal-form-grid"><label>Số dư thanh toán<input id="editChecking" type="number" min="0" step="1000" value="${Number(user.checking||0)}"></label><label>Số dư tiết kiệm<input id="editSavings" type="number" min="0" step="1000" value="${Number(user.savings||0)}"></label><label class="span-2">Lý do điều chỉnh<input id="balanceReason" maxlength="100" placeholder="Ví dụ: Điều chỉnh dữ liệu demo" value="Điều chỉnh bởi quản trị viên"></label></div><div class="notice">Mọi thay đổi số dư sẽ xuất hiện trong lịch sử giao dịch của user và nhật ký quản trị.</div><div class="modal-actions"><button class="secondary-btn" id="cancelBalance">Hủy</button><button class="primary-btn" id="saveBalance">Lưu số dư</button></div>`,true);
  $('#cancelBalance').onclick=closeModal;
  $('#saveBalance').onclick=()=>{
    const checking=Number($('#editChecking').value);
    const savings=Number($('#editSavings').value);
    const reason=$('#balanceReason').value.trim() || 'Điều chỉnh bởi quản trị viên';
    if(!Number.isFinite(checking)||!Number.isFinite(savings)||checking<0||savings<0){toast('Số dư phải là số không âm','error');return}
    const oldChecking=Number(user.checking||0), oldSavings=Number(user.savings||0);
    if(checking===oldChecking && savings===oldSavings){toast('Số dư chưa thay đổi','error');return}
    const changes=[];
    if(checking!==oldChecking){
      const delta=checking-oldChecking;
      user.transactions.unshift({id:Date.now(),name:'Điều chỉnh số dư',note:`${reason} · Tài khoản thanh toán`,amount:Math.abs(delta),type:delta>=0?'in':'out',date:nowText(),icon:'♙'});
      changes.push(`Thanh toán ${money(oldChecking)} → ${money(checking)}`);
    }
    if(savings!==oldSavings){
      const delta=savings-oldSavings;
      user.transactions.unshift({id:Date.now()+1,name:'Điều chỉnh tiết kiệm',note:`${reason} · Tài khoản tiết kiệm`,amount:Math.abs(delta),type:delta>=0?'in':'out',date:nowText(),icon:'♙'});
      changes.push(`Tiết kiệm ${money(oldSavings)} → ${money(savings)}`);
    }
    user.checking=checking; user.savings=savings;
    persistUsers(); addAudit('Số dư được chỉnh sửa',user,changes.join(' | ')); closeModal(); renderAdmin(); toast('Đã cập nhật số dư người dùng');
  };
}

$('#createUserBtn').onclick=createAccountModal;
$('#adminUserSearch').addEventListener('input',renderAdmin);
$('#adminStatusFilter').addEventListener('change',renderAdmin);
$('#adminUsersTable').addEventListener('click',e=>{
  const btn=e.target.closest('[data-admin-action]');
  if(!btn || !isAdmin()) return;
  const user=userById(btn.dataset.userId);
  if(!user || user.role!=='user') return;
  const action=btn.dataset.adminAction;
  if(action==='balance') balanceModal(user);
  if(action==='edit') editAccountModal(user);
  if(action==='status'){
    const next=user.status==='active'?'locked':'active';
    openModal(`<span class="eyebrow">ADMIN</span><h3>${next==='locked'?'Khóa':'Mở khóa'} tài khoản?</h3><p>${escapeHtml(user.name)} · ${escapeHtml(user.email)}</p><div class="modal-actions"><button class="secondary-btn" id="cancelStatus">Hủy</button><button class="${next==='locked'?'danger-btn':'primary-btn'}" id="confirmStatus">${next==='locked'?'Khóa tài khoản':'Mở khóa'}</button></div>`);
    $('#cancelStatus').onclick=closeModal;
    $('#confirmStatus').onclick=()=>{
      user.status=next; persistUsers(); addAudit(next==='locked'?'Khóa tài khoản':'Mở khóa tài khoản',user); closeModal(); renderAdmin(); toast(next==='locked'?'Đã khóa tài khoản':'Đã mở khóa tài khoản');
    };
  }
});

$('#clearAuditBtn').onclick=()=>{
  if(!isAdmin()) return;
  openModal(`<span class="eyebrow">NHẬT KÝ DEMO</span><h3>Xóa nhật ký quản trị?</h3><p>Thao tác này chỉ ảnh hưởng dữ liệu localStorage của bản demo.</p><div class="modal-actions"><button class="secondary-btn" id="cancelClearAudit">Hủy</button><button class="danger-btn" id="confirmClearAudit">Xóa nhật ký</button></div>`);
  $('#cancelClearAudit').onclick=closeModal;
  $('#confirmClearAudit').onclick=()=>{state.audit=[];persistAudit();closeModal();renderAdmin();toast('Đã xóa nhật ký demo');};
};
