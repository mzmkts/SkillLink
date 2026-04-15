document.addEventListener('DOMContentLoaded', () => {
    // 2. Обработка формы ВХОДА (ЛОГИН)
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('signinEmail').value;
            const password = document.getElementById('signinPassword').value;

            try {
                // Отправляем POST запрос на наш новый контроллер в Spring Boot
                const response = await fetch('http://localhost:8080/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                if (response.ok) {
                    const userData = await response.json();
                    alert('Вы успешно вошли!');

                    // Сохраняем данные юзера в памяти браузера, чтобы знать, что он залогинен
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Перенаправляем на главную страницу
                    window.location.href = '/';
                } else {
                    // Если статус 401 (Unauthorized), выводим ошибку от бэкенда
                    const errorMsg = await response.text();
                    alert('Ошибка: ' + errorMsg);
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
                alert('Не удалось подключиться к серверу.');
            }
        });
    }

    // 3. Обработка формы РЕГИСТРАЦИИ
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                firstNameDto: document.getElementById('firstName').value,
                lastNameDto: document.getElementById('lastName').value,
                emailDto: document.getElementById('signupEmail').value,
                passwordDto: document.getElementById('signupPassword').value,
                // ПОЛУЧАЕМ ВЫБРАННУЮ ШКОЛУ
                school: document.getElementById('schoolSelect').value,
                skills: [] // Скиллы пока пустые, как мы и договаривались
            };

            try {
                const response = await fetch('http://localhost:8080/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Регистрация прошла успешно! Теперь вы можете войти.');
                    window.location.href = '/signin';
                } else {
                    const errorMsg = await response.text();
                    alert('Ошибка регистрации: ' + errorMsg);
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
                alert('Не удалось подключиться к серверу.');
            }
        });
    }
});