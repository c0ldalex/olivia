document.addEventListener('DOMContentLoaded', () => {
    
    /* ================= 1. ГЕНЕРАЦИЯ ЧАСТИЦ (ПЛАНКТОН) ================= */
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const particleCount = 50; // Количество частиц
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Случайная позиция по горизонтали
            particle.style.left = `${Math.random() * 100}%`;
            
            // Случайный размер (от 1px до 4px)
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Случайная скорость и задержка анимации
            const duration = 15 + Math.random() * 20; // от 15 до 35 секунд
            const delay = Math.random() * 10; // задержка старта
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${delay}s`; // Отрицательная задержка, чтобы они уже были в воздухе
            
            // Разная прозрачность
            particle.style.opacity = Math.random() * 0.5 + 0.2;

            particlesContainer.appendChild(particle);
        }
    }

    /* ================= 2. ЭФФЕКТ СЖАТИЯ НАВИГАЦИИ ПРИ СКРОЛЛЕ ================= */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ================= 3. ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ (REVEAL) ================= */
    // Автоматически добавляем класс .reveal нужным элементам
    const elementsToReveal = document.querySelectorAll(
        '.section-title, .section-desc, .zone-card, .event-card, .econ-table-wrapper, .econ-quote, .pr-list li, .media-stat-box, .cta-content, .manifesto-content'
    );
    
    elementsToReveal.forEach(el => el.classList.add('reveal'));

    // Настройка обсервера (следит за скроллом)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Срабатывает, когда 15% элемента появляется на экране
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Отписываемся после появления (чтобы не дергалось при скролле вверх)
            }
        });
    }, observerOptions);

    elementsToReveal.forEach(el => observer.observe(el));

    /* ================= 4. МОБИЛЬНОЕ МЕНЮ (БУРГЕР) ================= */
    // Создаем кнопку бургера
    const burger = document.createElement('div');
    burger.classList.add('burger');
    burger.innerHTML = '<span></span><span></span><span></span>';
    navbar.appendChild(burger);

    const navLinks = document.querySelector('.nav-links');

    // Внедряем CSS для бургера и мобильного меню прямо через JS, 
    // чтобы не заставлять тебя снова редактировать style.css
    const mobileStyles = document.createElement('style');
    mobileStyles.innerHTML = `
        /* Стили для мобильного меню */
        @media (max-width: 768px) {
            .nav-links {
                position: fixed;
                top: 0;
                right: -100%;
                width: 100%;
                height: 100vh;
                background: rgba(4, 20, 31, 0.98);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 30px;
                transition: right 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                z-index: 999;
                display: flex !important; /* Принудительно показываем, когда активно */
            }
            .nav-links.mobile-active {
                right: 0;
            }
            .nav-links a {
                font-size: 18px;
            }
            .burger {
                display: flex;
                flex-direction: column;
                gap: 6px;
                cursor: pointer;
                z-index: 1000;
                padding: 10px;
            }
            .burger span {
                display: block;
                width: 30px;
                height: 2px;
                background-color: var(--gold);
                transition: all 0.3s ease;
            }
            /* Анимация бургера в крестик */
            .burger.active span:nth-child(1) {
                transform: translateY(8px) rotate(45deg);
            }
            .burger.active span:nth-child(2) {
                opacity: 0;
            }
            .burger.active span:nth-child(3) {
                transform: translateY(-8px) rotate(-45deg);
            }
        }
        @media (min-width: 769px) {
            .burger {
                display: none;
            }
        }
    `;
    document.head.appendChild(mobileStyles);

    // Логика клика по бургеру
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
        burger.classList.toggle('active');
    });

    // Закрытие меню при клике на ссылку
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-active');
            burger.classList.remove('active');
        });
    });

    /* ================= 5. ПЛАВНЫЙ СКРОЛЛ ДЛЯ СТАРЫХ БРАУЗЕРОВ ================= */
    // (Современные браузеры уже понимают scroll-behavior: smooth из CSS, но это для подстраховки)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});