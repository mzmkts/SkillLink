document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
});

// Функция для получения данных с Spring Boot бэкенда
async function fetchProjects() {
    const container = document.getElementById('projects-container');

    try {
        // Делаем реальный GET-запрос к твоему контроллеру
        const response = await fetch('http://localhost:8080/api/projects');

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        // Получаем List<ProjectDto> в виде массива JSON
        const projects = await response.json();

        if (projects.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #7A8B99;">Проектов пока нет. Создайте первый!</p>';
            return;
        }

        renderProjects(projects, container);

    } catch (error) {
        console.error('Ошибка при загрузке проектов с бэкенда:', error);
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Не удалось связаться с сервером (порт 8080). Убедитесь, что Spring Boot запущен и настроен CORS.</p>';
    }
}

function renderProjects(projects, container) {
    container.innerHTML = '';

    projects.forEach(project => {
        const title = project.title || 'Без названия';
        const category = project.category || 'Без категории';

        // Переводим статус на русский для красоты интерфейса
        let statusText = project.status;
        if (project.status === 'IN_PROGRESS') statusText = 'В процессе';
        if (project.status === 'CLOSED') statusText = 'Закрыт';

        // Формируем карточку, подставляя реальные данные из твоего JSON
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${title}</h3>
            <p style="color: #4A8B8C; font-weight: 500; margin-bottom: 8px;">${category}</p>
            <p style="margin-bottom: 5px;">${project.description || 'Описание отсутствует'}</p>
            <p style="font-size: 12px; color: #999;">Статус: ${statusText} • Создатель: ${project.ownerName}</p>
            
            <div class="project-actions" style="margin-top: 15px;">
                <button class="btn btn-primary" onclick="joinProject(${project.id})">Записаться</button>
                <button class="btn btn-light">Участники</button>
            </div>
        `;
        container.appendChild(card);
    });
}
// Заготовка для будущей функции "Записаться" (отправка POST/PUT запроса)
function joinProject(projectId) {
    console.log(`Попытка записаться на проект с ID: ${projectId}`);
    alert(`Функция записи на проект #${projectId} в разработке!`);
}