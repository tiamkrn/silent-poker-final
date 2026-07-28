// ===== تنظیمات ادمین‌ها =====
const admins = {
    shahab: { password: '1234', name: 'شهاب', color: '#FFD700' },
    tiyam: { password: '4552', name: 'تیام', color: '#C0C0C0' },
    tabassam: { password: '9825', name: 'تبسم', color: '#FFB6C1' },
    arash: { password: '4321', name: 'آرش', color: '#B87333' }
};

// ===== متغیرهای جهانی =====
let currentAdmin = null;
let players = [];
let currentPlayer = null;

// ===== مدیریت رنگ‌ها =====
function selectAdmin(adminId) {
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('adminName').value = adminId;
    applyAdminTheme(adminId);
}

function applyAdminTheme(adminId) {
    const admin = admins[adminId];
    document.documentElement.style.setProperty('--admin-color', admin.color);
}

// ===== احراز هویت =====
function handleLogin(event) {
    event.preventDefault();
    
    const adminId = document.getElementById('adminName').value;
    const password = document.getElementById('password').value;
    const admin = admins[adminId];

    if (admin && admin.password === password) {
        currentAdmin = adminId;
        applyAdminTheme(adminId);

        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        document.getElementById('adminDisplayName').textContent = admin.name;
        document.getElementById('adminDisplayName').style.color = admin.color;

        loadData();
        displayPlayers();
    } else {
        alert('❌ رمز عبور نادرست است!');
    }
}

function logout() {
    if (confirm('آیا می‌خواهید خارج شوید؟')) {
        currentAdmin = null;
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('password').value = '';
        location.reload();
    }
}

// ===== مدیریت داده‌ها =====
function loadData() {
    const saved = localStorage.getItem('silentPokerData');
    if (saved) {
        players = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem('silentPokerData', JSON.stringify(players));
}

// ===== تاریخ امروز =====
function getTodayDate() {
    return new Date().toLocaleDateString('fa-IR');
}

// ===== تاریخ شروع =====
function getStartDate(player) {
    return player.startDate || getTodayDate();
}

// ===== تاریخ آخرین فعالیت =====
function getLastActivityDate(player) {
    if (player.records.length === 0) {
        return getStartDate(player);
    }
    return player.records[player.records.length - 1].date;
}

// ===== مدیریت بازیکنان =====
function addPlayer() {
    const name = document.getElementById('newPlayerName').value.trim();
    if (!name) {
        alert('❌ نام بازیکن را وارد کنید!');
        return;
    }

    if (players.some(p => p.name === name)) {
        alert('❌ این بازیکن قبلاً اضافه شده است!');
        return;
    }

    const today = getTodayDate();
    const admin = admins[currentAdmin];

    players.push({
        name: name,
        startDate: today,
        addedByAdmin: currentAdmin,
        adminName: admin.name,
        adminColor: admin.color,
        totalCharge: 0,
        totalDebt: 0,
        records: []
    });

    saveData();
    document.getElementById('newPlayerName').value = '';
    displayPlayers();
    alert('✅ بازیکن با موفقیت اضافه شد!');
}

function displayPlayers() {
    const list = document.getElementById('playersList');
    if (players.length === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">هنوز بازیکنی اضافه نشده است</p>';
        return;
    }

    list.innerHTML = players.map((player, idx) => {
        const startDate = getStartDate(player);
        const lastDate = getLastActivityDate(player);
        const adminColor = player.adminColor || '#808080';
        
        return `
            <div class="player-card">
                <h3>${player.name}</h3>
                <p style="font-size: 11px; color: ${adminColor}; margin-bottom: 8px; font-weight: 600;">👤 ${player.adminName}</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">📅 از ${startDate} تا ${lastDate}</p>
                <p>💰 شارژ: <strong>${player.totalCharge.toLocaleString()}</strong></p>
                <p>📊 بدهی: <strong>${player.totalDebt.toLocaleString()}</strong></p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="viewHistory(${idx})">📋 سوابق</button>
                    <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="openChargeModal(${idx})">💳 شارژ</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== مشاهده سوابق =====
function viewHistory(idx) {
    currentPlayer = players[idx];
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyContent');

    if (currentPlayer.records.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">سابقه‌ای وجود ندارد</p>';
    } else {
        content.innerHTML = currentPlayer.records.map(r => `
            <div style="background: var(--dark-bg); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-right: 3px solid ${r.adminColor};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 600;">📅 ${r.date}</span>
                    <span style="color: ${r.adminColor}; font-weight: 600;">${r.displayAmount}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;">${r.details}</div>
                <div style="font-size: 11px; color: ${r.adminColor};">👤 ${r.adminName}</div>
            </div>
        `).join('');
    }

    modal.classList.add('active');
}

// ===== مودال شارژ =====
function openChargeModal(idx) {
    currentPlayer = players[idx];
    const modal = document.getElementById('chargeModal');
    const content = document.getElementById('chargeContent');

    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="background: var(--dark-bg); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>💰 کل شارژ:</span>
                    <strong style="color: var(--admin-color);">${currentPlayer.totalCharge.toLocaleString()}</strong>
                </div>
            </div>
            <div style="background: var(--dark-bg); padding: 15px; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>📊 کل بدهی:</span>
                    <strong style="color: #ff6b6b;">${currentPlayer.totalDebt.toLocaleString()}</strong>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 10px; text-transform: uppercase;">روش شارژ:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button class="btn-add" style="padding: 15px; font-size: 12px;" onclick="showChargeForm('usdt')">💵 USDT</button>
                <button class="btn-add" style="padding: 15px; font-size: 12px;" onclick="showChargeForm('trx')">💰 TRX</button>
                <button class="btn-add" style="padding: 15px; font-size: 12px;" onclick="showChargeForm('rial')">🪙 ریالی</button>
                <button class="btn-add" style="padding: 15px; font-size: 12px;" onclick="showChargeForm('debt')">📋 بدهی</button>
                <button class="btn-add" style="padding: 15px; font-size: 12px; grid-column: 1/-1;" onclick="showChargeForm('payment')">✅ پرداخت بدهی</button>
            </div>
        </div>
        <div id="chargeFormContainer"></div>
    `;

    modal.classList.add('active');
}

function showChargeForm(type) {
    const container = document.getElementById('chargeFormContainer');
    let form = '';

    if (type === 'usdt') {
        form = `
            <div class="form-group">
                <label>مقدار USDT</label>
                <input type="number" id="usdtAmount" placeholder="0.00" step="0.01">
            </div>
            <div class="form-group">
                <label>تعداد ژتون</label>
                <input type="number" id="usdtTokens" placeholder="0">
            </div>
            <div class="form-group">
                <label>نام والت</label>
                <input type="text" id="usdtWallet" placeholder="">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('usdt')">ثبت</button>
        `;
    } else if (type === 'trx') {
        form = `
            <div class="form-group">
                <label>مقدار TRX</label>
                <input type="number" id="trxAmount" placeholder="0.00" step="0.01">
            </div>
            <div class="form-group">
                <label>تعداد ژتون</label>
                <input type="number" id="trxTokens" placeholder="0">
            </div>
            <div class="form-group">
                <label>نام والت</label>
                <input type="text" id="trxWallet" placeholder="">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('trx')">ثبت</button>
        `;
    } else if (type === 'rial') {
        form = `
            <div class="form-group">
                <label>شماره سفارش</label>
                <input type="text" id="rialOrder" placeholder="">
            </div>
            <div class="form-group">
                <label>مقدار (ریال)</label>
                <input type="number" id="rialAmount" placeholder="0">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('rial')">ثبت</button>
        `;
    } else if (type === 'debt') {
        form = `
            <div class="form-group">
                <label>مقدار ژتون</label>
                <input type="number" id="debtAmount" placeholder="0">
            </div>
            <div class="form-group">
                <label>نوع</label>
                <select id="debtType" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                    <option value="debt">بدهی ➖</option>
                    <option value="credit">کریدیت ➕</option>
                </select>
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('debt')">ثبت</button>
        `;
    } else if (type === 'payment') {
        form = `
            <div class="form-group">
                <label>مقدار پرداختی</label>
                <input type="number" id="paymentAmount" placeholder="0">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('payment')">ثبت</button>
        `;
    }

    container.innerHTML = form;
}

function submitCharge(type) {
    const today = getTodayDate();
    const admin = admins[currentAdmin];
    let record = null;

    if (type === 'usdt') {
        const amount = parseFloat(document.getElementById('usdtAmount').value);
        const tokens = parseInt(document.getElementById('usdtTokens').value);
        const wallet = document.getElementById('usdtWallet').value;

        if (!amount || !tokens || !wallet) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        currentPlayer.totalCharge += tokens;
        record = {
            date: today,
            displayAmount: `+${tokens}`,
            details: `USDT: ${amount} | والت: ${wallet}`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
    } else if (type === 'trx') {
        const amount = parseFloat(document.getElementById('trxAmount').value);
        const tokens = parseInt(document.getElementById('trxTokens').value);
        const wallet = document.getElementById('trxWallet').value;

        if (!amount || !tokens || !wallet) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        currentPlayer.totalCharge += tokens;
        record = {
            date: today,
            displayAmount: `+${tokens}`,
            details: `TRX: ${amount} | والت: ${wallet}`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
    } else if (type === 'rial') {
        const order = document.getElementById('rialOrder').value;
        const amount = parseInt(document.getElementById('rialAmount').value);

        if (!order || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        currentPlayer.totalCharge += amount;
        record = {
            date: today,
            displayAmount: `+${amount} ریال`,
            details: `سفارش: ${order}`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
    } else if (type === 'debt') {
        const amount = parseInt(document.getElementById('debtAmount').value);
        const debtType = document.getElementById('debtType').value;

        if (!amount) {
            alert('❌ مقدار را وارد کنید!');
            return;
        }

        if (debtType === 'debt') {
            currentPlayer.totalDebt += amount;
            record = {
                date: today,
                displayAmount: `-${amount}`,
                details: `بدهی جدید`,
                adminName: admin.name,
                adminColor: admin.color,
                adminId: currentAdmin
            };
        } else {
            currentPlayer.totalCharge += amount;
            record = {
                date: today,
                displayAmount: `+${amount}`,
                details: `کریدیت اضافی`,
                adminName: admin.name,
                adminColor: admin.color,
                adminId: currentAdmin
            };
        }
    } else if (type === 'payment') {
        const amount = parseInt(document.getElementById('paymentAmount').value);

        if (!amount) {
            alert('❌ مقدار را وارد کنید!');
            return;
        }

        if (amount > currentPlayer.totalDebt) {
            alert('❌ مقدار پرداختی نمی‌تواند بیش از بدهی باشد!');
            return;
        }

        currentPlayer.totalDebt -= amount;
        record = {
            date: today,
            displayAmount: `-${amount}`,
            details: `پرداخت بدهی`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
    }

    if (record) {
        currentPlayer.records.push(record);
        saveData();
        alert('✅ عملیات با موفقیت ثبت شد!');
        closeModal('chargeModal');
        displayPlayers();
    }
}

// ===== جستجو برای شارژ =====
function searchForCharge() {
    const query = document.getElementById('chargeSearch').value.toLowerCase().trim();
    const list = document.getElementById('chargeList');

    if (!query) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">نام بازیکن را جستجو کنید</p>';
        return;
    }

    const filtered = players.filter(p => p.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">❌ بازیکنی یافت نشد</p>';
        return;
    }

    list.innerHTML = filtered.map((player) => {
        const idx = players.indexOf(player);
        const startDate = getStartDate(player);
        const lastDate = getLastActivityDate(player);
        const adminColor = player.adminColor || '#808080';
        
        return `
            <div class="player-card">
                <h3>${player.name}</h3>
                <p style="font-size: 11px; color: ${adminColor}; margin-bottom: 8px; font-weight: 600;">👤 ${player.adminName}</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">📅 از ${startDate} تا ${lastDate}</p>
                <p>💰 شارژ: <strong>${player.totalCharge.toLocaleString()}</strong></p>
                <p>📊 بدهی: <strong>${player.totalDebt.toLocaleString()}</strong></p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="viewHistory(${idx})">📋 سوابق</button>
                    <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="openChargeModal(${idx})">💳 شارژ</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== تعویض تب‌ها =====
function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(section => section.classList.remove('active'));

    event.target.closest('.nav-item').classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// ===== مودال =====
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ===== بارگذاری =====
loadData();

// بستن مودال با کلیک خارج
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
