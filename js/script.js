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
let transactions = [];
let currentPlayer = null;
let currentExportType = null;
let currentCashoutType = 'rial';
let currentUsdtType = 'bep20';

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
        setCurrentDateTime();
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

// ===== تنظیم تاریخ و ساعت فعلی =====
function setCurrentDateTime() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().slice(0, 5);

    ['usdtBep20', 'usdtTrc20', 'trx', 'debt', 'rial', 'card', 'payment', 'rialCashout', 'walletCashout'].forEach(prefix => {
        const dateEl = document.getElementById(prefix + 'Date');
        const timeEl = document.getElementById(prefix + 'Time');
        if (dateEl) dateEl.value = todayStr;
        if (timeEl) timeEl.value = timeStr;
    });
}

// ===== مدیریت داده‌ها =====
function loadData() {
    const savedPlayers = localStorage.getItem('silentPokerData');
    const savedTransactions = localStorage.getItem('silentPokerTransactions');
    
    if (savedPlayers) players = JSON.parse(savedPlayers);
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
}

function saveData() {
    localStorage.setItem('silentPokerData', JSON.stringify(players));
    localStorage.setItem('silentPokerTransactions', JSON.stringify(transactions));
}

// ===== تاریخ امروز =====
function getTodayDate() {
    return new Date().toLocaleDateString('fa-IR');
}

function getStartDate(player) {
    return player.startDate || getTodayDate();
}

function getLastActivityDate(player) {
    return player.records.length === 0 ? getStartDate(player) : player.records[player.records.length - 1].date;
}

// ===== مدیریت بازیکنان =====
function addPlayer() {
    const name = document.getElementById('newPlayerName').value.trim();
    const verified = document.getElementById('playerVerified').checked;
    
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
        verified: verified,
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
    document.getElementById('playerVerified').checked = false;
    document.getElementById('playerSearchInput').value = '';
    displayPlayers();
    alert('✅ بازیکن با موفقیت اضافه شد!');
}

function displayPlayers() {
    const list = document.getElementById('playersList');
    const searchInput = document.getElementById('playerSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm));
    
    if (filteredPlayers.length === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">هنوز بازیکنی اضافه نشده است</p>';
        return;
    }

    list.innerHTML = filteredPlayers.map((player, idx) => {
        const originalIdx = players.indexOf(player);
        const startDate = getStartDate(player);
        const lastDate = getLastActivityDate(player);
        const adminColor = player.adminColor || '#808080';
        
        return `
            <div class="player-card">
                <h3>${player.name}</h3>
                ${player.verified ? '<div class="verification-badge">احراز درگاه</div>' : ''}
                <p style="font-size: 11px; color: ${adminColor}; margin-bottom: 8px; font-weight: 600;">👤 ${player.adminName}</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">📅 از ${startDate} تا ${lastDate}</p>
                <p>💰 شارژ: <strong>${player.totalCharge.toLocaleString()}</strong></p>
                <p>📊 بدهی: <strong>${player.totalDebt.toLocaleString()}</strong></p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="viewHistory(${originalIdx})">📋 سوابق</button>
                    <button class="btn-add" style="flex: 1; padding: 8px; font-size: 12px;" onclick="openChargeModal(${originalIdx})">💳 شارژ</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Drag & Drop =====
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, type) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files: files } }, type);
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            window[type + 'Screenshot'] = event.target.result;
            const dragZone = document.getElementById(type + 'DragZone');
            if (dragZone) {
                dragZone.innerHTML = `<span style="font-size: 32px;">✅</span><p style="color: var(--admin-color);">عکس آپلود شد</p>`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// ===== Switch USDT Type =====
function switchUsdtType(type) {
    currentUsdtType = type;
    document.querySelectorAll('[data-type]').forEach(btn => {
        if (btn.dataset.type === 'bep20' || btn.dataset.type === 'trc20') {
            btn.classList.remove('active');
        }
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    document.getElementById('usdtBep20Section').style.display = type === 'bep20' ? 'block' : 'none';
    document.getElementById('usdtTrc20Section').style.display = type === 'trc20' ? 'block' : 'none';
}

// ===== Switch Cashout Type =====
function switchCashoutType(type) {
    currentCashoutType = type;
    document.querySelectorAll('[data-type]').forEach(btn => {
        if (btn.dataset.type === 'rial' || btn.dataset.type === 'wallet') {
            btn.classList.remove('active');
        }
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    document.getElementById('cashoutRialSection').style.display = type === 'rial' ? 'block' : 'none';
    document.getElementById('cashoutWalletSection').style.display = type === 'wallet' ? 'block' : 'none';
}

// ===== تراکنش‌های جدید =====
function addTransaction(type) {
    const admin = admins[currentAdmin];
    
    const transactionMap = {
        'usdt-bep20': { playerKey: 'usdtBep20Player', amountKey: 'usdtBep20Amount', tokensKey: 'usdtBep20Tokens', walletKey: 'usdtBep20Wallet', hashKey: 'usdtBep20Hash', dateKey: 'usdtBep20Date', timeKey: 'usdtBep20Time', dragKey: 'usdtBep20' },
        'usdt-trc20': { playerKey: 'usdtTrc20Player', amountKey: 'usdtTrc20Amount', tokensKey: 'usdtTrc20Tokens', walletKey: 'usdtTrc20Wallet', hashKey: 'usdtTrc20Hash', dateKey: 'usdtTrc20Date', timeKey: 'usdtTrc20Time', dragKey: 'usdtTrc20' },
        'trx': { playerKey: 'trxPlayer', amountKey: 'trxAmount', tokensKey: 'trxTokens', walletKey: 'trxWallet', hashKey: 'trxHash', dateKey: 'trxDate', timeKey: 'trxTime', dragKey: 'trx' },
        'rial': { playerKey: 'rialPlayer', orderKey: 'rialOrder', amountKey: 'rialAmount', dateKey: 'rialDate', timeKey: 'rialTime' },
        'debt': { playerKey: 'debtPlayer', amountKey: 'debtAmount', dateKey: 'debtDate', timeKey: 'debtTime' },
        'card': { playerKey: 'cardPlayer', amountKey: 'cardAmount', tokensKey: 'cardTokens', dateKey: 'cardDate', timeKey: 'cardTime' },
        'payment': { playerKey: 'paymentPlayer', amountKey: 'paymentAmount', dateKey: 'paymentDate', timeKey: 'paymentTime' },
        'cashout-rial': { playerKey: 'rialCashoutPlayer', amountKey: 'rialCashoutAmount', cardKey: 'rialCashoutCard', dateKey: 'rialCashoutDate', timeKey: 'rialCashoutTime' },
        'cashout-wallet': { playerKey: 'walletCashoutPlayer', amountKey: 'walletCashoutAmount', addressKey: 'walletCashoutAddress', dateKey: 'walletCashoutDate', timeKey: 'walletCashoutTime' }
    };

    const keys = transactionMap[type];
    const date = document.getElementById(keys.dateKey).value;
    const time = document.getElementById(keys.timeKey).value;

    if (!date || !time) {
        alert('❌ تاریخ و ساعت ضروری است!');
        return;
    }

    let player = '';
    let amount = 0;
    let tokens = 0;
    let wallet = '';
    let hash = '';
    let screenshot = null;
    let isValid = true;

    if (type === 'usdt-bep20' || type === 'usdt-trc20') {
        player = currentPlayer.name;
        amount = parseFloat(document.getElementById(keys.amountKey).value);
        tokens = parseInt(document.getElementById(keys.tokensKey).value);
        wallet = document.getElementById(keys.walletKey).value.trim();
        hash = document.getElementById(keys.hashKey).value.trim();
        screenshot = window[keys.dragKey + 'Screenshot'] || null;

        if (!amount || !tokens || !wallet || (!hash && !screenshot)) {
            alert('❌ تمام فیلدها و حداقل یکی از (هش یا عکس) ضروری است!');
            isValid = false;
        }
    } else if (type === 'trx') {
        player = currentPlayer.name;
        amount = parseFloat(document.getElementById(keys.amountKey).value);
        tokens = parseInt(document.getElementById(keys.tokensKey).value);
        wallet = document.getElementById(keys.walletKey).value.trim();
        hash = document.getElementById(keys.hashKey).value.trim();
        screenshot = window.trxScreenshot || null;

        if (!amount || !tokens || !wallet || (!hash && !screenshot)) {
            alert('❌ تمام فیلدها و حداقل یکی از (هش یا عکس) ضروری است!');
            isValid = false;
        }
    } else if (type === 'rial') {
        player = currentPlayer.name;
        const order = document.getElementById(keys.orderKey).value.trim();
        amount = parseInt(document.getElementById(keys.amountKey).value);

        if (!order || !amount) {
            alert('❌ تمام فیلدها ضروری است!');
            isValid = false;
        }
        wallet = order;
    } else if (type === 'debt') {
        player = currentPlayer.name;
        amount = parseInt(document.getElementById(keys.amountKey).value);

        if (!amount) {
            alert('❌ مقدار ضروری است!');
            isValid = false;
        }
    } else if (type === 'card') {
        player = currentPlayer.name;
        amount = parseInt(document.getElementById(keys.amountKey).value);
        tokens = parseInt(document.getElementById(keys.tokensKey).value);

        if (!amount || !tokens) {
            alert('❌ مقدار و ژتون ضروری است!');
            isValid = false;
        }
    } else if (type === 'payment') {
        player = currentPlayer.name;
        amount = parseInt(document.getElementById(keys.amountKey).value);

        if (!amount) {
            alert('❌ مقدار ضروری است!');
            isValid = false;
        }
    } else if (type === 'cashout-rial') {
        player = currentPlayer.name;
        amount = parseInt(document.getElementById(keys.amountKey).value);
        wallet = document.getElementById(keys.cardKey).value.trim();

        if (!amount || !wallet) {
            alert('❌ مقدار و شماره کارت ضروری است!');
            isValid = false;
        }
    } else if (type === 'cashout-wallet') {
        player = currentPlayer.name;
        amount = parseInt(document.getElementById(keys.amountKey).value);
        wallet = document.getElementById(keys.addressKey).value.trim();

        if (!amount || !wallet) {
            alert('❌ مقدار و آدرس والت ضروری است!');
            isValid = false;
        }
    }

    if (!isValid) return;

    const farsiDate = convertToFarsiDate(date);
    
    const transaction = {
        id: Date.now(),
        type: type,
        date: farsiDate,
        time: time,
        player: player,
        amount: amount,
        tokens: tokens,
        wallet: wallet,
        hash: hash,
        screenshot: screenshot,
        adminName: admin.name,
        adminColor: admin.color,
        adminId: currentAdmin
    };

    transactions.push(transaction);
    saveData();
    alert('✅ تراکنش با موفقیت ثبت شد!');
    
    // پاک کردن فرم
    if (type === 'usdt-bep20' || type === 'usdt-trc20') {
        document.getElementById(keys.amountKey).value = '';
        document.getElementById(keys.tokensKey).value = '';
        document.getElementById(keys.walletKey).value = '';
        document.getElementById(keys.hashKey).value = '';
        window[keys.dragKey + 'Screenshot'] = null;
        document.getElementById(keys.dragKey + 'DragZone').innerHTML = `<span style="font-size: 32px;">📸</span><p>عکس اسکین را بکشید یا <span class="drag-link" onclick="document.getElementById('${keys.dragKey}File').click()">انتخاب کنید</span></p>`;
    } else {
        Object.values(keys).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = '';
        });
    }
    
    setCurrentDateTime();
    displayTransactions(type.includes('usdt') ? 'usdt' : type.includes('cashout') ? 'cashout' : type);
}

function convertToFarsiDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fa-IR');
}

function displayTransactions(type) {
    const today = getTodayDate();
    let filtered;
    
    if (type === 'usdt') {
        filtered = transactions.filter(t => (t.type === 'usdt-bep20' || t.type === 'usdt-trc20') && t.date === today);
    } else if (type === 'cashout') {
        filtered = transactions.filter(t => (t.type === 'cashout-rial' || t.type === 'cashout-wallet') && t.date === today);
    } else {
        filtered = transactions.filter(t => t.type === type && t.date === today);
    }
    
    const container = document.getElementById(type + 'Transactions');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">هیچ تراکنشی ثبت نشده است</p>';
        return;
    }

    let html = `
        <table class="transaction-table">
            <tr>
                <th>ردیف</th>
                <th>تاریخ</th>
                <th>ساعت</th>
                <th>بازیکن</th>
                <th>مقدار</th>
                ${type === 'usdt' || type === 'trx' || type === 'card' ? '<th>ژتون</th>' : ''}
                ${type === 'usdt' || type === 'trx' ? '<th>والت</th><th>هش</th>' : ''}
                ${type === 'rial' ? '<th>سفارش</th>' : ''}
                ${type === 'cashout' ? '<th>نوع</th><th>کارت/والت</th>' : ''}
                <th>ادمین</th>
                <th>عملیات</th>
            </tr>
    `;
    
    filtered.forEach((t, idx) => {
        html += `<tr>
            <td>${idx + 1}</td>
            <td>${t.date}</td>
            <td>${t.time}</td>
            <td>${t.player}</td>
            <td>${t.amount.toLocaleString()}</td>
            ${t.type === 'usdt-bep20' || t.type === 'usdt-trc20' || t.type === 'trx' || t.type === 'card' ? `<td>${t.tokens}</td>` : ''}
            ${t.type === 'usdt-bep20' || t.type === 'usdt-trc20' || t.type === 'trx' ? `<td>${t.wallet}</td><td><span style="font-size: 10px;">${t.hash.substring(0, 8)}...</span></td>` : ''}
            ${t.type === 'rial' ? `<td>${t.wallet}</td>` : ''}
            ${type === 'cashout' ? `<td>${t.type === 'cashout-rial' ? '💳 ریالی' : '💰 والت'}</td><td>${t.wallet}</td>` : ''}
            <td style="color: ${t.adminColor}; font-weight: 600;">${t.adminName}</td>
            <td>
                ${t.screenshot ? `<button class="btn-small" onclick="viewScreenshot('${t.screenshot.replace(/'/g, "\\'")}')">📸</button>` : ''}
                <button class="btn-small" onclick="deleteTransaction('${type}', ${t.id})">🗑️</button>
            </td>
        </tr>`;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function viewScreenshot(data) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 3000; cursor: pointer;';
    modal.innerHTML = `<img src="${data}" style="max-width: 90%; max-height: 90%; border-radius: 10px;">`;
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function deleteTransaction(type, id) {
    if (confirm('آیا مطمئن هستید؟')) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        displayTransactions(type);
    }
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
                    <span style="font-weight: 600;">📅 ${r.date} - ${r.time || 'بدون ساعت'}</span>
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

    let recordsHTML = '';
    if (currentPlayer.records.length > 0) {
        recordsHTML = `
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(26, 26, 26, 0.5); border: 1px solid var(--border-color); border-radius: 10px;">
                <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 14px; color: var(--text-primary);">📋 سوابق اخیر</h3>
                ${currentPlayer.records.slice(-5).reverse().map((r, recordIdx) => `
                    <div class="record-card" style="border-right-color: ${r.adminColor};">
                        <div class="record-info">
                            <div class="record-amount" style="color: ${r.adminColor};">${r.displayAmount}</div>
                            <div class="record-details">${r.details}</div>
                            <div class="record-admin" style="color: ${r.adminColor};">👤 ${r.adminName} | 📅 ${r.date}${r.time ? ' - ' + r.time : ''}</div>
                        </div>
                        <button class="btn-delete" onclick="deleteRecord(${recordIdx})" style="margin: 0; white-space: nowrap;">🗑️ حذف</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

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

        ${recordsHTML}

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

function deleteRecord(recordIdx) {
    const records = currentPlayer.records;
    const recordToDelete = records[records.length - 1 - recordIdx];
    
    if (confirm(`آیا می‌خواهید این سابقه را حذف کنید؟\n\n${recordToDelete.displayAmount} - ${recordToDelete.details}`)) {
        if (recordToDelete.displayAmount.includes('+')) {
            const amount = parseInt(recordToDelete.displayAmount.replace('+', ''));
            currentPlayer.totalCharge -= amount;
        } else if (recordToDelete.displayAmount.includes('-')) {
            const amount = parseInt(recordToDelete.displayAmount.replace('-', ''));
            if (recordToDelete.details.includes('پرداخت')) {
                currentPlayer.totalDebt += amount;
            } else {
                currentPlayer.totalCharge -= amount;
            }
        }

        currentPlayer.records.splice(records.length - 1 - recordIdx, 1);
        saveData();
        alert('✅ سابقه با موفقیت حذف شد!');
        openChargeModal(players.indexOf(currentPlayer));
        displayPlayers();
    }
}

function showChargeForm(type) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().slice(0, 5);

    const container = document.getElementById('chargeFormContainer');
    let form = '';

    if (type === 'usdt') {
        form = `
            <div class="form-group" style="padding: 15px; background: var(--dark-bg); border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: var(--admin-color);">👤 بازیکن: ${currentPlayer.name}</strong>
            </div>
            <div class="form-group">
                <label>مقدار USDT</label>
                <input type="number" id="chargeUsdtAmount" class="form-input" placeholder="0.00" step="0.01">
            </div>
            <div class="form-group">
                <label>تعداد ژتون</label>
                <input type="number" id="chargeUsdtTokens" class="form-input" placeholder="0">
            </div>
            <div class="form-group">
                <label>نام والت</label>
                <input type="text" id="chargeUsdtWallet" class="form-input" placeholder="">
            </div>
            <div class="form-group">
                <label>هش تراکنش (اختیاری)</label>
                <input type="text" id="chargeUsdtHash" class="form-input" placeholder="">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>تاریخ</label>
                    <input type="date" id="chargeUsdtDate" class="form-input" value="${todayStr}">
                </div>
                <div class="form-group">
                    <label>ساعت</label>
                    <input type="time" id="chargeUsdtTime" class="form-input" value="${timeStr}">
                </div>
            </div>
            <div class="form-group">
                <label>عکس (اختیاری)</label>
                <div class="drag-drop-zone" id="chargeUsdtDragZone" ondrop="handleDrop(event, 'chargeUsdt')" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                    <span style="font-size: 24px;">📸</span>
                    <p style="font-size: 12px;">عکس را بکشید یا <span class="drag-link" onclick="document.getElementById('chargeUsdtFile').click()">انتخاب کنید</span></p>
                    <input type="file" id="chargeUsdtFile" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'chargeUsdt')">
                </div>
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('usdt')">✅ ثبت</button>
        `;
    } else if (type === 'trx') {
        form = `
            <div class="form-group" style="padding: 15px; background: var(--dark-bg); border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: var(--admin-color);">👤 بازیکن: ${currentPlayer.name}</strong>
            </div>
            <div class="form-group">
                <label>مقدار TRX</label>
                <input type="number" id="chargeTrxAmount" class="form-input" placeholder="0.00" step="0.01">
            </div>
            <div class="form-group">
                <label>تعداد ژتون</label>
                <input type="number" id="chargeTrxTokens" class="form-input" placeholder="0">
            </div>
            <div class="form-group">
                <label>نام والت</label>
                <input type="text" id="chargeTrxWallet" class="form-input" placeholder="">
            </div>
            <div class="form-group">
                <label>هش تراکنش (اختیاری)</label>
                <input type="text" id="chargeTrxHash" class="form-input" placeholder="">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>تاریخ</label>
                    <input type="date" id="chargeTrxDate" class="form-input" value="${todayStr}">
                </div>
                <div class="form-group">
                    <label>ساعت</label>
                    <input type="time" id="chargeTrxTime" class="form-input" value="${timeStr}">
                </div>
            </div>
            <div class="form-group">
                <label>عکس (اختیاری)</label>
                <div class="drag-drop-zone" id="chargeTrxDragZone" ondrop="handleDrop(event, 'chargeTrx')" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                    <span style="font-size: 24px;">📸</span>
                    <p style="font-size: 12px;">عکس را بکشید یا <span class="drag-link" onclick="document.getElementById('chargeTrxFile').click()">انتخاب کنید</span></p>
                    <input type="file" id="chargeTrxFile" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'chargeTrx')">
                </div>
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('trx')">✅ ثبت</button>
        `;
    } else if (type === 'rial') {
        form = `
            <div class="form-group" style="padding: 15px; background: var(--dark-bg); border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: var(--admin-color);">👤 بازیکن: ${currentPlayer.name}</strong>
            </div>
            <div class="form-group">
                <label>شماره سفارش</label>
                <input type="text" id="chargeRialOrder" class="form-input" placeholder="">
            </div>
            <div class="form-group">
                <label>مقدار (ریال)</label>
                <input type="number" id="chargeRialAmount" class="form-input" placeholder="0">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>تاریخ</label>
                    <input type="date" id="chargeRialDate" class="form-input" value="${todayStr}">
                </div>
                <div class="form-group">
                    <label>ساعت</label>
                    <input type="time" id="chargeRialTime" class="form-input" value="${timeStr}">
                </div>
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('rial')">✅ ثبت</button>
        `;
    } else if (type === 'debt') {
        form = `
            <div class="form-group" style="padding: 15px; background: var(--dark-bg); border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: var(--admin-color);">👤 بازیکن: ${currentPlayer.name}</strong>
            </div>
            <div class="form-group">
                <label>مقدار ژتون</label>
                <input type="number" id="chargeDebtAmount" class="form-input" placeholder="0">
            </div>
            <div class="form-group">
                <label>نوع</label>
                <select id="chargeDebtType" class="form-input" style="padding: 12px 16px;">
                    <option value="debt">بدهی ➖</option>
                    <option value="credit">کریدیت ➕</option>
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>تاریخ</label>
                    <input type="date" id="chargeDebtDate" class="form-input" value="${todayStr}">
                </div>
                <div class="form-group">
                    <label>ساعت</label>
                    <input type="time" id="chargeDebtTime" class="form-input" value="${timeStr}">
                </div>
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('debt')">✅ ثبت</button>
        `;
    } else if (type === 'payment') {
        form = `
            <div class="form-group" style="padding: 15px; background: var(--dark-bg); border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: var(--admin-color);">👤 بازیکن: ${currentPlayer.name}</strong>
            </div>
            <div class="form-group">
                <label>مقدار پرداختی</label>
                <input type="number" id="chargePaymentAmount" class="form-input" placeholder="0">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>تاریخ</label>
                    <input type="date" id="chargePaymentDate" class="form-input" value="${todayStr}">
                </div>
                <div class="form-group">
                    <label>ساعت</label>
                    <input type="time" id="chargePaymentTime" class="form-input" value="${timeStr}">
                </div>
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('payment')">✅ ثبت</button>
        `;
    }

    container.innerHTML = form;
}

function submitCharge(type) {
    const admin = admins[currentAdmin];
    let record = null;

    if (type === 'usdt') {
        const amount = parseFloat(document.getElementById('chargeUsdtAmount').value);
        const tokens = parseInt(document.getElementById('chargeUsdtTokens').value);
        const wallet = document.getElementById('chargeUsdtWallet').value;
        const hash = document.getElementById('chargeUsdtHash').value || '';
        const date = document.getElementById('chargeUsdtDate').value;
        const time = document.getElementById('chargeUsdtTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!amount || !tokens || !wallet) {
            alert('❌ تمام فیلدهای ضروری را پر کنید!');
            return;
        }

        currentPlayer.totalCharge += tokens;
        record = {
            date: farsiDate,
            time: time,
            displayAmount: `+${tokens}`,
            details: `USDT: ${amount} | والت: ${wallet}${hash ? ' | هش: ' + hash.substring(0, 8) : ''}`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
        window.chargeUsdtScreenshot = null;
    } else if (type === 'trx') {
        const amount = parseFloat(document.getElementById('chargeTrxAmount').value);
        const tokens = parseInt(document.getElementById('chargeTrxTokens').value);
        const wallet = document.getElementById('chargeTrxWallet').value;
        const hash = document.getElementById('chargeTrxHash').value || '';
        const date = document.getElementById('chargeTrxDate').value;
        const time = document.getElementById('chargeTrxTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!amount || !tokens || !wallet) {
            alert('❌ تمام فیلدهای ضروری را پر کنید!');
            return;
        }

        currentPlayer.totalCharge += tokens;
        record = {
            date: farsiDate,
            time: time,
            displayAmount: `+${tokens}`,
            details: `TRX: ${amount} | والت: ${wallet}${hash ? ' | هش: ' + hash.substring(0, 8) : ''}`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
        window.chargeTrxScreenshot = null;
    } else if (type === 'rial') {
        const order = document.getElementById('chargeRialOrder').value;
        const amount = parseInt(document.getElementById('chargeRialAmount').value);
        const date = document.getElementById('chargeRialDate').value;
        const time = document.getElementById('chargeRialTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!order || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        currentPlayer.totalCharge += amount;
        record = {
            date: farsiDate,
            time: time,
            displayAmount: `+${amount} ریال`,
            details: `سفارش: ${order}`,
            adminName: admin.name,
            adminColor: admin.color,
            adminId: currentAdmin
        };
    } else if (type === 'debt') {
        const amount = parseInt(document.getElementById('chargeDebtAmount').value);
        const debtType = document.getElementById('chargeDebtType').value;
        const date = document.getElementById('chargeDebtDate').value;
        const time = document.getElementById('chargeDebtTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!amount) {
            alert('❌ مقدار را وارد کنید!');
            return;
        }

        if (debtType === 'debt') {
            currentPlayer.totalDebt += amount;
            record = {
                date: farsiDate,
                time: time,
                displayAmount: `-${amount}`,
                details: `بدهی جدید`,
                adminName: admin.name,
                adminColor: admin.color,
                adminId: currentAdmin
            };
        } else {
            currentPlayer.totalCharge += amount;
            record = {
                date: farsiDate,
                time: time,
                displayAmount: `+${amount}`,
                details: `کریدیت اضافی`,
                adminName: admin.name,
                adminColor: admin.color,
                adminId: currentAdmin
            };
        }
    } else if (type === 'payment') {
        const amount = parseInt(document.getElementById('chargePaymentAmount').value);
        const date = document.getElementById('chargePaymentDate').value;
        const time = document.getElementById('chargePaymentTime').value;
        const farsiDate = convertToFarsiDate(date);

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
            date: farsiDate,
            time: time,
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

// ===== Export =====
function openExportDialog(type) {
    currentExportType = type;
    document.getElementById('exportType').textContent = getTypeLabel(type);
    document.getElementById('selectedExportType').value = 'daily';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    document.getElementById('exportStartDate').value = todayStr;
    document.getElementById('exportEndDate').value = todayStr;
    document.getElementById('exportStartTime').value = '';
    document.getElementById('exportEndTime').value = '';
    
    document.querySelectorAll('.export-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-type="daily"]').classList.add('active');
    
    document.getElementById('exportModal').classList.add('active');
}

function selectExportType(type) {
    document.getElementById('selectedExportType').value = type;
    document.querySelectorAll('.export-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
}

function executeExport() {
    const type = currentExportType;
    const exportType = document.getElementById('selectedExportType').value;
    
    let startDate, endDate;
    const today = getTodayDate();
    
    if (exportType === 'daily') {
        startDate = today;
        endDate = today;
    } else if (exportType === 'weekly') {
        const dateStr = document.getElementById('exportStartDate').value;
        const date = new Date(dateStr);
        const day = date.getDay();
        const diff = date.getDate() - day;
        const weekStart = new Date(date.setDate(diff));
        startDate = convertToFarsiDate(weekStart.toISOString().split('T')[0]);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        endDate = convertToFarsiDate(weekEnd.toISOString().split('T')[0]);
    } else if (exportType === 'monthly') {
        const dateStr = document.getElementById('exportStartDate').value;
        const date = new Date(dateStr);
        startDate = convertToFarsiDate(new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]);
        endDate = convertToFarsiDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]);
    }
    
    const startTime = document.getElementById('exportStartTime').value || '00:00';
    const endTime = document.getElementById('exportEndTime').value || '23:59';
    
    generateExcelReport(type, startDate, endDate, startTime, endTime, exportType);
    closeModal('exportModal');
}

function generateExcelReport(type, startDate, endDate, startTime, endTime, exportType) {
    let filtered = transactions.filter(t => {
        if (type === 'usdt') {
            return t.type === 'usdt-bep20' || t.type === 'usdt-trc20';
        } else if (type === 'cashout') {
            return t.type === 'cashout-rial' || t.type === 'cashout-wallet';
        }
        return t.type === type;
    });
    
    const isDateInRange = (tDate) => {
        return tDate === startDate || tDate === endDate || (tDate > startDate && tDate < endDate);
    };
    
    filtered = filtered.filter(t => {
        if (!isDateInRange(t.date)) return false;
        
        if (t.date === startDate && t.date === endDate) {
            const tTime = t.time.split(':');
            const tTimeNum = parseInt(tTime[0] + (tTime[1] || '00'));
            const startTimeNum = parseInt(startTime.replace(':', ''));
            const endTimeNum = parseInt(endTime.replace(':', ''));
            
            if (tTimeNum < startTimeNum || tTimeNum > endTimeNum) return false;
        }
        
        return true;
    });

    if (filtered.length === 0) {
        alert('❌ هیچ تراکنشی برای این محدوده وجود ندارد');
        return;
    }

    const data = [];
    data.push(['Silent Poker Accountant']);
    data.push(['گزارش تراکنش‌های ' + getTypeLabel(type)]);
    data.push(['نوع گزارش: ' + getExportTypeLabel(exportType)]);
    data.push(['محدوده: ' + startDate + ' تا ' + endDate]);
    if (startTime || endTime) {
        data.push(['ساعت: ' + startTime + ' تا ' + endTime]);
    }
    data.push(['ساعت صادر: ' + new Date().toLocaleTimeString('fa-IR')]);
    data.push(['']);

    const headers = ['ردیف', 'تاریخ', 'ساعت', 'بازیکن', 'مقدار', 'ادمین'];
    if (type === 'usdt' || type === 'trx' || type === 'card') headers.push('ژتون');
    if (type === 'usdt' || type === 'trx') {
        headers.push('والت');
        headers.push('هش تراکنش');
    }
    if (type === 'rial') headers.push('سفارش');
    if (type === 'cashout') {
        headers.push('نوع');
        headers.push('کارت/والت');
    }

    data.push(headers);

    filtered.forEach((t, idx) => {
        const row = [idx + 1, t.date, t.time, t.player, t.amount, t.adminName];
        if (type === 'usdt' || type === 'trx' || type === 'card') row.push(t.tokens);
        if (type === 'usdt' || type === 'trx') {
            row.push(t.wallet);
            row.push(t.hash);
        }
        if (type === 'rial') row.push(t.wallet);
        if (type === 'cashout') {
            row.push(t.type === 'cashout-rial' ? 'ریالی' : 'والت');
            row.push(t.wallet);
        }
        data.push(row);
    });

    data.push(['']);
    data.push(['خلاصه:']);
    data.push(['کل تراکنش‌ها', filtered.length]);
    data.push(['کل مقدار', filtered.reduce((sum, t) => sum + t.amount, 0)]);
    if (type === 'usdt' || type === 'trx' || type === 'card') {
        data.push(['کل ژتون', filtered.reduce((sum, t) => sum + t.tokens, 0)]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, getTypeLabel(type));
    
    const fileName = `Silent_Poker_${getTypeLabel(type)}_${startDate}_${exportType}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function getExportTypeLabel(type) {
    const labels = { daily: 'روزانه', weekly: 'هفتگی', monthly: 'ماهانه' };
    return labels[type] || type;
}

function getTypeLabel(type) {
    const labels = {
        'usdt-bep20': 'USDT-BEP20',
        'usdt-trc20': 'USDT-TRC20',
        usdt: 'USDT',
        trx: 'TRX',
        debt: 'Debt',
        rial: 'Rial',
        card: 'Card',
        payment: 'Payment',
        cashout: 'Cashout'
    };
    return labels[type] || type;
}

// ===== تعویض تب‌ها =====
function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(section => section.classList.remove('active'));

    event.target.closest('.nav-item').classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName !== 'players') {
        displayTransactions(tabName);
    }
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
