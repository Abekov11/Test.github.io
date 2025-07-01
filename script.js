// script.js
// Создание звездного фона
function createStarfield() {
    const container = document.getElementById('starfield');
    const starCount = 400;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Размер звезды
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Позиция
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Длительность анимации
        star.style.setProperty('--duration', `${5 + Math.random() * 10}s`);
        
        // Начальная задержка
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(star);
    }
}

// 3D Модель Земли
function initEarthModel() {
    const container = document.getElementById('earth-container');
    if (!container) return;
    
    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = null;
    
    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    
    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Создаем Землю
    const createEarth = () => {
        const group = new THREE.Group();
        
        // Геометрия Земли
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        
        // Загрузка текстур
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earthBumpMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
        const earthSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
        
        // Материал Земли
        const earthMaterial = new THREE.MeshPhongMaterial({ 
            map: earthTexture,
            bumpMap: earthBumpMap,
            bumpScale: 0.05,
            specularMap: earthSpecularMap,
            specular: new THREE.Color(0x333333),
            shininess: 5
        });
        
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        group.add(earth);
        
        // Облака
        const cloudsGeometry = new THREE.SphereGeometry(5.05, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),
            transparent: true,
            opacity: 0.8
        });
        
        const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        group.add(clouds);
        
        return group;
    };
    
    const earth = createEarth();
    scene.add(earth);
    
    // Добавляем звезды на задний план
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        sizeAttenuation: true
    });
    
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Добавляем элементы управления
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    
    // Анимация
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Вращение Земли
        earth.rotation.y += 0.002;
        
        controls.update();
        renderer.render(scene, camera);
    };
    
    animate();
    
    // Обработка изменения размера окна
    const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Инициализация обработчиков для мобильных устройств
    initTouchControls(container, camera, controls);
}

// Инициализация сенсорного управления для мобильных устройств
function initTouchControls(container, camera, controls) {
    let isDragging = false;
    let previousTouch = { x: 0, y: 0 };
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousTouch = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - previousTouch.x;
            const deltaY = e.touches[0].clientY - previousTouch.y;
            
            // Вращение камеры
            camera.rotation.y += deltaX * 0.01;
            camera.rotation.x += deltaY * 0.01;
            
            previousTouch = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Обработка масштабирования (зум)
    let initialDistance = 0;
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            const zoomSpeed = 0.05;
            const zoomDelta = (initialDistance - currentDistance) * zoomSpeed;
            
            // Применяем зум
            camera.position.z += zoomDelta;
            camera.position.z = Math.max(8, Math.min(30, camera.position.z));
            
            initialDistance = currentDistance;
            e.preventDefault();
        }
    });
}

// Функции для мультиязычности
function initLanguageSwitcher() {
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.querySelector('.language-dropdown');
    
    languageToggle.addEventListener('click', () => {
        languageDropdown.style.display = 
            languageDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Обработка выбора языка
    document.querySelectorAll('.language-dropdown button').forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            setLanguage(lang);
            languageDropdown.style.display = 'none';
        });
    });
}

// Объект с переводами
const translations = {
    ru: {
        college_name: "Болашак Колледж",
        home: "Главная",
        about: "О колледже",
        contact: "Контакты",
        specialties: "Специальности",
        students: "Студентам",
        enrollee: "Абитуриентам",
        teachers: "Преподаватели",
        news: "Новости",
        gallery: "Галерея",
        admin: "Админ",
        ai_chat: "ИИ-помощник",
        // ... другие фразы
    },
    kk: {
        college_name: "Болашак Колледж",
        home: "Басты",
        about: "Колледж туралы",
        contact: "Байланыс",
        specialties: "Мамандықтар",
        students: "Студенттерге",
        enrollee: "Абитуриенттерге",
        teachers: "Оқытушылар",
        news: "Жаңалықтар",
        gallery: "Галерея",
        admin: "Әкімші",
        ai_chat: "ИИ-көмекші",
    },
    en: {
        college_name: "Bolashak College",
        home: "Home",
        about: "About College",
        contact: "Contacts",
        specialties: "Specialties",
        students: "For Students",
        enrollee: "For Enrollee",
        teachers: "Teachers",
        news: "News",
        gallery: "Gallery",
        admin: "Admin",
        ai_chat: "AI Assistant",
    }
};

function setLanguage(lang) {
    // Сохраняем выбор языка
    localStorage.setItem('language', lang);
    
    // Обновляем интерфейс
    updateLanguageText(lang);
}

function updateLanguageText(lang) {
    // Обновляем логотип и заголовок страницы
    document.querySelector('.logo-text').textContent = translations[lang].college_name;
    document.title = translations[lang].college_name;
    
    // Обновляем все элементы с атрибутом data-translate
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Навигация по страницам и функциональность
document.addEventListener('DOMContentLoaded', function() {
    // Показываем прелоадер
    const preloader = document.getElementById('preloader');
    
    // Создание звездного фона
    createStarfield();
    
    // Инициализация переключателя языка
    initLanguageSwitcher();
    
    // Проверка сохраненного языка
    const savedLanguage = localStorage.getItem('language') || 'ru';
    setLanguage(savedLanguage);
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const themeToggle = document.getElementById('theme-toggle');
    const banner = document.querySelector('.ad-banner');
    const aiChatBtn = document.getElementById('ai-chat-btn');
    const aiChat = document.getElementById('ai-chat');
    const closeChat = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const openChatMenu = document.getElementById('open-chat-menu');
    const adminModal = document.getElementById('admin-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const editButtons = document.querySelectorAll('.admin-btn.edit');
    
    // Переключение темы
    themeToggle.addEventListener('click', function() {
        // Добавляем класс для анимации
        this.classList.add('animate');
        
        // Переключаем тему
        document.body.classList.toggle('light-theme');
        
        // Убираем класс анимации после завершения
        setTimeout(() => {
            this.classList.remove('animate');
        }, 500);
    });
    
    // Открытие бокового меню
    mobileMenuBtn.addEventListener('click', function() {
        sidebarMenu.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Закрытие бокового меню
    function closeMenu() {
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeMenuBtn.addEventListener('click', closeMenu);
    sidebarOverlay.addEventListener('click', closeMenu);
    
    // Навигация по страницам
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Скрываем все страницы
            pages.forEach(page => page.classList.remove('active'));
            
            // Показываем выбранную страницу
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
            
            // Закрываем боковое меню
            closeMenu();
            
            // Прокрутка наверх страницы
            window.scrollTo(0, 0);
        });
    });
    
    // Анимация при скролле
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateOnScrollElements.forEach(element => {
        observer.observe(element);
    });
    
    // Скрытие прелоадера после загрузки страницы
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        // Анимация появления баннера
        setTimeout(() => {
            banner.style.transform = 'translateX(0)';
            banner.style.opacity = '1';
        }, 300);
    }, 2000);
    
    // Клик по баннеру
    banner.addEventListener('click', function(e) {
        if (e.target.classList.contains('banner-btn')) {
            // Переход на страницу абитуриентов
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="enrollee"]').classList.add('active');
            
            // Скрыть все страницы и показать нужную
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('enrollee').classList.add('active');
            
            // Закрыть меню если открыто
            closeMenu();
        }
    });
    
    // ИИ-чат
    aiChatBtn.addEventListener('click', function() {
        aiChat.classList.toggle('active');
    });
    
    closeChat.addEventListener('click', function() {
        aiChat.classList.remove('active');
    });
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        messageDiv.innerHTML = `
            <div class="avatar">
                <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="text">${text}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function getAIResponse(message) {
        const responses = {
            "привет": "Привет! Чем могу помочь?",
            "как поступить": "Для поступления вам нужно подать документы в приемную комиссию. Подробности можно найти на странице 'Абитуриентам'.",
            "специальности": "У нас есть специальности: Программирование, Дизайн, Бухгалтерский учет, Педагогика. Подробности на странице 'Специальности'.",
            "расписание": "Расписание занятий можно посмотреть в личном кабинете студента или на странице 'Студентам'.",
            "адрес": "Мы находимся по адресу: ул. Айтеке би, 45",
            "контакты": "Наши контакты: +7 (7242) 55-55-55, info@bolashak-college.kz"
        };
        
        const lowerMsg = message.toLowerCase();
        
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMsg.includes(key)) {
                return value;
            }
        }
        
        return "Извините, я не понял ваш вопрос. Можете переформулировать?";
    }
    
    sendBtn.addEventListener('click', function() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            
            // Имитация задержки ответа ИИ
            setTimeout(() => {
                const response = getAIResponse(message);
                addMessage(response);
            }, 1000);
        }
    });
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
    
    // Открытие чата из меню
    openChatMenu.addEventListener('click', function(e) {
        e.preventDefault();
        aiChat.classList.add('active');
        closeMenu();
    });
    
    // Админ-панель - переключение вкладок
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Убираем активный класс у всех кнопок
            tabBtns.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Скрываем все вкладки
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Показываем выбранную вкладку
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Админ-панель - открытие модального окна
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const cells = row.querySelectorAll('td');
            
            document.getElementById('edit-username').value = cells[1].textContent;
            document.getElementById('edit-email').value = cells[2].textContent;
            document.getElementById('edit-role').value = cells[3].textContent.toLowerCase();
            
            adminModal.classList.add('active');
        });
    });
    
    // Закрытие модального окна
    cancelEdit.addEventListener('click', function() {
        adminModal.classList.remove('active');
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        if (e.target === adminModal) {
            adminModal.classList.remove('active');
        }
    });
    
    // Инициализация 3D модели Земли
    initEarthModel();

    // 1. Кнопки "Подробнее" и "Подать заявку" на странице "Специальности"
    document.querySelectorAll('.specialty-detail-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Реализация просмотра деталей специальности
            const specialtyCard = this.closest('.specialty-card');
            const specialtyName = specialtyCard.querySelector('h4').textContent;
            alert(`Подробная информация о специальности: ${specialtyName}`);
        });
    });

    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Переключение на страницу абитуриентов
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="enrollee"]').classList.add('active');
            
            // Скрыть все страницы и показать нужную
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('enrollee').classList.add('active');
            
            // Скролл к форме заявки
            document.getElementById('enrollee-form-section').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 2. Функционал расписания для студентов
    const schedulePrev = document.querySelector('.schedule-prev');
    const scheduleNext = document.querySelector('.schedule-next');
    const scheduleDate = document.querySelector('.schedule-date');
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    let currentMonth = 8; // Сентябрь (0-11)
    
    function updateScheduleDisplay() {
        scheduleDate.textContent = `${months[currentMonth]} 2023`;
    }
    
    schedulePrev.addEventListener('click', function() {
        currentMonth = (currentMonth - 1 + 12) % 12;
        updateScheduleDisplay();
    });
    
    scheduleNext.addEventListener('click', function() {
        currentMonth = (currentMonth + 1) % 12;
        updateScheduleDisplay();
    });

    // Кнопки скачивания материалов
    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', function() {
            const materialCard = this.closest('.material-card');
            const materialName = materialCard.querySelector('h4').textContent;
            alert(`Скачивание материала: ${materialName}\n\nФункция скачивания будет реализована в полной версии приложения.`);
        });
    });

    // 3. Фильтрация преподавателей по кафедрам
    const departmentBtns = document.querySelectorAll('.department-btn');
    const teacherCards = document.querySelectorAll('.teacher-card');
    
    departmentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const department = this.getAttribute('data-department');
            
            // Обновляем активную кнопку
            departmentBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Фильтрация преподавателей
            teacherCards.forEach(card => {
                if (department === 'all' || card.getAttribute('data-department') === department) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 4. Фильтрация новостей
    const newsFilterBtns = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');
    
    newsFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Обновляем активную кнопку
            newsFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Фильтрация новостей
            newsCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 5. Фильтрация галереи
    const galleryCategoryBtns = document.querySelectorAll('.category-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryCategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Обновляем активную кнопку
            galleryCategoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Фильтрация элементов галереи
            galleryItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 6. Скролл к форме заявки при нажатии на "Подать заявку"
    document.querySelectorAll('.btn[data-page="enrollee"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Переключение на страницу абитуриентов
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="enrollee"]').classList.add('active');
            
            // Скрыть все страницы и показать нужную
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('enrollee').classList.add('active');
            
            // Скролл к форме заявки
            document.getElementById('enrollee-form-section').scrollIntoView({ behavior: 'smooth' });
        });
    });
});