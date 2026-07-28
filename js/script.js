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

    document.getElementById('usdtBep20Date').value = todayStr;
    document.getElementById('usdtBep20Time').value = timeStr;

    document.getElementById('usdtTrc20Date').value = todayStr;
    document.getElementById('usdtTrc20Time').value = timeStr;

    document.getElementById('trxDate').value = todayStr;
    document.getElementById('trxTime').value = timeStr;

    document.getElementById('debtDate').value = todayStr;
    document.getElementById('debtTime').value = timeStr;

    document.getElementById('rialDate').value = todayStr;
    document.getElementById('rialTime').value = timeStr;

    document.getElementById('cardDate').value = todayStr;
    document.getElementById('cardTime').value = timeStr;

    document.getElementById('paymentDate').value = todayStr;
    document.getElementById('paymentTime').value = timeStr;

    document.getElementById('rialCashoutDate').value = todayStr;
    document.getElementById('rialCashoutTime').value = timeStr;

    document.getElementById('walletCashoutDate').value = todayStr;
    document.getElementById('walletCashoutTime').value = timeStr;
}

// ===== مدیریت داده‌ها =====
function loadData() {
    const savedPlayers = localStorage.getItem('silentPokerData');
    const savedTransactions = localStorage.getItem('silentPokerTransactions');
    
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
    }
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

function saveData() {
    localStorage.setItem('silentPokerData', JSON.stringify(players));
    localStorage.setItem('silentPokerTransactions', JSON.stringify(transactions));
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
    
    // گرفتن متن جستجو
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

// ===== Drag & Drop Functions =====
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
                dragZone.innerHTML = `
                    <span style="font-size: 32px;">✅</span>
                    <p style="color: var(--admin-color);">عکس آپلود شد</p>
                `;
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

    if (type === 'bep20') {
        document.getElementById('usdtBep20Section').style.display = 'block';
        document.getElementById('usdtTrc20Section').style.display = 'none';
    } else {
        document.getElementById('usdtBep20Section').style.display = 'none';
        document.getElementById('usdtTrc20Section').style.display = 'block';
    }
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

    if (type === 'rial') {
        document.getElementById('cashoutRialSection').style.display = 'block';
        document.getElementById('cashoutWalletSection').style.display = 'none';
    } else {
        document.getElementById('cashoutRialSection').style.display = 'none';
        document.getElementById('cashoutWalletSection').style.display = 'block';
    }
}

// ===== تراکنش‌های جدید =====
function addTransaction(type) {
    const admin = admins[currentAdmin];
    
    if (type === 'usdt-bep20') {
        const player = document.getElementById('usdtBep20Player').value.trim();
        const amount = parseFloat(document.getElementById('usdtBep20Amount').value);
        const tokens = parseInt(document.getElementById('usdtBep20Tokens').value);
        const wallet = document.getElementById('usdtBep20Wallet').value.trim();
        let hash = document.getElementById('usdtBep20Hash').value.trim();
        let screenshot = window.usdtBep20Screenshot || null;
        const date = document.getElementById('usdtBep20Date').value;
        const time = document.getElementById('usdtBep20Time').value;

        if (!player || !amount || !tokens || !wallet) {
            alert('❌ نام بازیکن، مقدار، ژتون و والت ضروری هستند!');
            return;
        }

        if (!hash && !screenshot) {
            alert('❌ حداقل یکی از هش تراکنش یا عکس ضروری است!');
            return;
        }

        saveTransaction('usdt-bep20', player, amount, tokens, wallet, hash, screenshot, admin, date, time);
        window.usdtBep20Screenshot = null;
        document.getElementById('usdtBep20Player').value = '';
        document.getElementById('usdtBep20Amount').value = '';
        document.getElementById('usdtBep20Tokens').value = '';
        document.getElementById('usdtBep20Wallet').value = '';
        document.getElementById('usdtBep20Hash').value = '';
        document.getElementById('usdtBep20DragZone').innerHTML = `
            <span style="font-size: 32px;">📸</span>
            <p>عکس اسکین را بکشید یا <span class="drag-link" onclick="document.getElementById('usdtBep20File').click()">انتخاب کنید</span></p>
        `;
        setCurrentDateTime();
        displayTransactions('usdt');
    }

    if (type === 'usdt-trc20') {
        const player = document.getElementById('usdtTrc20Player').value.trim();
        const amount = parseFloat(document.getElementById('usdtTrc20Amount').value);
        const tokens = parseInt(document.getElementById('usdtTrc20Tokens').value);
        const wallet = document.getElementById('usdtTrc20Wallet').value.trim();
        let hash = document.getElementById('usdtTrc20Hash').value.trim();
        let screenshot = window.usdtTrc20Screenshot || null;
        const date = document.getElementById('usdtTrc20Date').value;
        const time = document.getElementById('usdtTrc20Time').value;

        if (!player || !amount || !tokens || !wallet) {
            alert('❌ نام بازیکن، مقدار، ژتون و والت ضروری هستند!');
            return;
        }

        if (!hash && !screenshot) {
            alert('❌ حداقل یکی از هش تراکنش یا عکس ضروری است!');
            return;
        }

        saveTransaction('usdt-trc20', player, amount, tokens, wallet, hash, screenshot, admin, date, time);
        window.usdtTrc20Screenshot = null;
        document.getElementById('usdtTrc20Player').value = '';
        document.getElementById('usdtTrc20Amount').value = '';
        document.getElementById('usdtTrc20Tokens').value = '';
        document.getElementById('usdtTrc20Wallet').value = '';
        document.getElementById('usdtTrc20Hash').value = '';
        document.getElementById('usdtTrc20DragZone').innerHTML = `
            <span style="font-size: 32px;">📸</span>
            <p>عکس اسکین را بکشید یا <span class="drag-link" onclick="document.getElementById('usdtTrc20File').click()">انتخاب کنید</span></p>
        `;
        setCurrentDateTime();
        displayTransactions('usdt');
    }

    if (type === 'trx') {
        const player = document.getElementById('trxPlayer').value.trim();
        const amount = parseFloat(document.getElementById('trxAmount').value);
        const tokens = parseInt(document.getElementById('trxTokens').value);
        const wallet = document.getElementById('trxWallet').value.trim();
        let hash = document.getElementById('trxHash').value.trim();
        let screenshot = window.trxScreenshot || null;
        const date = document.getElementById('trxDate').value;
        const time = document.getElementById('trxTime').value;

        if (!player || !amount || !tokens || !wallet) {
            alert('❌ نام بازیکن، مقدار، ژتون و والت ضروری هستند!');
            return;
        }

        if (!hash && !screenshot) {
            alert('❌ حداقل یکی از هش تراکنش یا عکس ضروری است!');
            return;
        }

        saveTransaction('trx', player, amount, tokens, wallet, hash, screenshot, admin, date, time);
        window.trxScreenshot = null;
        document.getElementById('trxPlayer').value = '';
        document.getElementById('trxAmount').value = '';
        document.getElementById('trxTokens').value = '';
        document.getElementById('trxWallet').value = '';
        document.getElementById('trxHash').value = '';
        document.getElementById('trxDragZone').innerHTML = `
            <span style="font-size: 32px;">📸</span>
            <p>عکس اسکین را بکشید یا <span class="drag-link" onclick="document.getElementById('trxFile').click()">انتخاب کنید</span></p>
        `;
        setCurrentDateTime();
        displayTransactions('trx');
    }

    if (type === 'rial') {
        const player = document.getElementById('rialPlayer').value.trim();
        const order = document.getElementById('rialOrder').value.trim();
        const amount = parseInt(document.getElementById('rialAmount').value);
        const date = document.getElementById('rialDate').value;
        const time = document.getElementById('rialTime').value;

        if (!player || !order || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('rial', player, amount, 0, order, '', null, admin, date, time);
        document.getElementById('rialPlayer').value = '';
        document.getElementById('rialOrder').value = '';
        document.getElementById('rialAmount').value = '';
        setCurrentDateTime();
        displayTransactions('rial');
    }

    if (type === 'debt') {
        const player = document.getElementById('debtPlayer').value.trim();
        const amount = parseInt(document.getElementById('debtAmount').value);
        const date = document.getElementById('debtDate').value;
        const time = document.getElementById('debtTime').value;

        if (!player || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('debt', player, amount, 0, '', '', null, admin, date, time);
        document.getElementById('debtPlayer').value = '';
        document.getElementById('debtAmount').value = '';
        setCurrentDateTime();
        displayTransactions('debt');
    }

    if (type === 'card') {
        const player = document.getElementById('cardPlayer').value.trim();
        const amount = parseInt(document.getElementById('cardAmount').value);
        const tokens = parseInt(document.getElementById('cardTokens').value);
        const date = document.getElementById('cardDate').value;
        const time = document.getElementById('cardTime').value;

        if (!player || !amount || !tokens) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('card', player, amount, tokens, '', '', null, admin, date, time);
        document.getElementById('cardPlayer').value = '';
        document.getElementById('cardAmount').value = '';
        document.getElementById('cardTokens').value = '';
        setCurrentDateTime();
        displayTransactions('card');
    }

    if (type === 'payment') {
        const player = document.getElementById('paymentPlayer').value.trim();
        const amount = parseInt(document.getElementById('paymentAmount').value);
        const date = document.getElementById('paymentDate').value;
        const time = document.getElementById('paymentTime').value;

        if (!player || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('payment', player, amount, 0, '', '', null, admin, date, time);
        document.getElementById('paymentPlayer').value = '';
        document.getElementById('paymentAmount').value = '';
        setCurrentDateTime();
        displayTransactions('payment');
    }

    if (type === 'cashout-rial') {
        const player = document.getElementById('rialCashoutPlayer').value.trim();
        const amount = parseInt(document.getElementById('rialCashoutAmount').value);
        const card = document.getElementById('rialCashoutCard').value.trim();
        const date = document.getElementById('rialCashoutDate').value;
        const time = document.getElementById('rialCashoutTime').value;

        if (!player || !amount || !card) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('cashout-rial', player, amount, 0, card, '', null, admin, date, time);
        document.getElementById('rialCashoutPlayer').value = '';
        document.getElementById('rialCashoutAmount').value = '';
        document.getElementById('rialCashoutCard').value = '';
        setCurrentDateTime();
        displayTransactions('cashout');
    }

    if (type === 'cashout-wallet') {
        const player = document.getElementById('walletCashoutPlayer').value.trim();
        const amount = parseInt(document.getElementById('walletCashoutAmount').value);
        const address = document.getElementById('walletCashoutAddress').value.trim();
        const date = document.getElementById('walletCashoutDate').value;
        const time = document.getElementById('walletCashoutTime').value;

        if (!player || !amount || !address) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('cashout-wallet', player, amount, 0, address, '', null, admin, date, time);
        document.getElementById('walletCashoutPlayer').value = '';
        document.getElementById('walletCashoutAmount').value = '';
        document.getElementById('walletCashoutAddress').value = '';
        setCurrentDateTime();
        displayTransactions('cashout');
    }
}

function saveTransaction(type, player, amount, tokens, wallet, hash, screenshot, admin, date, time) {
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

    const playerOptions = players.map(p => `<option value="${p.name}">${p.name}</option>`).join('');

    if (type === 'usdt') {
        form = `
            <div class="form-group">
                <label>👤 انتخاب بازیکن:</label>
                <select id="chargeUsdtPlayer" class="form-input">
                    <option value="">-- انتخاب کنید --</option>
                    ${playerOptions}
                </select>
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
            <div class="form-group">
                <label>👤 انتخاب بازیکن:</label>
                <select id="chargeTrxPlayer" class="form-input">
                    <option value="">-- انتخاب کنید --</option>
                    ${playerOptions}
                </select>
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
            <div class="form-group">
                <label>👤 انتخاب بازیکن:</label>
                <select id="chargeRialPlayer" class="form-input">
                    <option value="">-- انتخاب کنید --</option>
                    ${playerOptions}
                </select>
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
            <div class="form-group">
                <label>👤 انتخاب بازیکن:</label>
                <select id="chargeDebtPlayer" class="form-input">
                    <option value="">-- انتخاب کنید --</option>
                    ${playerOptions}
                </select>
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
            <div class="form-group">
                <label>👤 انتخاب بازیکن:</label>
                <select id="chargePaymentPlayer" class="form-input">
                    <option value="">-- انتخاب کنید --</option>
                    ${playerOptions}
                </select>
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
    let playerName = '';

    if (type === 'usdt') {
        playerName = document.getElementById('chargeUsdtPlayer').value;
        const amount = parseFloat(document.getElementById('chargeUsdtAmount').value);
        const tokens = parseInt(document.getElementById('chargeUsdtTokens').value);
        const wallet = document.getElementById('chargeUsdtWallet').value;
        const hash = document.getElementById('chargeUsdtHash').value || '';
        const screenshot = window.chargeUsdtScreenshot || null;
        const date = document.getElementById('chargeUsdtDate').value;
        const time = document.getElementById('chargeUsdtTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!playerName) {
            alert('❌ بازیکن را انتخاب کنید!');
            return;
        }

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
        playerName = document.getElementById('chargeTrxPlayer').value;
        const amount = parseFloat(document.getElementById('chargeTrxAmount').value);
        const tokens = parseInt(document.getElementById('chargeTrxTokens').value);
        const wallet = document.getElementById('chargeTrxWallet').value;
        const hash = document.getElementById('chargeTrxHash').value || '';
        const screenshot = window.chargeTrxScreenshot || null;
        const date = document.getElementById('chargeTrxDate').value;
        const time = document.getElementById('chargeTrxTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!playerName) {
            alert('❌ بازیکن را انتخاب کنید!');
            return;
        }

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
        playerName = document.getElementById('chargeRialPlayer').value;
        const order = document.getElementById('chargeRialOrder').value;
        const amount = parseInt(document.getElementById('chargeRialAmount').value);
        const date = document.getElementById('chargeRialDate').value;
        const time = document.getElementById('chargeRialTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!playerName) {
            alert('❌ بازیکن را انتخاب کنید!');
            return;
        }

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
        playerName = document.getElementById('chargeDebtPlayer').value;
        const amount = parseInt(document.getElementById('chargeDebtAmount').value);
        const debtType = document.getElementById('chargeDebtType').value;
        const date = document.getElementById('chargeDebtDate').value;
        const time = document.getElementById('chargeDebtTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!playerName) {
            alert('❌ بازیکن را انتخاب کنید!');
            return;
        }

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
        playerName = document.getElementById('chargePaymentPlayer').value;
        const amount = parseInt(document.getElementById('chargePaymentAmount').value);
        const date = document.getElementById('chargePaymentDate').value;
        const time = document.getElementById('chargePaymentTime').value;
        const farsiDate = convertToFarsiDate(date);

        if (!playerName) {
            alert('❌ بازیکن را انتخاب کنید!');
            return;
        }

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

// ===== Export Dialog =====
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
    
    if (exportType === 'daily') {
        const dateStr = document.getElementById('exportStartDate').value;
        startDate = convertToFarsiDate(dateStr);
        endDate = startDate;
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
    
    const compareDates = (dateStr) => {
        const parts = dateStr.split('/');
        return parts[0] + pad(parts[1]) + pad(parts[2]);
    };
    
    const startDateNum = compareDates(startDate);
    const endDateNum = compareDates(endDate);
    
    filtered = filtered.filter(t => {
        const tDateNum = compareDates(t.date);
        if (tDateNum < startDateNum || tDateNum > endDateNum) return false;
        
        if (startTime || endTime) {
            const tTime = t.time.split(':');
            const tTimeNum = tTime[0] + pad(tTime[1]);
            const startTimeNum = startTime.replace(':', '');
            const endTimeNum = endTime.replace(':', '');
            
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

function pad(num) {
    return String(num).padStart(2, '0');
}

function getExportTypeLabel(type) {
    const labels = {
        daily: 'روزانه',
        weekly: 'هفتگی',
        monthly: 'ماهانه'
    };
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
