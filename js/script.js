document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ЧАСТИЦЫ
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

    // 2. СЖАТИЕ НАВИГАЦИИ
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 3. РАСПИСАНИЕ
    const tabs = document.querySelectorAll('.schedule-tab');
    const panels = document.querySelectorAll('.schedule-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-time')).classList.add('active');
        });
    });

    // 4. АДМИН-ПАНЕЛЬ
    const adminTrigger = document.getElementById('adminTrigger');
    const adminPanel = document.getElementById('adminPanel');
    const adminClose = document.getElementById('adminClose');
    const activityFeed = document.getElementById('activityFeed');

    if (adminTrigger && adminPanel) {
        adminTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            adminPanel.classList.add('active');
            startLiveFeed(); // Запускаем "живую" ленту
        });

        adminClose.addEventListener('click', () => {
            adminPanel.classList.remove('active');
            stopLiveFeed();
        });

        // Закрытие по клику вне окна
        adminPanel.addEventListener('click', (e) => {
            if (e.target === adminPanel) {
                adminPanel.classList.remove('active');
                stopLiveFeed();
            }
        });
    }

    // Генератор фейковых логов для админки
    let feedInterval;
    const fakeActions = [
        "User from St. Petersburg opened 3D Tour",
        "New review received: 5 stars",
        "VR Module #4 rebooting...",
        "System check: OK",
        "User from Kazan requested callback",
        "Dolphin sensor #1 pinged",
        "Booking API: 200 OK",
        "Cache cleared successfully"
    ];

    function startLiveFeed() {
        if (feedInterval) return;
        feedInterval = setInterval(() => {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const action = fakeActions[Math.floor(Math.random() * fakeActions.length)];
            
            const li = document.createElement('li');
            li.innerHTML = `<span>${time}</span> ${action}`;
            li.style.opacity = 0;
            li.style.transition = 'opacity 0.5s';
            activityFeed.prepend(li);
            
            // Анимация появления
            setTimeout(() => li.style.opacity = 1, 50);

            // Ограничиваем список 5 элементами
            if (activityFeed.children.length > 5) {
                activityFeed.lastElementChild.remove();
            }
        }, 3000); // Каждые 3 секунды
    }

    function stopLiveFeed() {
        clearInterval(feedInterval);
        feedInterval = null;
    }
});
