"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProjectDetailPage({ params }) {
    const router = useRouter();
    const projectId = params.id;

    const [project, setProject] = useState(null);
    const [owner, setOwner] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false); // Лоадер для удаления/выхода

    // Стейты для работы со скиллами
    const [allDbSkills, setAllDbSkills] = useState([]); // Все доступные скиллы из БД
    const [searchQuery, setSearchQuery] = useState(""); // Поисковая строка
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Открытие выпадающего списка

    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        status: "",
        skills: [] // Будем хранить выбранные скиллы в форме редактирования
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.userId);
            } catch (e) { console.error(e); }
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                // 1. Загружаем сам проект
                const res = await fetch(`http://localhost:8080/api/projects/${projectId}`, { headers });
                const data = await res.json();
                setProject(data);
                setEditForm({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    skills: data.skills || [] // Подтягиваем скиллы проекта в форму
                });

                // 2. Загружаем создателя проекта
                const userRes = await fetch(`http://localhost:8080/api/user/${data.ownerId}`, { headers });
                if (userRes.ok) setOwner(await userRes.json());

                // 3. Загружаем ВСЕ заявки проекта
                const appsRes = await fetch(`http://localhost:8080/api/applications`, { headers });
                if (appsRes.ok) {
                    const allApps = await appsRes.json();
                    const projectApps = allApps.filter(app => app.projectId?.toString() === projectId.toString());
                    setApplications(projectApps);
                }

                // 4. Загружаем ВСЕ доступные технологии из бэкенда для редактора
                const allSkillsRes = await fetch(`http://localhost:8080/api/skills`, { headers });
                if (allSkillsRes.ok) setAllDbSkills(await allSkillsRes.json());

            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [projectId]);

    const isOwner = currentUserId?.toString() === project?.ownerId?.toString();

    // Проверяем, является ли текущий пользователь принятым участником команды
    const myAcceptedApplication = applications.find(
        app => app.userId?.toString() === currentUserId?.toString() && app.status === "ACCEPTED"
    );
    const isMember = !!myAcceptedApplication;

    // Добавление / удаление технологии внутри формы редактирования
    const handleSkillToggle = (skill) => {
        const isAlreadyAdded = editForm.skills.some(s => s.id === skill.id);
        if (isAlreadyAdded) {
            setEditForm({
                ...editForm,
                skills: editForm.skills.filter(s => s.id !== skill.id)
            });
        } else {
            setEditForm({
                ...editForm,
                skills: [...editForm.skills, skill]
            });
        }
    };

    const handleUpdateProject = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    status: editForm.status,
                    skills: editForm.skills // Передаем измененный массив объектов бэкенду
                })
            });
            if (res.ok) {
                setProject({ ...project, ...editForm });
                setIsEditingProject(false);
                alert("Проект успешно обновлен!");
            } else {
                alert("Ошибка при сохранении изменений");
            }
        } catch (e) { alert("Ошибка обновления"); }
    };

    const handleStatusUpdate = async (appId, status) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/applications/${appId}/status?status=${status}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setApplications(apps => apps.map(a => a.id === appId ? {...a, status} : a));
            }
        } catch (e) { alert("Ошибка статуса"); }
    };

    const handleApply = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/applications?projectId=${projectId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) alert("Заявка отправлена!");
        } catch (e) { alert("Ошибка"); }
    };

    // ===== ФУНКЦИЯ УДАЛЕНИЯ ПРОЕКТА (ДЛЯ OWNER) =====
    const handleDeleteProject = async () => {
        const isConfirmed = window.confirm("Вы уверены, что хотите навсегда удалить этот проект?");
        if (!isConfirmed) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`http://localhost:8080/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!res.ok) throw new Error("Не удалось удалить проект");

            alert("Проект успешно удален!");

            // Редирект в профиль создателя
            if (currentUserId) {
                router.push(`/profile/${currentUserId}`);
            } else {
                router.push('/profile');
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    // ===== ФУНКЦИЯ ВЫХОДА ИЗ ПРОЕКТА (ДЛЯ УЧАСТНИКА) =====
    const handleLeaveProject = async () => {
        const isConfirmed = window.confirm("Вы уверены, что хотите покинуть этот проект?");
        if (!isConfirmed) return;

        if (!myAcceptedApplication) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Удаляем заявку, которая связывала студента с проектом
            const res = await fetch(`http://localhost:8080/api/applications/${myAcceptedApplication.id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!res.ok) throw new Error("Не удалось покинуть проект");

            alert("Вы успешно покинули проект.");

            // Локально убираем себя из списка заявок/участников проекта
            setApplications(apps => apps.filter(a => a.id !== myAcceptedApplication.id));
        } catch (e) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className={styles.loader}>Загрузка...</div>;

    const accepted = applications.filter(a => a.status === "ACCEPTED");
    const pending = applications.filter(a => a.status === "PENDING");

    return (
        <main className={styles.container}>
            <div className={styles.topBar}>
                <button className={styles.backLink} onClick={() => router.back()}>← Назад</button>
            </div>

            <header className={styles.projectHeader}>
                <div className={styles.titleInfo}>
                    {isEditingProject ? (
                        <input className={styles.editInputTitle} value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                    ) : (
                        <h1 className={styles.projectTitle}>{project.title}</h1>
                    )}
                    {!isEditingProject && <span className={styles.badge}>{project.status}</span>}
                </div>
                <p className={styles.creator}>Создатель: <span>{owner?.lastNameDto} {owner?.firstNameDto}</span></p>
            </header>

            <div className={styles.mainGrid}>
                <div className={styles.leftCol}>
                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>Описание</h3>
                        {isEditingProject ? (
                            <textarea className={styles.editTextarea} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                        ) : (
                            <p className={styles.text}>{project.description}</p>
                        )}
                    </section>

                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>Технологический стэк</h3>

                        {isEditingProject ? (
                            <div className={styles.editSkillsSection}>
                                <div className={styles.searchWrapper}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Кликните для выбора технологий или начните вводить..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onBlur={() => {
                                            setTimeout(() => setIsDropdownOpen(false), 200);
                                        }}
                                    />

                                    {isDropdownOpen && (
                                        <div className={styles.dropdown}>
                                            {allDbSkills
                                                .filter(skill =>
                                                    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                                    !editForm.skills.some(s => s.id === skill.id)
                                                )
                                                .map(skill => (
                                                    <div
                                                        key={skill.id}
                                                        className={styles.dropdownItem}
                                                        onClick={() => {
                                                            handleSkillToggle(skill);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        {skill.name}
                                                    </div>
                                                ))}
                                            {allDbSkills.filter(skill =>
                                                skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                                !editForm.skills.some(s => s.id === skill.id)
                                            ).length === 0 && (
                                                <div className={styles.noResults}>Ничего не найдено</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.skillsContainer} style={{ marginTop: '12px' }}>
                                    {editForm.skills.map(skill => (
                                        <div key={skill.id} className={styles.chosenTag}>
                                            <span>{skill.name}</span>
                                            <button
                                                type="button"
                                                className={styles.removeTagBtn}
                                                onClick={() => handleSkillToggle(skill)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.skillsList}>
                                {project.skills && project.skills.length > 0 ? (
                                    project.skills.map(s => (
                                        <span key={`project-skill-${s.id}`} className={styles.skillTagView}>
                                            {s.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className={styles.helpText}>Технологии не указанны</span>
                                )}
                            </div>
                        )}
                    </section>

                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>Команда проекта</h3>
                        <div className={styles.teamList}>
                            {owner && (
                                <div className={`${styles.member} ${styles.ownerMember}`}>
                                    <span className={styles.memberName}>{owner.lastNameDto} {owner.firstNameDto}</span>
                                    <span className={styles.roleTag}>Владелец</span>
                                </div>
                            )}
                            {accepted.map(a => (
                                <div key={a.id} className={styles.member}>
                                    <span className={styles.memberName}>{a.studentName || `Студент #${a.userId}`}</span>
                                    <span className={styles.roleTag}>Участник</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {isOwner && pending.length > 0 && (
                        <section className={`${styles.card} ${styles.highlightCard}`}>
                            <h3 className={styles.cardTitle}>Запросы на вступление</h3>
                            <div className={styles.appsList}>
                                {pending.map(a => (
                                    <div key={a.id} className={styles.appRow}>
                                        <div className={styles.appInfo}>
                                            <span className={styles.appName}>{a.studentName || `Пользователь #${a.userId}`}</span>
                                            <span className={styles.appStatus}>ID заявки: {a.id}</span>
                                        </div>
                                        <div className={styles.appBtns}>
                                            <button className={styles.btnYes} onClick={() => handleStatusUpdate(a.id, "ACCEPTED")}>Принять</button>
                                            <button className={styles.btnNo} onClick={() => handleStatusUpdate(a.id, "REJECTED")}>Отказать</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className={styles.rightCol}>
                    <div className={styles.sideCard}>
                        <h3 className={styles.cardTitle}>Управление</h3>
                        {isEditingProject ? (
                            <div className={styles.editFields}>
                                <label>Статус:</label>
                                <select className={styles.editSelect} value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                <button className={styles.saveBtn} onClick={handleUpdateProject}>Сохранить</button>
                                <button className={styles.cancelBtn} onClick={() => setIsEditingProject(false)}>Отмена</button>
                            </div>
                        ) : (
                            <div className={styles.infoBox}>
                                <div className={styles.infoItem}><span>Статус:</span> <strong>{project.status}</strong></div>
                                <div className={styles.infoItem}><span>Проект ID:</span> <strong>{projectId}</strong></div>

                                {isOwner ? (
                                    <div className={styles.ownerActions}>
                                        <button className={styles.editBtnSide} onClick={() => setIsEditingProject(true)}>✎ Редактировать</button>
                                        <button
                                            className={styles.deleteProjectBtn}
                                            onClick={handleDeleteProject}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? "Удаление..." : "🗑 Удалить проект"}
                                        </button>
                                    </div>
                                ) : isMember ? (
                                    <button
                                        className={styles.leaveBtn}
                                        onClick={handleLeaveProject}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Выход..." : "🚪 Покинуть проект"}
                                    </button>
                                ) : (
                                    <button className={styles.applyBtn} onClick={handleApply}>Подать заявку</button>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}