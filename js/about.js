// about.js - 一键展开/折叠全部
(function() {
    const toggleBtn = document.getElementById('toggleAllBtn');
    if (!toggleBtn) return; // 安全保护

    // 获取所有 details 元素
    const detailsList = document.querySelectorAll('.panel details');

    // 更新按钮文字
    function updateButtonText() {
        const anyOpen = Array.from(detailsList).some(d => d.open === true);
        toggleBtn.textContent = anyOpen ? '📂 折叠全部' : '📂 展开全部';
    }

    // 切换全部展开/折叠
    function toggleAll() {
        const anyOpen = Array.from(detailsList).some(d => d.open === true);
        detailsList.forEach(d => {
            d.open = !anyOpen;
        });
        updateButtonText();
    }

    // 监听按钮点击
    toggleBtn.addEventListener('click', toggleAll);

    // 监听每个 details 的 toggle 事件，保持按钮文字同步
    detailsList.forEach(d => {
        d.addEventListener('toggle', updateButtonText);
    });

    // 初始化按钮文字
    updateButtonText();
})();