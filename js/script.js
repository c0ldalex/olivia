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
            // ВАЖНО: Добавляем стили для анимации частиц, так как в CSS их не было прописано для класса .particle (только для контейнера)
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

    // Добавляем keyframes для частиц динамически, если их нет в CSS
    if (!document.getElementById('particleKeyframes')) {
        const style = document.createElement('style');
        style.id = 'particleKeyframes';
        style.innerHTML = `
            @keyframes floatUp {
                0% { transform: translateY(100vh) scale(0); opacity: 0; }
                20% { opacity: 0.6; }
                80% { opacity: 0.3; }
                100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ================= 2. СЖАТИЕ НАВИГАЦИИ =================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ================= 3. РАСПИСАНИЕ (ВКЛАДКИ) =================
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

    // Тестовые данные для входа
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
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuth();
        });
    }

    // Обработка логина
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

    // ================= 5. ДАШБОРД И ВКЛАДКИ =================
    const dashboardPanel = document.getElementById('dashboardPanel');
    const dashboardClose = document.getElementById('dashboardClose');
    const logoutBtn = document.getElementById('logoutBtn');
    const activityFeed = document.getElementById('activityFeed');
    const dashNavItems = document.querySelectorAll('.dash-nav-item');
    
    // Контейнер, в который мы будем вставлять контент разных вкладок
    const dashMain = document.querySelector('.dash-main');
    
    // Сохраняем оригинальный HTML вкладки "Обзор", чтобы возвращать его
    let originalOverviewHTML = '';

    let feedInterval = null;

    // Функция открытия дашборда
    function openDashboard() {
        dashboardPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Если мы еще не сохранили оригинальный HTML, сохраняем его
        if (!originalOverviewHTML) {
            originalOverviewHTML = dashMain.innerHTML;
        } else {
            // Восстанавливаем обзор по умолчанию при каждом входе
            dashMain.innerHTML = originalOverviewHTML;
            rebindOverviewEvents(); // Перепривязываем события для элементов обзора
        }

        // Сбрасываем активную вкладку на "Обзор"
        dashNavItems.forEach(item => item.classList.remove('active'));
        dashNavItems[0].classList.add('active');
        
        startLiveFeed();
    }

    // Функция закрытия дашборда
    function closeDashboard() {
        dashboardPanel.classList.remove('active');
        document.body.style.overflow = '';
        stopLiveFeed();
    }

    if (dashboardClose) dashboardClose.addEventListener('click', closeDashboard);
    if (logoutBtn) logoutBtn.addEventListener('click', closeDashboard);

    // Логика переключения вкладок в сайдбаре
    dashNavItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // 1. Меняем активный класс
            dashNavItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 2. Определяем, куда кликнули
            const tabName = item.textContent.trim();

            // 3. Рендерим контент в зависимости от вкладки
            if (tabName.includes('Обзор')) {
                dashMain.innerHTML = originalOverviewHTML;
                rebindOverviewEvents();
            } else if (tabName.includes('Зоны')) {
                renderZonesTab();
            } else if (tabName.includes('События')) {
                renderEventsTab();
            } else if (tabName.includes('Финансы')) {
                renderFinanceTab();
            } else if (tabName.includes('Настройки')) {
                renderSettingsTab();
            }
        });
    });

    // --- ДИНАМИЧЕСКИЙ РЕНДЕР ВКЛАДОК ---

    // Вкладка: Зоны
    function renderZonesTab() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div>
                    <h1 class="dash-title">Управление зонами</h1>
                    <p class="dash-subtitle">Статус и загрузка пространств</p>
                </div>
                <div class="dash-header-actions">
                    <button class="dash-close-btn" onclick="document.getElementById('dashboardClose').click()">Закрыть панель</button>
                </div>
            </header>
            <div class="dash-panel">
                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название зоны</th>
                            <th>Статус</th>
                            <th>Загрузка</th>
                            <th>Сотрудник</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>01</td><td>Погружение</td><td><span class="badge-success">Active</span></td><td>45%</td><td>Анна К.</td></tr>
                        <tr><td>02</td><td>Дельфины</td><td><span class="badge-success">Active</span></td><td>88%</td><td>Иван С.</td></tr>
                        <tr><td>03</td><td>Живые истории</td><td><span class="badge-success">Active</span></td><td>30%</td><td>Мария П.</td></tr>
                        <tr><td>04</td><td>Лаборатория</td><td><span class="badge-success">Active</span></td><td>95%</td><td>Дмитрий Р.</td></tr>
                        <tr><td>05</td><td>Скамейки у воды</td><td><span class="badge-warn">Maintenance</span></td><td>0%</td><td>—</td></tr>
                        <tr><td>06</td><td>Сцена-трансформер</td><td><span class="badge-success">Active</span></td><td>60%</td><td>Ольга В.</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Вкладка: События
    function renderEventsTab() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div>
                    <h1 class="dash-title">Менеджер событий</h1>
                    <p class="dash-subtitle">Ближайшие мероприятия и аренды</p>
                </div>
                <div class="dash-header-actions">
                    <button class="dash-close-btn" onclick="document.getElementById('dashboardClose').click()">Закрыть панель</button>
                </div>
            </header>
            <div class="dash-grid">
                <div class="dash-panel">
                    <div class="panel-header"><h3 class="panel-title">На сегодня</h3></div>
                    <ul class="activity-feed">
                        <li><span>14:00</span> Йога у воды (Группа 12 чел.)</li>
                        <li><span>16:30</span> Детский VR-квест (Группа 8 чел.)</li>
                        <li><span>19:00</span> Кинопоказ «Зов моря»</li>
                    </ul>
                </div>
                <div class="dash-panel">
                    <div class="panel-header"><h3 class="panel-title">Заявки на аренду</h3></div>
                    <ul class="activity-feed">
                        <li><span>New</span> Свадьба (Ивановы) — 15 июня</li>
                        <li><span>In work</span> Конференция TechCorp — 22 июня</li>
                        <li><span>Approved</span> Фотосессия Vogue — 25 июня</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // Вкладка: Финансы
    function renderFinanceTab() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div>
                    <h1 class="dash-title">Финансовые показатели</h1>
                    <p class="dash-subtitle">Отчет за текущий месяц</p>
                </div>
                <div class="dash-header-actions">
                    <button class="dash-close-btn" onclick="document.getElementById('dashboardClose').click()">Закрыть панель</button>
                </div>
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
                <div class="metric-card">
                    <div class="metric-label">Расходы (OPEX)</div>
                    <div class="metric-value">₽ 700k</div>
                    <div class="metric-trend">В пределах нормы</div>
                </div>
            </div>
            <div class="dash-panel">
                <div class="panel-header"><h3 class="panel-title">Структура дохода</h3></div>
                <div class="h-bar-chart">
                    <div class="h-bar-row"><div class="h-bar-label">Аренда сцены</div><div class="h-bar-track"><div class="h-bar-fill" style="width: 60%"><span>60%</span></div></div></div>
                    <div class="h-bar-row"><div class="h-bar-label">Кейтеринг и бар</div><div class="h-bar-track"><div class="h-bar-fill" style="width: 25%"><span>25%</span></div></div></div>
                    <div class="h-bar-row"><div class="h-bar-label">Мерч и сувениры</div><div class="h-bar-track"><div class="h-bar-fill" style="width: 15%"><span>15%</span></div></div></div>
                </div>
            </div>
        `;
    }

    // Вкладка: Настройки
    function renderSettingsTab() {
        dashMain.innerHTML = `
            <header class="dash-header">
                <div>
                    <h1 class="dash-title">Настройки системы</h1>
                    <p class="dash-subtitle">Глобальные параметры пространства</p>
                </div>
                <div class="dash-header-actions">
                    <button class="dash-close-btn" onclick="document.getElementById('dashboardClose').click()">Закрыть панель</button>
                </div>
            </header>
            <div class="dash-panel">
                <div class="panel-header"><h3 class="panel-title">Режим работы</h3></div>
                <ul class="activity-feed" style="font-size: 15px;">
                    <li style="justify-content: space-between; align-items: center;">
                        <span>Утренняя йога (07:00)</span>
                        <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--gold);">
                    </li>
                    <li style="justify-content: space-between; align-items: center;">
                        <span>Детские квесты (12:00)</span>
                        <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--gold);">
                    </li>
                    <li style="justify-content: space-between; align-items: center;">
                        <span>Вечерние кинопоказы (19:00)</span>
                        <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--gold);">
                    </li>
                    <li style="justify-content: space-between; align-items: center;">
                        <span>Ночные мероприятия (23:00)</span>
                        <input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--gold);">
                    </li>
                </ul>
                <div style="margin-top: 30px;">
                    <button class="btn-primary" style="padding: 12px 24px; font-size: 11px;">Сохранить изменения</button>
                </div>
            </div>
        `;
    }

    // Функция для перепривязки событий внутри "Обзора", так как мы восстанавливаем HTML из строки
    function rebindOverviewEvents() {
        // Находим кнопку закрытия в восстановленном HTML и привязываем событие
        const newCloseBtn = document.getElementById('dashboardClose');
        if (newCloseBtn) newCloseBtn.addEventListener('click', closeDashboard);
        
        // Перезапускаем ленту событий
        const newFeed = document.getElementById('activityFeed');
        if (newFeed) {
            stopLiveFeed();
            startLiveFeed(newFeed);
        }
    }

    // ================= 6. ЖИВАЯ ЛЕНТА СОБЫТИЙ =================
    const fakeActions = [
        "User from St. Petersburg opened 3D Tour",
        "New review received: 5 stars ⭐",
        "VR Module #4 rebooted",
        "System check: all endpoints OK",
        "User from Kazan requested callback",
        "Dolphin sensor #1 pinged",
        "Booking API: 200 OK",
        "Cache cleared successfully",
        "New partner inquiry from Sochi",
        "Analytics snapshot created"
    ];

    function startLiveFeed(container = activityFeed) {
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
            
            // Вставляем в начало списка
            container.prepend(li);

            // Анимация появления
            setTimeout(() => {
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, 50);

            // Ограничиваем список 6 элементами
            if (container.children.length > 6) {
                container.lastElementChild.remove();
            }
        }, 3500);
    }

    function stopLiveFeed() {
        clearInterval(feedInterval);
        feedInterval = null;
    }

    // ================= 7. ЗАКРЫТИЕ ПО ESC =================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (authModal && authModal.classList.contains('active')) closeAuth();
            if (dashboardPanel && dashboardPanel.classList.contains('active')) closeDashboard();
        }
    });

    // ================= 8. ПЛАВНОЕ ПОЯВЛЕНИЕ (REVEAL) =================
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
