document.addEventListener('DOMContentLoaded', () => {

    // ================= 1. ЧАСТИЦЫ НА ФОНЕ =================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 60; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = `${Math.random() * 100}%`;
            const size = Math.random() * 3 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.animationDuration = `${15 + Math.random() * 20}s`;
            p.style.animationDelay = `-${Math.random() * 10}s`;
            p.style.opacity = Math.random() * 0.5 + 0.2;
            p.style.position = 'absolute';
            p.style.background = 'var(--bio)';
            p.style.borderRadius = '50%';
            p.style.boxShadow = '0 0 10px var(--bio)';
            p.style.animationName = 'floatUp';
            p.style.animationTimingFunction = 'linear';
            p.style.animationIterationCount = 'infinite';
            particlesContainer.appendChild(p);
        }
    }

    if (!document.getElementById('particleKeyframes')) {
        const style = document.createElement('style');
        style.id = 'particleKeyframes';
        style.innerHTML = `@keyframes floatUp { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 20% { opacity: 0.6; } 80% { opacity: 0.3; } 100% { transform: translateY(-10vh) scale(1.5); opacity: 0; } }`;
        document.head.appendChild(style);
    }

    // ================= 2. СЖАТИЕ НАВИГАЦИИ =================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ================= 3. РАСПИСАНИЕ =================
    const tabs = document.querySelectorAll('.schedule-tab');
    const panels = document.querySelectorAll('.schedule-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.getAttribute('data-time'));
            if (target) target.classList.add('active');
        });
    });

    // ================= 4. АВТОРИЗАЦИЯ =================
    const authModal = document.getElementById('authModal');
    const loginTrigger = document.getElementById('loginTrigger');
    const adminTriggerFooter = document.getElementById('adminTriggerFooter');
    const authClose = document.getElementById('authClose');
    const loginForm = document.getElementById('loginForm');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const authError = document.getElementById('authError');

    const VALID_USER = 'demo';
    const VALID_PASS = 'demo';

    function openAuth(e) {
        if (e) e.preventDefault();
        authModal.classList.add('active');
        authError.classList.remove('show');
        loginForm.reset();
        setTimeout(() => loginUsername.focus(), 300);
    }
    function closeAuth() {
        authModal.classList.remove('active');
        authError.classList.remove('show');
    }

    if (loginTrigger) loginTrigger.addEventListener('click', openAuth);
    if (adminTriggerFooter) adminTriggerFooter.addEventListener('click', openAuth);
    if (authClose) authClose.addEventListener('click', closeAuth);
    if (authModal) {
        authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = loginUsername.value.trim().toLowerCase();
            const pass = loginPassword.value;
            if (user === VALID_USER && pass === VALID_PASS) {
                closeAuth();
                openDashboard();
            } else {
                authError.textContent = 'Неверный логин или пароль. Попробуйте demo / demo';
                authError.classList.add('show');
                loginPassword.value = '';
                loginPassword.focus();
            }
        });
    }

    // ================= 5. ДАШБОРД =================
    const dashboardPanel = document.getElementById('dashboardPanel');
    const dashboardClose = document.getElementById('dashboardClose');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashNavItems = document.querySelectorAll('.dash-nav-item');
    
    // Находим контейнер, куда рендерить контент (это main внутри dashboard)
    const dashMain = document.querySelector('.dash-main');
    
    // Сохраняем исходный HTML вкладки "Обзор"
    const originalOverviewHTML = dashMain.innerHTML;

    let currentTab = 'overview';

    function openDashboard() {
        dashboardPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // При открытии всегда показываем "Обзор"
        currentTab = 'overview';
        dashMain.innerHTML = originalOverviewHTML;
        attachOverviewEvents();
        
        // Подсвечиваем первую вкладку
        dashNavItems.forEach(item => item.classList.remove('active'));
        if(dashNavItems[0]) dashNavItems[0].classList.add('active');
        
        startLiveFeed();
    }

    function closeDashboard() {
        dashboardPanel.classList.remove('active');
        document.body.style.overflow = '';
        stopLiveFeed();
    }

    if (dashboardClose) dashboardClose.addEventListener('click', closeDashboard);
    if (logoutBtn) logoutBtn.addEventListener('click', closeDashboard);

    // Обработчик кликов по вкладкам
    dashNavItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const tabText = item.textContent.trim();
            
            // Подсветка
            dashNavItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Остановка ленты, чтобы не сбивала график
            stopLiveFeed();

            // Переключение контента
            if (tabText.includes('Обзор')) {
                dashMain.innerHTML = originalOverviewHTML;
                attachOverviewEvents();
                startLiveFeed();
            } 
            else if (tabText.includes('Зоны')) {
                renderZones();
            } 
            else if (tabText.includes('События')) {
                renderEvents();
            } 
            else if (tabText.includes('Финансы')) {
                renderFinance();
            } 
            else if (tabText.includes('Настройки')) {
                renderSettings();
            }
        });
    });

    // ================= 6. КОНТЕНТ ВКЛАДОК =================

    function attachOverviewEvents() {
        const newClose = document.getElementById('dashboardClose');
        if (newClose) newClose.onclick = closeDashboard;
        
        const newFeed = document.getElementById('activityFeed');
        if (newFeed) startLiveFeed(newFeed);
    }

    function renderZones() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div><h1 class="dash-title">Управление зонами</h1><p class="dash-subtitle">Статус и загрузка пространств</p></div>
                <div class="dash-header-actions"><button class="dash-close-btn" id="btnClose">Закрыть панель</button></div>
            </header>
            <div class="dash-panel">
                <div class="panel-header"><h3 class="panel-title">Зоны пространства</h3><span class="panel-tag">Live Data</span></div>
                <table class="dash-table">
                    <thead><tr><th>ID</th><th>Зона</th><th>Статус</th><th>Загрузка</th><th>Ответственный</th></tr></thead>
                    <tbody>
                        <tr><td>01</td><td>Погружение</td><td><span class="badge-success">Active</span></td><td>45%</td><td>Анна К.</td></tr>
                        <tr><td>02</td><td>Дельфины</td><td><span class="badge-success">Active</span></td><td>88%</td><td>Иван С.</td></tr>
                        <tr><td>03</td><td>Живые истории</td><td><span class="badge-warn">Maintenance</span></td><td>0%</td><td>—</td></tr>
                        <tr><td>04</td><td>Лаборатория</td><td><span class="badge-success">Active</span></td><td>92%</td><td>Дмитрий Р.</td></tr>
                        <tr><td>05</td><td>Сцена</td><td><span class="badge-success">Active</span></td><td>60%</td><td>Ольга В.</td></tr>
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 24px; display: flex; gap: 16px;">
                <button class="btn-primary" style="padding: 12px 24px; font-size: 12px;">+ Добавить зону</button>
                <button class="btn-secondary" style="padding: 12px 24px; font-size: 12px;">Экспорт CSV</button>
            </div>
        `;
        document.getElementById('btnClose').onclick = closeDashboard;
    }

    function renderEvents() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div><h1 class="dash-title">Менеджер событий</h1><p class="dash-subtitle">Таймлайн на сегодня</p></div>
                <div class="dash-header-actions"><button class="dash-close-btn" id="btnClose">Закрыть панель</button></div>
            </header>
            <div class="dash-grid">
                <div class="dash-panel">
                    <div class="panel-header"><h3 class="panel-title">Активности</h3></div>
                    <ul class="activity-feed" style="gap: 20px;">
                        <li style="border-left: 2px solid var(--gold); padding-left: 16px; border-bottom: none;">
                            <span style="font-size: 16px; color: var(--gold);">14:00</span><br> 
                            <strong>Йога у воды</strong> <br><span style="font-size: 12px; color: var(--muted);">Группа: 12 человек / Зона: Тишина</span>
                        </li>
                        <li style="border-left: 2px solid var(--bio); padding-left: 16px; border-bottom: none;">
                            <span style="font-size: 16px; color: var(--bio);">16:30</span><br> 
                            <strong>VR-квест "Дельфины"</strong> <br><span style="font-size: 12px; color: var(--muted);">Группа: 8 детей / Зона: Лаборатория</span>
                        </li>
                        <li style="border-left: 2px solid #ffc857; padding-left: 16px; border-bottom: none;">
                            <span style="font-size: 16px; color: #ffc857;">19:00</span><br> 
                            <strong>Кинопоказ "Зов моря"</strong> <br><span style="font-size: 12px; color: var(--muted);">Свободный вход / Сцена-трансформер</span>
                        </li>
                    </ul>
                </div>
                <div class="dash-panel">
                    <div class="panel-header"><h3 class="panel-title">Заявки на аренду</h3></div>
                    <ul class="activity-feed">
                        <li><span>New</span> Свадьба (семья Ивановых) <br>15 июня</li>
                        <li><span>New</span> Конференция TechCorp <br>22 июня</li>
                        <li><span>OK</span> Фотосессия для журнала <br>25 июня</li>
                    </ul>
                </div>
            </div>
        `;
        document.getElementById('btnClose').onclick = closeDashboard;
    }

    function renderFinance() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div><h1 class="dash-title">Финансы</h1><p class="dash-subtitle">Отчет за текущий месяц</p></div>
                <div class="dash-header-actions"><button class="dash-close-btn" id="btnClose">Закрыть панель</button></div>
            </header>
            <div class="dash-metrics">
                <div class="metric-card">
                    <div class="metric-label">Выручка (Ивенты)</div>
                    <div class="metric-value">₽ 840k</div>
                    <div class="metric-trend up">↑ 15% к плану</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Продажи мерча</div>
                    <div class="metric-value">₽ 120k</div>
                    <div class="metric-trend up">↑ 8% к плану</div>
                </div>
            </div>
            <div class="dash-panel">
                <div class="panel-header"><h3 class="panel-title">Структура дохода</h3></div>
                <div class="h-bar-chart">
                    <div class="h-bar-row"><div class="h-bar-label">Аренда сцены</div><div class="h-bar-track"><div class="h-bar-fill" style="width: 60%"><span>60%</span></div></div></div>
                    <div class="h-bar-row"><div class="h-bar-label">Кейтеринг</div><div class="h-bar-track"><div class="h-bar-fill" style="width: 25%"><span>25%</span></div></div></div>
                    <div class="h-bar-row"><div class="h-bar-label">Мерч</div><div class="h-bar-track"><div class="h-bar-fill" style="width: 15%"><span>15%</span></div></div></div>
                </div>
            </div>
        `;
        document.getElementById('btnClose').onclick = closeDashboard;
    }

    function renderSettings() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div><h1 class="dash-title">Настройки</h1><p class="dash-subtitle">Глобальные параметры</p></div>
                <div class="dash-header-actions"><button class="dash-close-btn" id="btnClose">Закрыть панель</button></div>
            </header>
            <div class="dash-panel">
                <div class="panel-header"><h3 class="panel-title">Режим работы</h3></div>
                <ul class="activity-feed" style="font-size: 15px;">
                    <li style="justify-content: space-between; align-items: center;"><span>Утренняя йога (07:00)</span><input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--gold);"></li>
                    <li style="justify-content: space-between; align-items: center;"><span>Детские квесты (12:00)</span><input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--gold);"></li>
                    <li style="justify-content: space-between; align-items: center;"><span>Ночные мероприятия (23:00)</span><input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--gold);"></li>
                </ul>
                <div style="margin-top: 30px;">
                    <button class="btn-primary" style="padding: 12px 24px; font-size: 12px;">Сохранить изменения</button>
                </div>
            </div>
        `;
        document.getElementById('btnClose').onclick = closeDashboard;
    }

    // ================= 7. GM ACCESS (СЕКРЕТНАЯ ПАНЕЛЬ) =================
    // Добавляем кнопку GM Access в сайдбар
    const dashSidebarFooter = document.querySelector('.dash-sidebar-footer');
    if (dashSidebarFooter) {
        const gmBtn = document.createElement('button');
        gmBtn.innerHTML = '👑 GM Access';
        gmBtn.style.cssText = 'margin-top: 12px; width: 100%; padding: 12px; background: rgba(201,169,110,0.1); border: 1px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 600; letter-spacing: 1px; transition: 0.3s;';
        gmBtn.onmouseover = () => gmBtn.style.background = 'rgba(201,169,110,0.2)';
        gmBtn.onmouseout = () => gmBtn.style.background = 'rgba(201,169,110,0.1)';
        dashSidebarFooter.insertBefore(gmBtn, dashSidebarFooter.lastElementChild);

        gmBtn.addEventListener('click', () => {
            const pass = prompt('🔒 Секретный доступ (General Manager):\nВведите код:');
            if (pass === 'admin2027') {
                renderGM_Panel();
            } else if (pass !== null) {
                alert('❌ ACCESS DENIED. Неверный код.');
            }
        });
    }

    function renderGM_Panel() {
        // Убираем подсветку со всех вкладок, так как это не вкладка
        dashNavItems.forEach(nav => nav.classList.remove('active'));
        stopLiveFeed();
        
        dashMain.innerHTML = `
            <header class="dash-header">
                <div>
                    <h1 class="dash-title" style="color: #ff6b6b; text-shadow: 0 0 10px rgba(255,107,107,0.5);">GOD MODE</h1>
                    <p class="dash-subtitle">Уровень доступа: General Manager</p>
                </div>
                <div class="dash-header-actions">
                    <div class="dash-status" style="color: #ff6b6b; border-color: #ff6b6b; background: rgba(255,107,107,0.1);">
                        <span class="dot-pulse" style="background: #ff6b6b; box-shadow: 0 0 10px #ff6b6b;"></span> Root Access
                    </div>
                    <button class="dash-close-btn" id="btnClose">Закрыть панель</button>
                </div>
            </header>
            
            <div class="dash-grid">
                <div class="dash-panel" style="border-color: rgba(255,107,107,0.3);">
                    <div class="panel-header"><h3 class="panel-title">Системные команды</h3></div>
                    <p style="color: var(--muted); font-size: 13px; margin-bottom: 20px;">Внимание: данные действия необратимы.</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="dash-logout" style="width: 100%; text-align: left; padding: 16px;" onclick="alert('💥 База данных сброшена. (Шутка. Это тестовая версия)')">💥 Сбросить базу данных</button>
                        <button class="dash-logout" style="width: 100%; text-align: left; padding: 16px;" onclick="alert('📉 Акции упали на 99%. (Шутка)')">📉 Обнулить бюджет проекта</button>
                        <button class="dash-logout" style="width: 100%; text-align: left; padding: 16px;" onclick="alert('🚀 Ракета запущена в сторону Анапы. (Шутка)')">🚀 Запустить протокол «Оливия»</button>
                    </div>
                </div>

                <div class="dash-panel" style="border-color: rgba(255,107,107,0.3);">
                    <div class="panel-header"><h3 class="panel-title">Логи ядра</h3></div>
                    <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #ff6b6b; line-height: 1.8; opacity: 0.8;">
                        <div>[SUCCESS] GM authenticated</div>
                        <div>[WARN] Unauthorized attempt blocked (IP: 192.168.1.5)</div>
                        <div>[INFO] Overriding safety protocols...</div>
                        <div>[INFO] Connecting to mainframe...</div>
                        <div>[OK] Ready for commands.</div>
                    </div>
                </div>
            </div>
        `;
        
        // Возврат назад
        document.getElementById('btnClose').onclick = closeDashboard;
    }

    // ================= 8. ЖИВАЯ ЛЕНТА =================
    let feedInterval = null;
    const fakeActions = [
        "User from St. Petersburg opened 3D Tour",
        "New review received: 5 stars ⭐",
        "VR Module #4 rebooted",
        "User from Kazan requested callback",
        "Booking API: 200 OK",
        "Cache cleared successfully",
        "New partner inquiry from Sochi"
    ];

    function startLiveFeed(container = document.getElementById('activityFeed')) {
        if (feedInterval) clearInterval(feedInterval);
        if (!container) return;

        feedInterval = setInterval(() => {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const action = fakeActions[Math.floor(Math.random() * fakeActions.length)];

            const li = document.createElement('li');
            li.innerHTML = `<span>${time}</span> ${action}`;
            li.style.opacity = '0';
            li.style.transform = 'translateX(-10px)';
            li.style.transition = 'all 0.4s ease';
            container.prepend(li);

            setTimeout(() => { li.style.opacity = '1'; li.style.transform = 'translateX(0)'; }, 50);
            if (container.children.length > 6) container.lastElementChild.remove();
        }, 3500);
    }

    function stopLiveFeed() {
        clearInterval(feedInterval);
        feedInterval = null;
    }

    // ================= 9. ESC =================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (authModal && authModal.classList.contains('active')) closeAuth();
            if (dashboardPanel && dashboardPanel.classList.contains('active')) closeDashboard();
        }
    });

    // ================= 10. REVEAL =================
    const revealEls = document.querySelectorAll('.section-title, .section-desc, .feature-card, .zone-card, .econ-table-wrapper, .econ-quote');
    revealEls.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
});
