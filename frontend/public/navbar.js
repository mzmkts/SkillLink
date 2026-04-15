(function() {
    const navbarPath = '/components/navbar.html';
    const navbarCssPath = '/components/navbar.css';

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = navbarCssPath;
    document.head.appendChild(link);

    fetch(navbarPath)
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
            initializeNavbarLogic();
        });

    function initializeNavbarLogic() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const unauthBlock = document.getElementById('unauth-block');
        const authBlock = document.getElementById('auth-block');
        const userNameDisplay = document.getElementById('userNameDisplay');

        // Проверяем, есть ли данные юзера в памяти браузера
        const userStr = localStorage.getItem('user');

        if (userStr) {
            // Юзер залогинен!
            const user = JSON.parse(userStr);
            unauthBlock.style.display = 'none';      // Прячем кнопку "Войти"
            authBlock.style.display = 'flex';        // Показываем профиль
            userNameDisplay.textContent = user.firstNameDto || 'Профиль'; // Подставляем имя
        } else {
            // Юзер не залогинен
            unauthBlock.style.display = 'block';
            authBlock.style.display = 'none';
        }

        // Клик по кнопке "Войти"
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = '/signin';
            });
        }

        // Клик по кнопке "Выйти"
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('user'); // Удаляем данные из памяти
                window.location.href = '/';      // Перекидываем на главную (страница перезагрузится и навбар обновится)
            });
        }
    }
})();