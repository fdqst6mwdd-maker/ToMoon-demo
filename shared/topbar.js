/**
 * ToMoon Topbar Filter Module
 * 共享顶部筛选栏模块
 * 
 * 使用方法：
 * 1. 在HTML中引入此脚本 <script src="../shared/topbar.js"></script>
 * 2. 确保在 sidebar.js 之后引入，或在 initSidebar 之后调用 initTopbar()
 * 
 * 功能：
 * - 账户多选筛选器
 * - 日期范围选择器（日历 + 快捷方式）
 * - 状态持久化（sessionStorage）
 * - 自定义事件触发 (accountChanged, dateRangeChanged)
 */

// --- Topbar CSS Styles ---
const topbarStyles = `
    /* --- Topbar --- */
    .topbar {
        position: fixed;
        top: 0;
        left: var(--sidebar-width, 60px);
        right: 0;
        height: var(--topbar-height, 60px);
        background: var(--bg-card, #1a1d24);
        border-bottom: 1px solid var(--border, #334155);
        z-index: 90;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
    }

    .sidebar.expanded ~ .topbar {
        left: var(--sidebar-expanded-width, 250px);
    }
    
    .topbar-left, .topbar-right { display: flex; align-items: center; gap: 15px; }
    
    .filter-group {
        display: flex; align-items: center; gap: 8px; padding: 6px 12px;
        background: var(--bg-panel, #232730); border: 1px solid var(--border, #334155);
        border-radius: 6px; color: var(--text-main, #e2e8f0); font-size: 13px;
        cursor: pointer; transition: all 0.2s;
        position: relative;
    }
    .filter-group:hover { background: rgba(255,255,255,0.05); border-color: var(--text-muted, #94a3b8); }
    .filter-icon { width: 16px; height: 16px; stroke: currentColor; }
    .filter-divider { width: 1px; height: 20px; background: var(--border, #334155); margin: 0 5px; }

    /* Dropdown Menu */
    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 5px;
        background: var(--bg-card, #1a1d24);
        border: 1px solid var(--border, #334155);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        min-width: 180px;
        z-index: 100;
        display: none;
        flex-direction: column;
        padding: 5px;
    }
    .dropdown-menu.show { display: flex; }
    
    /* Date Picker Specific Styles */
    .date-picker-dropdown {
        width: auto;
        min-width: 480px;
        padding: 0;
        flex-direction: row;
        overflow: hidden;
    }
    
    .calendar-section {
        flex: 1;
        padding: 15px;
        border-right: 1px solid var(--border, #334155);
    }
    
    .shortcuts-section {
        width: 140px;
        padding: 10px;
        background: rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        color: var(--text-main, #e2e8f0);
        font-weight: 600;
        font-size: 14px;
    }
    
    .calendar-nav-btn {
        background: transparent;
        border: 1px solid var(--border, #334155);
        color: var(--text-muted, #94a3b8);
        border-radius: 4px;
        cursor: pointer;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .calendar-nav-btn:hover {
        color: var(--text-main, #e2e8f0);
        border-color: var(--text-muted, #94a3b8);
        background: rgba(255,255,255,0.05);
    }
    
    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 5px;
    }
    
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        text-align: center;
    }
    
    .calendar-day {
        font-size: 13px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        color: var(--text-main, #e2e8f0);
        transition: all 0.1s;
    }
    .calendar-day:hover {
        background: rgba(255,255,255,0.1);
    }
    .calendar-day.empty {
        pointer-events: none;
    }
    .calendar-day.selected {
        background: var(--primary, #3b82f6);
        color: white;
    }
    .calendar-day.in-range {
        background: rgba(59, 130, 246, 0.15);
        color: var(--primary, #3b82f6);
        border-radius: 0;
    }
    .calendar-day.range-start {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .calendar-day.range-end {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    
    .shortcut-btn {
        text-align: left;
        background: transparent;
        border: none;
        color: var(--text-muted, #94a3b8);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
    }
    .shortcut-btn:hover {
        background: rgba(255,255,255,0.05);
        color: var(--text-main, #e2e8f0);
    }
    .shortcut-btn.active {
        color: var(--primary, #3b82f6);
        background: rgba(59, 130, 246, 0.1);
        font-weight: 500;
    }

    .dropdown-item {
        padding: 8px 12px;
        border-radius: 4px;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .dropdown-item:hover {
        background: rgba(255,255,255,0.05);
        color: var(--text-main, #e2e8f0);
    }
    .dropdown-item.active {
        color: var(--primary, #3b82f6);
        background: rgba(59, 130, 246, 0.1);
    }
    .dropdown-item input[type="checkbox"] {
        cursor: pointer;
        width: 14px;
        height: 14px;
        accent-color: var(--primary, #3b82f6);
    }
    .dropdown-item.manage-accounts {
        color: var(--primary, #3b82f6);
        font-weight: 500;
        justify-content: center;
    }
    .dropdown-item.manage-accounts:hover {
        background: rgba(59, 130, 246, 0.1);
    }
    .dropdown-divider {
        height: 1px;
        background: var(--border, #334155);
        margin: 5px 0;
    }

    /* Advanced Filters Dropdown */
    .filters-dropdown {
        min-width: 320px;
        max-height: 480px;
        overflow-y: auto;
        padding: 10px;
        right: 0;
        left: auto;
    }
    
    .filter-section {
        margin-bottom: 12px;
    }
    
    .filter-section:last-child {
        margin-bottom: 0;
    }
    
    .filter-section-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 8px;
        padding: 0 8px;
        font-weight: 600;
    }
    
    .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 4px;
    }
    
    .filter-chip {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        background: var(--bg-panel, #232730);
        border: 1px solid var(--border, #334155);
        border-radius: 16px;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;
    }
    
    .filter-chip:hover {
        border-color: var(--text-muted, #94a3b8);
        color: var(--text-main, #e2e8f0);
    }
    
    .filter-chip.active {
        background: rgba(59, 130, 246, 0.15);
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
    }
    
    .filter-chip.win { border-color: var(--success, #22c55e); color: var(--success, #22c55e); }
    .filter-chip.win.active { background: rgba(34, 197, 94, 0.15); }
    
    .filter-chip.loss { border-color: var(--danger, #ef4444); color: var(--danger, #ef4444); }
    .filter-chip.loss.active { background: rgba(239, 68, 68, 0.15); }
    
    .filter-chip.breakeven { border-color: var(--warning, #f59e0b); color: var(--warning, #f59e0b); }
    .filter-chip.breakeven.active { background: rgba(245, 158, 11, 0.15); }
    
    .filter-chip .chip-icon {
        width: 12px;
        height: 12px;
    }
    
    .filter-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 8px 5px;
        border-top: 1px solid var(--border, #334155);
        margin-top: 10px;
    }
    
    .filter-btn {
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }
    
    .filter-btn.clear {
        background: transparent;
        color: var(--text-muted, #94a3b8);
    }
    .filter-btn.clear:hover {
        color: var(--text-main, #e2e8f0);
        background: rgba(255,255,255,0.05);
    }
    
    .filter-btn.apply {
        background: var(--primary, #3b82f6);
        color: white;
    }
    .filter-btn.apply:hover {
        background: #2563eb;
    }
    
    .active-filters-badge {
        background: var(--primary, #3b82f6);
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 6px;
    }
`;

// --- Date Picker State ---
let pickerState = {
    currentDate: new Date(),
    startDate: null,
    endDate: null,
    initialized: false
};

// --- Filters State ---
let filtersState = {
    symbols: [],        // 交易品种
    direction: [],      // 交易方向
    result: [],         // 交易结果
    assetClass: [],     // 资产类别
    session: [],        // 交易时段
    setup: [],          // 交易策略/Setup
    emotion: []         // 情绪标签
};

// 筛选器配置
const filterConfig = {
    symbols: {
        title: 'Symbols',
        options: [
            { value: 'EURUSD', label: 'EUR/USD' },
            { value: 'GBPUSD', label: 'GBP/USD' },
            { value: 'USDJPY', label: 'USD/JPY' },
            { value: 'XAUUSD', label: 'XAU/USD' },
            { value: 'BTCUSD', label: 'BTC/USD' },
            { value: 'NAS100', label: 'NAS100' },
            { value: 'US30', label: 'US30' }
        ]
    },
    direction: {
        title: 'Direction',
        options: [
            { value: 'long', label: 'Long', icon: '↑' },
            { value: 'short', label: 'Short', icon: '↓' }
        ]
    },
    result: {
        title: 'Result',
        options: [
            { value: 'win', label: 'Win', class: 'win' },
            { value: 'loss', label: 'Loss', class: 'loss' },
            { value: 'breakeven', label: 'Breakeven', class: 'breakeven' }
        ]
    },
    assetClass: {
        title: 'Asset Class',
        options: [
            { value: 'forex', label: 'Forex' },
            { value: 'crypto', label: 'Crypto' },
            { value: 'indices', label: 'Indices' },
            { value: 'commodities', label: 'Commodities' },
            { value: 'stocks', label: 'Stocks' }
        ]
    },
    session: {
        title: 'Session',
        options: [
            { value: 'asian', label: 'Asian' },
            { value: 'london', label: 'London' },
            { value: 'newyork', label: 'New York' },
            { value: 'overlap', label: 'Overlap' }
        ]
    },
    setup: {
        title: 'Setup / Strategy',
        options: [
            { value: 'breakout', label: 'Breakout' },
            { value: 'pullback', label: 'Pullback' },
            { value: 'reversal', label: 'Reversal' },
            { value: 'trend', label: 'Trend Follow' },
            { value: 'range', label: 'Range' },
            { value: 'news', label: 'News Trade' }
        ]
    },
    emotion: {
        title: 'Emotion Tag',
        options: [
            { value: 'confident', label: '😊 Confident' },
            { value: 'fearful', label: '😰 Fearful' },
            { value: 'greedy', label: '🤑 Greedy' },
            { value: 'neutral', label: '😐 Neutral' },
            { value: 'revenge', label: '😤 Revenge' },
            { value: 'fomo', label: '😱 FOMO' }
        ]
    }
};

/**
 * 注入 Topbar CSS 样式
 */
function injectTopbarStyles() {
    if (document.getElementById('topbar-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'topbar-styles';
    styleElement.textContent = topbarStyles;
    document.head.appendChild(styleElement);
}

/**
 * 获取顶部栏状态 (持久化)
 */
function getTopbarState() {
    const stored = sessionStorage.getItem('toMoon_topbar_state');
    if (stored) {
        try {
            const state = JSON.parse(stored);
            // 恢复日期对象
            if (state.dateRange) {
                state.dateRange.start = new Date(state.dateRange.start);
                state.dateRange.end = new Date(state.dateRange.end);
            }
            return state;
        } catch (e) { console.error('Failed to parse topbar state', e); }
    }
    
    // 默认状态
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    
    return {
        accounts: ['Main Account', 'Trading Account A', 'Trading Account B'],
        isAllAccounts: true,
        dateRange: {
            start: start,
            end: end,
            label: 'Last 30 Days'
        }
    };
}

/**
 * 保存顶部栏状态
 */
function saveTopbarState(state) {
    sessionStorage.setItem('toMoon_topbar_state', JSON.stringify(state));
}

/**
 * 获取筛选器状态
 */
function getFiltersState() {
    const stored = sessionStorage.getItem('toMoon_filters_state');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) { console.error('Failed to parse filters state', e); }
    }
    return { ...filtersState };
}

/**
 * 保存筛选器状态
 */
function saveFiltersState(state) {
    sessionStorage.setItem('toMoon_filters_state', JSON.stringify(state));
    filtersState = state;
}

/**
 * 计算活跃筛选器数量
 */
function countActiveFilters() {
    const state = getFiltersState();
    let count = 0;
    Object.values(state).forEach(arr => {
        if (Array.isArray(arr)) count += arr.length;
    });
    return count;
}

/**
 * 生成筛选器下拉菜单HTML
 */
function generateFiltersHTML() {
    const state = getFiltersState();
    let html = '';
    
    Object.entries(filterConfig).forEach(([key, config]) => {
        html += `<div class="filter-section">
            <div class="filter-section-title">${config.title}</div>
            <div class="filter-chips">`;
        
        config.options.forEach(opt => {
            const isActive = state[key]?.includes(opt.value) ? 'active' : '';
            const extraClass = opt.class || '';
            const icon = opt.icon ? `<span class="chip-icon">${opt.icon}</span>` : '';
            html += `<div class="filter-chip ${extraClass} ${isActive}" data-category="${key}" data-value="${opt.value}" onclick="toggleFilterChip(this)">
                ${icon}${opt.label}
            </div>`;
        });
        
        html += `</div></div>`;
    });
    
    html += `<div class="filter-actions">
        <button class="filter-btn clear" onclick="clearAllFilters()">Clear All</button>
        <button class="filter-btn apply" onclick="applyFilters()">Apply Filters</button>
    </div>`;
    
    return html;
}

/**
 * 初始化/注入顶部筛选栏
 */
function initTopbar(options = {}) {
    if (document.getElementById('topbar')) return;
    
    // 注入样式
    injectTopbarStyles();

    const state = getTopbarState();
    
    // 初始化日期选择器状态
    pickerState.startDate = state.dateRange.start;
    pickerState.endDate = state.dateRange.end;
    pickerState.initialized = true;

    // 计算账户显示文本
    let accountText = 'All Accounts';
    if (!state.isAllAccounts) {
        if (state.accounts.length === 0) accountText = 'No Accounts';
        else if (state.accounts.length === 1) accountText = state.accounts[0];
        else accountText = `${state.accounts.length} Accounts`;
    }
    
    // 辅助函数：检查账户是否选中
    const isChecked = (val) => state.isAllAccounts || state.accounts.includes(val) ? 'checked' : '';
    const isAllChecked = state.isAllAccounts ? 'checked' : '';

    // Page Title Logic
    const pageTitle = options.title || '';

    const accountFilterHTML = `
            <div class="filter-group" id="account-filter" onclick="toggleDropdown('account-dropdown')">
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span id="selected-account">${accountText}</span>
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                <div class="dropdown-menu" id="account-dropdown" onclick="event.stopPropagation()">
                    <div class="dropdown-item" onclick="toggleAccount('all', this)">
                        <input type="checkbox" ${isAllChecked} id="acc-all">
                        <span>All Accounts</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" onclick="toggleAccount('Main Account', this)">
                        <input type="checkbox" ${isChecked('Main Account')} class="acc-checkbox" value="Main Account">
                        <span>Main Account</span>
                    </div>
                    <div class="dropdown-item" onclick="toggleAccount('Trading Account A', this)">
                        <input type="checkbox" ${isChecked('Trading Account A')} class="acc-checkbox" value="Trading Account A">
                        <span>Trading Account A</span>
                    </div>
                    <div class="dropdown-item" onclick="toggleAccount('Trading Account B', this)">
                        <input type="checkbox" ${isChecked('Trading Account B')} class="acc-checkbox" value="Trading Account B">
                        <span>Trading Account B</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item manage-accounts" href="../Settings/Settings_demo_v1.2.html?section=accounts">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        <span>Manage Accounts</span>
                    </a>
                </div>
            </div>`;

    const dateFilterHTML = `
            <div class="filter-group" id="date-filter" onclick="toggleDropdown('date-dropdown'); initDatePickerIfNeeded();">
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="selected-date">${state.dateRange.label || 'Custom Range'}</span>
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                <div class="dropdown-menu date-picker-dropdown" id="date-dropdown" onclick="event.stopPropagation()">
                    <div class="calendar-section">
                        <div class="calendar-header">
                            <button class="calendar-nav-btn" onclick="changeMonth(-1)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span id="calendar-month-year">December 2025</span>
                            <button class="calendar-nav-btn" onclick="changeMonth(1)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                        <div class="calendar-weekdays">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div class="calendar-grid" id="calendar-grid">
                            <!-- Days generated by JS -->
                        </div>
                    </div>
                    <div class="shortcuts-section">
                        <button class="shortcut-btn" onclick="selectShortcut('today')">Today</button>
                        <button class="shortcut-btn" onclick="selectShortcut('yesterday')">Yesterday</button>
                        <button class="shortcut-btn" onclick="selectShortcut('last7')">Last 7 Days</button>
                        <button class="shortcut-btn" onclick="selectShortcut('last30')">Last 30 Days</button>
                        <button class="shortcut-btn" onclick="selectShortcut('thisMonth')">This Month</button>
                        <button class="shortcut-btn" onclick="selectShortcut('lastMonth')">Last Month</button>
                        <button class="shortcut-btn" onclick="selectShortcut('thisYear')">This Year</button>
                    </div>
                </div>
            </div>`;

    const filtersTriggerHTML = `
            <div class="filter-group" id="filters-trigger" onclick="toggleDropdown('filters-dropdown'); initFiltersDropdown();">
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>Filters</span>
                <span class="active-filters-badge" id="filters-badge" style="display: none;">0</span>
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                <div class="dropdown-menu filters-dropdown" id="filters-dropdown" onclick="event.stopPropagation()">
                    <!-- Content generated by JS -->
                </div>
            </div>`;

    let topbarHTML = '';
    
    if (pageTitle) {
        // New Layout (Title Left, Filters Right)
        topbarHTML = `
            <div class="topbar-left">
                <h2 id="topbar-page-title" style="margin:0; font-size: 18px; font-weight: 600; color: var(--text-main);">${pageTitle}</h2>
            </div>
            <div class="topbar-right">
                ${accountFilterHTML}
                <div class="filter-divider"></div>
                ${dateFilterHTML}
                <div class="filter-divider"></div>
                ${filtersTriggerHTML}
            </div>
        `;
    } else {
        // Old Layout (Filters Left, Filters Right) - for Settings etc.
        topbarHTML = `
            <div class="topbar-left">
                ${accountFilterHTML}
                <div class="filter-divider"></div>
                ${dateFilterHTML}
            </div>
            <div class="topbar-right">
                ${filtersTriggerHTML}
            </div>
        `;
    }
    
    const topbar = document.createElement('div');
    topbar.id = 'topbar';
    topbar.className = 'topbar';
    topbar.innerHTML = topbarHTML;
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.insertAdjacentElement('afterend', topbar);
    } else {
        document.body.insertAdjacentElement('afterbegin', topbar);
    }
    
    // 初始化点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-group')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

/**
 * 切换下拉菜单显示
 * @param {string} id - 下拉菜单ID
 */
function toggleDropdown(id) {
    // 关闭其他所有下拉菜单
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== id) menu.classList.remove('show');
    });
    
    const dropdown = document.getElementById(id);
    if (dropdown) {
        setTimeout(() => {
            dropdown.classList.toggle('show');
        }, 0);
    }
}

/**
 * 切换账户选择 (多选逻辑)
 * @param {string} accountName - 账户名称或 'all'
 * @param {HTMLElement} element - 点击的元素
 */
function toggleAccount(accountName, element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }
    
    const isChecked = checkbox.checked;
    const allCheckbox = document.getElementById('acc-all');
    const accountCheckboxes = document.querySelectorAll('.acc-checkbox');
    
    if (accountName === 'all') {
        accountCheckboxes.forEach(cb => cb.checked = isChecked);
    } else {
        if (!isChecked) {
            allCheckbox.checked = false;
        } else {
            const allChecked = Array.from(accountCheckboxes).every(cb => cb.checked);
            allCheckbox.checked = allChecked;
        }
    }
    
    updateAccountDisplay();

    // 保存状态
    const checkedAccounts = Array.from(accountCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const currentState = getTopbarState();
    currentState.accounts = checkedAccounts;
    currentState.isAllAccounts = allCheckbox.checked;
    saveTopbarState(currentState);
}

/**
 * 更新账户显示文本
 */
function updateAccountDisplay() {
    const accountCheckboxes = document.querySelectorAll('.acc-checkbox');
    const checkedAccounts = Array.from(accountCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const display = document.getElementById('selected-account');
    
    if (checkedAccounts.length === accountCheckboxes.length) {
        display.textContent = 'All Accounts';
    } else if (checkedAccounts.length === 0) {
        display.textContent = 'No Accounts';
    } else if (checkedAccounts.length === 1) {
        display.textContent = checkedAccounts[0];
    } else {
        display.textContent = `${checkedAccounts.length} Accounts`;
    }
    
    // 触发自定义事件
    const event = new CustomEvent('accountChanged', { detail: { accounts: checkedAccounts } });
    document.dispatchEvent(event);
}

// --- Date Picker Logic ---

function initDatePickerIfNeeded() {
    if (!pickerState.initialized) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        
        pickerState.startDate = start;
        pickerState.endDate = end;
        pickerState.initialized = true;
    }
    
    if (pickerState.startDate) {
        pickerState.currentDate = new Date(pickerState.startDate);
    }
    
    renderCalendar();
}

function renderCalendar() {
    const year = pickerState.currentDate.getFullYear();
    const month = pickerState.currentDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day empty';
        grid.appendChild(cell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;
        cell.onclick = () => handleDateClick(date);
        
        if (pickerState.startDate && pickerState.endDate) {
            const dTime = date.setHours(0,0,0,0);
            const sTime = new Date(pickerState.startDate).setHours(0,0,0,0);
            const eTime = new Date(pickerState.endDate).setHours(0,0,0,0);
            
            if (dTime === sTime || dTime === eTime) {
                cell.classList.add('selected');
                if (dTime === sTime) cell.classList.add('range-start');
                if (dTime === eTime) cell.classList.add('range-end');
            } else if (dTime > sTime && dTime < eTime) {
                cell.classList.add('in-range');
            }
        } else if (pickerState.startDate) {
            const dTime = date.setHours(0,0,0,0);
            const sTime = new Date(pickerState.startDate).setHours(0,0,0,0);
            if (dTime === sTime) cell.classList.add('selected');
        }
        
        grid.appendChild(cell);
    }
}

function changeMonth(delta) {
    pickerState.currentDate.setMonth(pickerState.currentDate.getMonth() + delta);
    renderCalendar();
}

function handleDateClick(date) {
    date.setHours(0,0,0,0);
    
    if (!pickerState.startDate || (pickerState.startDate && pickerState.endDate)) {
        pickerState.startDate = date;
        pickerState.endDate = null;
    } else {
        if (date < pickerState.startDate) {
            pickerState.endDate = pickerState.startDate;
            pickerState.startDate = date;
        } else {
            pickerState.endDate = date;
        }
        
        updateDateDisplay();
        setTimeout(() => {
            document.getElementById('date-dropdown').classList.remove('show');
        }, 300);
    }
    
    renderCalendar();
}

function selectShortcut(type) {
    const end = new Date();
    const start = new Date();
    let label = '';
    
    end.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    
    switch(type) {
        case 'today':
            label = 'Today';
            break;
        case 'yesterday':
            start.setDate(end.getDate() - 1);
            end.setDate(end.getDate() - 1);
            label = 'Yesterday';
            break;
        case 'last7':
            start.setDate(end.getDate() - 6);
            label = 'Last 7 Days';
            break;
        case 'last30':
            start.setDate(end.getDate() - 29);
            label = 'Last 30 Days';
            break;
        case 'thisMonth':
            start.setDate(1);
            label = 'This Month';
            break;
        case 'lastMonth':
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            end.setDate(0);
            label = 'Last Month';
            break;
        case 'thisYear':
            start.setMonth(0, 1);
            label = 'This Year';
            break;
    }
    
    pickerState.startDate = start;
    pickerState.endDate = end;
    pickerState.currentDate = new Date(start);
    
    renderCalendar();
    updateDateDisplay(label);
    
    document.querySelectorAll('.shortcut-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.shortcut-btn[onclick*="'${type}'"]`);
    if (btn) btn.classList.add('active');
    
    setTimeout(() => {
        document.getElementById('date-dropdown').classList.remove('show');
    }, 200);
}

function updateDateDisplay(label = null) {
    const display = document.getElementById('selected-date');
    
    if (label) {
        display.textContent = label;
    } else {
        const options = { month: 'short', day: 'numeric' };
        const sStr = pickerState.startDate.toLocaleDateString('en-US', options);
        const eStr = pickerState.endDate.toLocaleDateString('en-US', options);
        display.textContent = `${sStr} - ${eStr}`;
        
        document.querySelectorAll('.shortcut-btn').forEach(btn => btn.classList.remove('active'));
    }
    
    // 触发事件
    const event = new CustomEvent('dateRangeChanged', { 
        detail: { 
            start: pickerState.startDate, 
            end: pickerState.endDate,
            label: label || 'Custom'
        } 
    });
    document.dispatchEvent(event);

    // 保存状态
    const currentState = getTopbarState();
    currentState.dateRange = {
        start: pickerState.startDate,
        end: pickerState.endDate,
        label: label || display.textContent
    };
    saveTopbarState(currentState);
}

// --- Advanced Filters Logic ---

/**
 * 初始化筛选器下拉菜单
 */
function initFiltersDropdown() {
    const dropdown = document.getElementById('filters-dropdown');
    if (dropdown) {
        dropdown.innerHTML = generateFiltersHTML();
    }
    updateFiltersBadge();
}

/**
 * 切换筛选器芯片选中状态
 */
function toggleFilterChip(element) {
    element.classList.toggle('active');
}

/**
 * 清除所有筛选器
 */
function clearAllFilters() {
    // 清除UI状态
    document.querySelectorAll('.filter-chip.active').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // 清除存储状态
    const emptyState = {
        symbols: [],
        direction: [],
        result: [],
        assetClass: [],
        session: [],
        setup: [],
        emotion: []
    };
    saveFiltersState(emptyState);
    updateFiltersBadge();
    
    // 触发事件
    const event = new CustomEvent('filtersChanged', { detail: emptyState });
    document.dispatchEvent(event);
}

/**
 * 应用筛选器
 */
function applyFilters() {
    const newState = {
        symbols: [],
        direction: [],
        result: [],
        assetClass: [],
        session: [],
        setup: [],
        emotion: []
    };
    
    document.querySelectorAll('.filter-chip.active').forEach(chip => {
        const category = chip.dataset.category;
        const value = chip.dataset.value;
        if (newState[category] && !newState[category].includes(value)) {
            newState[category].push(value);
        }
    });
    
    saveFiltersState(newState);
    updateFiltersBadge();
    
    // 触发事件
    const event = new CustomEvent('filtersChanged', { detail: newState });
    document.dispatchEvent(event);
    
    // 关闭下拉菜单
    document.getElementById('filters-dropdown').classList.remove('show');
    
    console.log('Filters applied:', newState);
}

/**
 * 更新筛选器角标
 */
function updateFiltersBadge() {
    const count = countActiveFilters();
    const badge = document.getElementById('filters-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * 获取当前筛选状态
 * @returns {object} 包含账户和日期范围
 */
function getFilterState() {
    return {
        ...getTopbarState(),
        filters: getFiltersState()
    };
}

// 导出函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initTopbar, 
        toggleDropdown, 
        toggleAccount, 
        initDatePickerIfNeeded, 
        changeMonth, 
        selectShortcut,
        getFilterState,
        getTopbarState,
        saveTopbarState,
        // Filters exports
        initFiltersDropdown,
        toggleFilterChip,
        clearAllFilters,
        applyFilters,
        getFiltersState,
        saveFiltersState
    };
} else {
    // 浏览器环境全局暴露
    window.initTopbar = initTopbar;
    window.toggleDropdown = toggleDropdown;
    window.toggleAccount = toggleAccount;
    window.initDatePickerIfNeeded = initDatePickerIfNeeded;
    window.changeMonth = changeMonth;
    window.selectShortcut = selectShortcut;
    window.getFilterState = getFilterState;
    // Filters exports
    window.initFiltersDropdown = initFiltersDropdown;
    window.toggleFilterChip = toggleFilterChip;
    window.clearAllFilters = clearAllFilters;
    window.applyFilters = applyFilters;
    window.getFiltersState = getFiltersState;
}
