// ===== تنظیمات =====
const admins = {
    admin1: 'pass1234',
    admin2: 'pass1234',
    admin3: 'pass1234',
    admin4: 'pass1234'
};

const adminThemes = {
    admin1: { primary: '#00D4FF', secondary: '#00A0CC' },
    admin2: { primary: '#FF6B6B', secondary: '#FF5252' },
    admin3: { primary: '#4ECDC4', secondary: '#2DD4BF' },
    admin4: { primary: '#FFD700', secondary: '#FFC700' }
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
    applyTheme(adminId, adminThemes[adminId].primary, adminThemes[adminId].secondary);
}

function applyTheme(adminId, primary, secondary) {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--secondary', secondary);
}

// ===== احراز هویت =====
function handleLogin(event) {
    event.preventDefault();
    
    const admin = document.getElementById('adminName').value;
    const password = document.getElementById('password').value;

    if (admins[admin] === password) {
        currentAdmin = admin;
        
        // تطبیق رنگ
        const theme = adminThemes[admin];
        applyTheme(admin, theme.primary, theme.secondary);

        // نمایش داشبورد
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        document.getElementById('adminDisplayName').textContent = admin.replace('admin', 'ادمین ');

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

    players.push({
        name: name,
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

    list.innerHTML = players.map((player, idx) => `
        <div class="player-card">
            <h3>${player.name}</h3>
            <p>💰 شارژ: <strong>${player.totalCharge.toLocaleString()}</strong></p>
            <p>📊 بدهی: <strong>${player.totalDebt.toLocaleString()}</strong></p>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="viewHistory(${idx})">📋 سوابق</button>
                <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="openChargeModal(${idx})">💳 شارژ</button>
            </div>
        </div>
    `).join('');
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
            <div style="background: var(--dark-bg); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-right: 3px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 600;">📅 ${r.date}</span>
                    <span style="color: var(--primary);">${r.displayAmount}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-secondary);">${r.details}</div>
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
                    <strong style="color: var(--primary);">${currentPlayer.totalCharge.toLocaleString()}</strong>
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
    const today = new Date().toLocaleDateString('fa-IR');
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
            details: `USDT: ${amount} | والت: ${wallet}`
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
            details: `TRX: ${amount} | والت: ${wallet}`
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
            details: `سفارش: ${order}`
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
                details: `بدهی جدید`
            };
        } else {
            currentPlayer.totalCharge += amount;
            record = {
                date: today,
                displayAmount: `+${amount}`,
                details: `کریدیت اضافی`
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
            details: `پرداخت بدهی`
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
