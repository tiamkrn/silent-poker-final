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

// ===== تراکنش‌های جدید =====
function addTransaction(type) {
    const today = getTodayDate();
    const admin = admins[currentAdmin];
    
    if (type === 'usdt') {
        const player = document.getElementById('usdtPlayer').value.trim();
        const amount = parseFloat(document.getElementById('usdtAmount').value);
        const tokens = parseInt(document.getElementById('usdtTokens').value);
        const wallet = document.getElementById('usdtWallet').value.trim();
        const hash = document.getElementById('usdtHash').value.trim();
        const screenshot = document.getElementById('usdtScreenshot').files[0];

        if (!player || !amount || !tokens || !wallet || !hash) {
            alert('❌ تمام فیلدهای ضروری را پر کنید!');
            return;
        }

        if (screenshot) {
            const reader = new FileReader();
            reader.onload = function(e) {
                saveTransaction('usdt', player, amount, tokens, wallet, hash, e.target.result, admin);
            };
            reader.readAsDataURL(screenshot);
        } else {
            saveTransaction('usdt', player, amount, tokens, wallet, hash, null, admin);
        }
    }
    
    if (type === 'trx') {
        const player = document.getElementById('trxPlayer').value.trim();
        const amount = parseFloat(document.getElementById('trxAmount').value);
        const tokens = parseInt(document.getElementById('trxTokens').value);
        const wallet = document.getElementById('trxWallet').value.trim();
        const hash = document.getElementById('trxHash').value.trim();
        const screenshot = document.getElementById('trxScreenshot').files[0];

        if (!player || !amount || !tokens || !wallet || !hash) {
            alert('❌ تمام فیلدهای ضروری را پر کنید!');
            return;
        }

        if (screenshot) {
            const reader = new FileReader();
            reader.onload = function(e) {
                saveTransaction('trx', player, amount, tokens, wallet, hash, e.target.result, admin);
            };
            reader.readAsDataURL(screenshot);
        } else {
            saveTransaction('trx', player, amount, tokens, wallet, hash, null, admin);
        }
    }

    if (type === 'rial') {
        const player = document.getElementById('rialPlayer').value.trim();
        const order = document.getElementById('rialOrder').value.trim();
        const amount = parseInt(document.getElementById('rialAmount').value);

        if (!player || !order || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('rial', player, amount, 0, order, '', null, admin);
    }

    if (type === 'debt') {
        const player = document.getElementById('debtPlayer').value.trim();
        const amount = parseInt(document.getElementById('debtAmount').value);

        if (!player || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('debt', player, amount, 0, '', '', null, admin);
    }

    if (type === 'card') {
        const player = document.getElementById('cardPlayer').value.trim();
        const amount = parseInt(document.getElementById('cardAmount').value);
        const tokens = parseInt(document.getElementById('cardTokens').value);

        if (!player || !amount || !tokens) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('card', player, amount, tokens, '', '', null, admin);
    }

    if (type === 'payment') {
        const player = document.getElementById('paymentPlayer').value.trim();
        const amount = parseInt(document.getElementById('paymentAmount').value);

        if (!player || !amount) {
            alert('❌ تمام فیلدها را پر کنید!');
            return;
        }

        saveTransaction('payment', player, amount, 0, '', '', null, admin);
    }
}

function saveTransaction(type, player, amount, tokens, wallet, hash, screenshot, admin) {
    const today = getTodayDate();
    const time = new Date().toLocaleTimeString('fa-IR');
    
    const transaction = {
        id: Date.now(),
        type: type,
        date: today,
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
    
    // پاک کردن فیلدها
    clearTransactionForm(type);
    displayTransactions(type);
}

function clearTransactionForm(type) {
    if (type === 'usdt') {
        document.getElementById('usdtPlayer').value = '';
        document.getElementById('usdtAmount').value = '';
        document.getElementById('usdtTokens').value = '';
        document.getElementById('usdtWallet').value = '';
        document.getElementById('usdtHash').value = '';
        document.getElementById('usdtScreenshot').value = '';
    } else if (type === 'trx') {
        document.getElementById('trxPlayer').value = '';
        document.getElementById('trxAmount').value = '';
        document.getElementById('trxTokens').value = '';
        document.getElementById('trxWallet').value = '';
        document.getElementById('trxHash').value = '';
        document.getElementById('trxScreenshot').value = '';
    } else if (type === 'rial') {
        document.getElementById('rialPlayer').value = '';
        document.getElementById('rialOrder').value = '';
        document.getElementById('rialAmount').value = '';
    } else if (type === 'debt') {
        document.getElementById('debtPlayer').value = '';
        document.getElementById('debtAmount').value = '';
    } else if (type === 'card') {
        document.getElementById('cardPlayer').value = '';
        document.getElementById('cardAmount').value = '';
        document.getElementById('cardTokens').value = '';
    } else if (type === 'payment') {
        document.getElementById('paymentPlayer').value = '';
        document.getElementById('paymentAmount').value = '';
    }
}

function displayTransactions(type) {
    const today = getTodayDate();
    const filtered = transactions.filter(t => t.type === type && t.date === today);
    const container = document.getElementById(type + 'Transactions');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">هیچ تراکنشی ثبت نشده است</p>';
        return;
    }

    let html = `
        <table class="transaction-table">
            <tr>
                <th>زمان</th>
                <th>بازیکن</th>
                <th>مقدار</th>
                ${type === 'usdt' || type === 'trx' || type === 'card' ? '<th>ژتون</th>' : ''}
                ${type === 'usdt' || type === 'trx' ? '<th>والت</th><th>هش</th>' : ''}
                ${type === 'rial' ? '<th>سفارش</th>' : ''}
                <th>ادمین</th>
                <th>عملیات</th>
            </tr>
    `;
    
    filtered.forEach((t) => {
        html += `<tr>
            <td>${t.time}</td>
            <td>${t.player}</td>
            <td>${t.amount.toLocaleString()}</td>
            ${t.type === 'usdt' || t.type === 'trx' || t.type === 'card' ? `<td>${t.tokens}</td>` : ''}
            ${t.type === 'usdt' || t.type === 'trx' ? `<td>${t.wallet}</td><td><span style="font-size: 10px;">${t.hash.substring(0, 8)}...</span></td>` : ''}
            ${t.type === 'rial' ? `<td>${t.wallet}</td>` : ''}
            <td style="color: ${t.adminColor}; font-weight: 600;">${t.adminName}</td>
            <td>
                ${t.screenshot ? `<button class="btn-small" onclick="viewScreenshot('${t.screenshot.replace(/'/g, "\\'")}')">📸</button>` : ''}
                <button class="btn-small" onclick="deleteTransaction('${t.type}', ${t.id})">🗑️</button>
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

// ===== Export Excel =====
function exportToExcel(type) {
    const today = getTodayDate();
    const filtered = transactions.filter(t => t.type === type && t.date === today);

    if (filtered.length === 0) {
        alert('❌ هیچ تراکنشی برای صادر کردن وجود ندارد');
        return;
    }

    const data = [];
    data.push(['Silent Poker Accountant']);
    data.push(['گزارش تراکنش‌های ' + getTypeLabel(type)]);
    data.push(['تاریخ: ' + today]);
    data.push(['ساعت صادر: ' + new Date().toLocaleTimeString('fa-IR')]);
    data.push(['']);

    const headers = ['ردیف', 'زمان', 'بازیکن', 'مقدار', 'ادمین'];
    if (type === 'usdt' || type === 'trx' || type === 'card') headers.push('ژتون');
    if (type === 'usdt' || type === 'trx') {
        headers.push('والت');
        headers.push('هش تراکنش');
    }
    if (type === 'rial') headers.push('سفارش');

    data.push(headers);

    filtered.forEach((t, idx) => {
        const row = [idx + 1, t.time, t.player, t.amount, t.adminName];
        if (type === 'usdt' || type === 'trx' || type === 'card') row.push(t.tokens);
        if (type === 'usdt' || type === 'trx') {
            row.push(t.wallet);
            row.push(t.hash);
        }
        if (type === 'rial') row.push(t.wallet);
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
    XLSX.writeFile(wb, `Silent_Poker_${getTypeLabel(type)}_${today}.xlsx`);
}

function getTypeLabel(type) {
    const labels = {
        usdt: 'USDT',
        trx: 'TRX',
        debt: 'Debt',
        rial: 'Rial',
        card: 'Card',
        payment: 'Payment'
    };
    return labels[type] || type;
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
                <input type="number" id="chargeUsdtAmount" placeholder="0.00" step="0.01">
            </div>
            <div class="form-group">
                <label>تعداد ژتون</label>
                <input type="number" id="chargeUsdtTokens" placeholder="0">
            </div>
            <div class="form-group">
                <label>نام والت</label>
                <input type="text" id="chargeUsdtWallet" placeholder="">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('usdt')">ثبت</button>
        `;
    } else if (type === 'trx') {
        form = `
            <div class="form-group">
                <label>مقدار TRX</label>
                <input type="number" id="chargeTrxAmount" placeholder="0.00" step="0.01">
            </div>
            <div class="form-group">
                <label>تعداد ژتون</label>
                <input type="number" id="chargeTrxTokens" placeholder="0">
            </div>
            <div class="form-group">
                <label>نام والت</label>
                <input type="text" id="chargeTrxWallet" placeholder="">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('trx')">ثبت</button>
        `;
    } else if (type === 'rial') {
        form = `
            <div class="form-group">
                <label>شماره سفارش</label>
                <input type="text" id="chargeRialOrder" placeholder="">
            </div>
            <div class="form-group">
                <label>مقدار (ریال)</label>
                <input type="number" id="chargeRialAmount" placeholder="0">
            </div>
            <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="submitCharge('rial')">ثبت</button>
        `;
    } else if (type === 'debt') {
        form = `
            <div class="form-group">
                <label>مقدار ژتون</label>
                <input type="number" id="chargeDebtAmount" placeholder="0">
            </div>
            <div class="form-group">
                <label>نوع</label>
                <select id="chargeDebtType" style="width: 100%; padding: 10px; background: var(--dark-bg); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
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
                <input type="number" id="chargePaymentAmount" placeholder="0">
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
        const amount = parseFloat(document.getElementById('chargeUsdtAmount').value);
        const tokens = parseInt(document.getElementById('chargeUsdtTokens').value);
        const wallet = document.getElementById('chargeUsdtWallet').value;

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
        const amount = parseFloat(document.getElementById('chargeTrxAmount').value);
        const tokens = parseInt(document.getElementById('chargeTrxTokens').value);
        const wallet = document.getElementById('chargeTrxWallet').value;

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
        const order = document.getElementById('chargeRialOrder').value;
        const amount = parseInt(document.getElementById('chargeRialAmount').value);

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
        const amount = parseInt(document.getElementById('chargeDebtAmount').value);
        const debtType = document.getElementById('chargeDebtType').value;

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
        const amount = parseInt(document.getElementById('chargePaymentAmount').value);

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
