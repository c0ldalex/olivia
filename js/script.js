document.addEventListener('DOMContentLoaded', () => {

    // ================= 1. ЧАСТИЦЫ =================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = `${Math.random() * 100}%`;
            const size = Math.random() * 3 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.animationDuration = `${15 + Math.random() * 20}s`;
            p.style.animationDelay = `-${Math.random() * 10}s`;
            p.style.opacity = Math.random() * 0.5 + 0.2;
            particlesContainer.appendChild(p);
        }
    }

    // ================= 2. NAVBAR SCROLL =================
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

    // ВАЛИДНЫЕ ДАННЫЕ (тестовые)
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

    // ================= 5. ДАШБОРД =================
    const dashboardPanel = document.getElementById('dashboardPanel');
    const dashboardClose = document.getElementById('dashboardClose');
    const logoutBtn = document.getElementById('logoutBtn');
    const activityFeed = document.getElementById('activityFeed');

    let feedInterval = null;

    function openDashboard() {
        dashboardPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
        startLiveFeed();
    }

    function closeDashboard() {
        dashboardPanel.classList.remove('active');
        document.body.style.overflow = '';
        stopLiveFeed();
    }

    if (dashboardClose) dashboardClose.addEventListener('click', closeDashboard);
    if (logoutBtn) logoutBtn.addEventListener('click', closeDashboard);

    // Живая лента
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

    function startLiveFeed() {
        if (feedInterval) return;
        feedInterval = setInterval(() => {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const action = fakeActions[Math.floor(Math.random() * fakeActions.length)];

            const li = document.createElement('li');
            li.innerHTML = `<span>${time}</span> ${action}`;
            li.style.opacity = '0';
            li.style.transform = 'translateX(-10px)';
            li.style.transition = 'all 0.4s ease';
            activityFeed.prepend(li);

            setTimeout(() => {
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, 50);

            if (activityFeed.children.length > 6) {
                activityFeed.lastElementChild.remove();
            }
        }, 3500);
    }

    function stopLiveFeed() {
        clearInterval(feedInterval);
        feedInterval = null;
    }

    // ================= 6. ESC ДЛЯ ЗАКРЫТИЯ =================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (authModal && authModal.classList.contains('active')) closeAuth();
            if (dashboardPanel && dashboardPanel.classList.contains('active')) closeDashboard();
        }
    });

    // ================= 7. REVEAL ON SCROLL =================
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
