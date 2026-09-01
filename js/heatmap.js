// js/heatmap.js - 手记热力图模块
(function() {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        // 数据文件名（存放在 Gitee 仓库根目录）
        DATA_FILE: 'heatmap-data.json',
        // 数据存储的 Key（localStorage）
        STORAGE_KEY: 'heatmap_data_cache',
        // 缓存过期时间（毫秒），5分钟
        CACHE_EXPIRE: 5 * 60 * 1000,
        // 颜色等级（从浅到深）
        COLORS: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
        // 展示天数（最近 365 天）
        DAYS: 365
    };

    // ==================== 工具函数 ====================

    /** 获取今天的日期字符串 YYYY-MM-DD */
    function getTodayStr() {
        const d = new Date();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    /** 日期字符串转 Date 对象 */
    function parseDate(str) {
        const parts = str.split('-').map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    /** 格式化日期：MM月DD日 */
    function formatDateDisplay(str) {
        const parts = str.split('-');
        return parts[1] + '月' + parts[2] + '日';
    }

    /** 获取某天是星期几（0=周日） */
    function getDayOfWeek(date) {
        return date.getDay();
    }

    /** 计算两个日期之间的天数差 */
    function daysBetween(d1, d2) {
        const ms = d2.getTime() - d1.getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    }

    /** 获取最近 N 天的日期列表（从今天往前推） */
    function getRecentDays(n) {
        const result = [];
        const today = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
            result.push(key);
        }
        return result;
    }

    /** 获取某天所在周的第一天（周日） */
    function getWeekStart(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    // ==================== 数据管理 ====================

    /** 从 localStorage 读取缓存 */
    function getCache() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            // 检查是否过期
            if (Date.now() - data.timestamp > CONFIG.CACHE_EXPIRE) {
                return null;
            }
            return data.payload;
        } catch (_) {
            return null;
        }
    }

    /** 写入 localStorage 缓存 */
    function setCache(payload) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
                timestamp: Date.now(),
                payload: payload
            }));
        } catch (_) { /* ignore */ }
    }

    /** 从 Gitee 读取热力图数据 */
    async function fetchFromGitee() {
        const config = window.getToolConfig ? window.getToolConfig('about') : null;
        if (!config || !window.isConfigValid ? !window.isConfigValid(config) : !config.token) {
            console.warn('[heatmap] 未配置 Gitee，无法读取数据');
            return null;
        }

        try {
            const content = await window.getGiteeFile({
                token: config.token,
                owner: config.owner,
                repo: config.repo,
                path: CONFIG.DATA_FILE,
                branch: config.branch || 'main'
            });
            if (content === null) return {};
            return JSON.parse(content);
        } catch (e) {
            console.warn('[heatmap] 从 Gitee 读取失败:', e.message);
            return null;
        }
    }

    /** 更新热力图数据（上传手记后调用） */
    async function updateHeatmapData() {
        const config = window.getToolConfig ? window.getToolConfig('about') : null;
        if (!config || !config.token) {
            console.warn('[heatmap] 未配置 Gitee，无法更新数据');
            return;
        }

        const today = getTodayStr();

        try {
            // 读取现有数据
            let data = {};
            const existing = await fetchFromGitee();
            if (existing && typeof existing === 'object') {
                data = existing;
            }

            // 今天计数 +1
            data[today] = (data[today] || 0) + 1;

            // 上传到 Gitee
            await window.uploadFileToGitee({
                token: config.token,
                owner: config.owner,
                repo: config.repo,
                path: CONFIG.DATA_FILE,
                content: JSON.stringify(data, null, 2),
                message: '更新热力图数据',
                branch: config.branch || 'main'
            });

            // 更新缓存
            setCache(data);
            console.log('[heatmap] 数据已更新:', today, data[today]);
        } catch (e) {
            console.error('[heatmap] 更新失败:', e.message);
        }
    }

    /** 获取热力图数据（优先缓存，若无则从 Gitee 读取） */
    async function getHeatmapData() {
        // 1. 先读缓存
        const cached = getCache();
        if (cached) {
            return cached;
        }

        // 2. 从 Gitee 读取
        const remote = await fetchFromGitee();
        if (remote !== null) {
            setCache(remote);
            return remote;
        }

        // 3. 都没有则返回空对象
        return {};
    }

    // ==================== 渲染引擎 ====================

    /** 渲染热力图 */
    function renderHeatmap(container, data) {
        if (!container) return;

        const days = getRecentDays(CONFIG.DAYS);
        const today = new Date();

        // 计算统计数据
        let total = 0;
        let maxCount = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let streakTemp = 0;

        // 从今天往前遍历
        for (let i = 0; i < days.length; i++) {
            const key = days[i];
            const count = data[key] || 0;
            total += count;
            if (count > maxCount) maxCount = count;

            // 计算连续天数（从今天往前推，遇到 count === 0 则中断）
            if (i === 0) {
                // 从今天开始算
                if (count > 0) {
                    streakTemp = 1;
                } else {
                    streakTemp = 0;
                }
            } else if (count > 0 && streakTemp > 0) {
                streakTemp++;
            } else if (count === 0) {
                streakTemp = 0;
            }
        }
        // 当前连续天数
        currentStreak = streakTemp;

        // 计算最长连续天数（重新遍历，与当前连续独立）
        let maxStreak = 0;
        let tempStreak = 0;
        for (const key of days) {
            if ((data[key] || 0) > 0) {
                tempStreak++;
                if (tempStreak > maxStreak) maxStreak = tempStreak;
            } else {
                tempStreak = 0;
            }
        }
        longestStreak = maxStreak;

        // 构建 HTML
        let html = '';

        // --- 统计信息 ---
        html += `<div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:1rem; font-size:0.9rem; color:#374151;">`;
        html += `<span>📊 本年累计：<strong style="color:#1f2937;">${total}</strong> 篇</span>`;
        html += `<span>🔥 最长连续：<strong style="color:#1f2937;">${longestStreak}</strong> 天</span>`;
        html += `<span>⚡ 当前连续：<strong style="color:#1f2937;">${currentStreak}</strong> 天</span>`;
        html += `</div>`;

        // --- 图例 ---
        html += `<div style="display:flex; align-items:center; gap:0.3rem; margin-bottom:0.6rem; font-size:0.75rem; color:#9ca3af;">`;
        html += `<span>少</span>`;
        for (let i = 0; i < CONFIG.COLORS.length; i++) {
            const label = i === 0 ? '0' : (i === 1 ? '1-2' : (i === 2 ? '3-5' : (i === 3 ? '6-9' : '10+')));
            html += `<span style="display:inline-block; width:14px; height:14px; background:${CONFIG.COLORS[i]}; border-radius:3px; border:1px solid #e5e7eb;"></span>`;
            html += `<span style="margin-right:0.3rem;">${label}</span>`;
        }
        html += `<span>多</span>`;
        html += `</div>`;

        // --- 网格 ---
        // 获取第一个日期所在的周起始日（周日）
        const firstDate = parseDate(days[0]);
        const weekStart = getWeekStart(firstDate);

        // 构建 7行 x 53列 的网格
        const grid = [];
        for (let row = 0; row < 7; row++) {
            grid[row] = [];
            for (let col = 0; col < 53; col++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + col * 7 + row);
                const key = d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
                const count = data[key] || 0;
                let colorIndex = 0;
                if (count > 0) {
                    if (count <= 2) colorIndex = 1;
                    else if (count <= 5) colorIndex = 2;
                    else if (count <= 9) colorIndex = 3;
                    else colorIndex = 4;
                }
                grid[row][col] = { key, count, colorIndex };
            }
        }

        // 月份标签（显示在顶部的月份缩写）
        const monthLabels = [];
        let currentMonth = -1;
        for (let col = 0; col < 53; col++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + col * 7);
            const month = d.getMonth();
            if (month !== currentMonth) {
                currentMonth = month;
                monthLabels.push({ col, label: (month + 1) + '月' });
            }
        }

        // 绘制网格
        html += `<div style="overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:4px;">`;
        html += `<div style="display:grid; grid-template-columns:30px repeat(53, minmax(14px, 1fr)); gap:2px; min-width:700px;">`;

        // 月份标签行
        html += `<div style="grid-column:1; grid-row:1; font-size:0.6rem; color:#9ca3af; text-align:right; padding-right:4px;"></div>`;
        let labelIdx = 0;
        for (let col = 0; col < 53; col++) {
            let label = '';
            if (labelIdx < monthLabels.length && monthLabels[labelIdx].col === col) {
                label = monthLabels[labelIdx].label;
                labelIdx++;
            }
            html += `<div style="grid-column:${col+2}; grid-row:1; font-size:0.55rem; color:#9ca3af; text-align:center;">${label}</div>`;
        }

        // 星期行（左侧）
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        for (let row = 0; row < 7; row++) {
            html += `<div style="grid-column:1; grid-row:${row+2}; font-size:0.6rem; color:#9ca3af; text-align:right; padding-right:4px; display:flex; align-items:center; justify-content:flex-end;">${weekDays[row]}</div>`;
            for (let col = 0; col < 53; col++) {
                const cell = grid[row][col];
                const isToday = cell.key === getTodayStr();
                const color = CONFIG.COLORS[cell.colorIndex];
                const border = isToday ? '2px solid #3b82f6' : '1px solid #e5e7eb';
                const countText = cell.count > 0 ? cell.count + '篇' : '无手记';
                html += `<div style="grid-column:${col+2}; grid-row:${row+2}; background:${color}; border-radius:3px; border:${border}; aspect-ratio:1/1; min-width:12px; min-height:12px; cursor:pointer; position:relative;" title="${cell.key} · ${countText}"></div>`;
            }
        }

        html += `</div></div>`;

        // --- 说明 ---
        const startDate = days[0];
        const endDate = days[days.length - 1];
        html += `<div style="margin-top:0.5rem; font-size:0.75rem; color:#9ca3af; text-align:right;">`;
        html += `📅 ${startDate} ～ ${endDate}`;
        html += `</div>`;

        container.innerHTML = html;
    }

    // ==================== 对外接口 ====================

    // 挂载到 window
    window.Heatmap = {
        /** 渲染热力图到指定容器 */
        render: async function(containerSelector) {
            const container = typeof containerSelector === 'string' ?
                document.querySelector(containerSelector) :
                containerSelector;
            if (!container) {
                console.warn('[heatmap] 容器不存在');
                return;
            }

            const data = await getHeatmapData();
            renderHeatmap(container, data || {});
        },

        /** 更新数据（手记上传后调用） */
        update: updateHeatmapData,

        /** 强制刷新（从 Gitee 重新读取） */
        refresh: async function(containerSelector) {
            // 清除缓存
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            const container = typeof containerSelector === 'string' ?
                document.querySelector(containerSelector) :
                containerSelector;
            if (container) {
                await this.render(container);
            }
        }
    };

    console.log('[heatmap] 模块已加载');
})();