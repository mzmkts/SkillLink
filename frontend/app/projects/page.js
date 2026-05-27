"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [recommendedProjects, setRecommendedProjects] = useState([]); // Стейт для рекомендованных проектов
    const [owners, setOwners] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [searchTitle, setSearchTitle] = useState("");
    const [searchSkillQuery, setSearchSkillQuery] = useState(""); // Поиск скилла внутри фильтра

    const [allDbSkills, setAllDbSkills] = useState([]);
    const [selectedSkillIds, setSelectedSkillIds] = useState([]); // Храним ID выбранных скиллов

    const handleApply = async (projectId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Пожалуйста, авторизуйтесь для подачи заявки");
                return;
            }

            const response = await fetch(`http://localhost:8080/api/applications?projectId=${projectId}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                alert("Заявка успешно отправлена!");
            } else {
                alert("Ошибка: Возможно, вы уже подали заявку на этот проект.");
            }
        } catch (err) {
            console.error("Apply error:", err);
            alert("Произошла ошибка при отправке");
        }
    };

    const fetchOwnerName = async (ownerId) => {
        if (!ownerId || owners[ownerId]) return;
        try {
            const res = await fetch(`http://localhost:8080/api/user/${ownerId}`);
            if (res.ok) {
                const data = await res.json();
                const fullName = `${data.lastNameDto} ${data.firstNameDto}`;
                setOwners(prev => ({
                    ...prev,
                    [ownerId]: {
                        name: fullName,
                        email: data.emailDto
                    }
                }));
            }
        } catch (e) {
            console.error("Ошибка загрузки данных автора", e);
        }
    };

    // Основная функция загрузки проектов с фильтрами по скиллам и названию
    const fetchProjects = async (skillIds = [], title = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (title) params.append("title", title);
            if (skillIds.length > 0) {
                skillIds.forEach(id => params.append("skillIds", id));
            }

            const response = await fetch(`http://localhost:8080/api/projects?${params.toString()}`);
            if (!response.ok) throw new Error("Не удалось загрузить проекты");

            const data = await response.json();
            setProjects(data);

            // Собираем авторов
            data.forEach(project => {
                if (project.ownerId) fetchOwnerName(project.ownerId);
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 ИСПРАВЛЕНО: Загрузка рекомендаций проектов на основе стэка из ВСЕХ резюме пользователя
    const fetchRecommendationsAndSkills = async () => {
        try {
            // 1. Тянем вообще все скиллы для фильтра
            const skillsRes = await fetch("http://localhost:8080/api/skills");
            if (skillsRes.ok) {
                const skillsData = await skillsRes.json();
                setAllDbSkills(skillsData);
            }

            // 2. Получаем стэк текущего юзера через исправленный эндпоинт его резюме
            const token = localStorage.getItem("token");
            if (!token) return;

            // Расшифровываем токен, чтобы узнать свой userId
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = payload.userId;

            if (!currentUserId) return;

            // Стучимся в твой точный бэкенд эндпоинт, который возвращает List<ResumeDto> текущего юзера
            const resumeRes = await fetch(`http://localhost:8080/api/resumes/user/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resumeRes.ok) {
                const myResumes = await resumeRes.json();

                if (myResumes && myResumes.length > 0) {
                    // Используем Set для сбора уникальных ID скиллов со всех резюме юзера
                    const mySkillsSet = new Set();

                    myResumes.forEach(resume => {
                        if (resume.skills && resume.skills.length > 0) {
                            resume.skills.forEach(skill => {
                                mySkillsSet.add(skill.id);
                            });
                        }
                    });

                    const consolidatedSkillIds = Array.from(mySkillsSet);

                    // Если у пользователя заполнен стэк хотя бы в одном резюме
                    if (consolidatedSkillIds.length > 0) {
                        const recParams = new URLSearchParams();
                        consolidatedSkillIds.forEach(id => recParams.append("skillIds", id));

                        // Запрашиваем проекты, подходящие под собранные технологии
                        const recRes = await fetch(`http://localhost:8080/api/projects?${recParams.toString()}`);
                        if (recRes.ok) {
                            const recData = await recRes.json();

                            // Исключаем из рекомендаций собственные проекты пользователя
                            const filteredRecs = recData.filter(p => p.ownerId?.toString() !== currentUserId?.toString());
                            setRecommendedProjects(filteredRecs.slice(0, 3)); // Отображаем топ-3 проекта

                            // Догружаем авторов для рекомендованных проектов
                            filteredRecs.forEach(p => { if (p.ownerId) fetchOwnerName(p.ownerId); });
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Ошибка при генерации рекомендаций проектов:", e);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchRecommendationsAndSkills();
    }, []);

    const applyFilters = () => {
        fetchProjects(selectedSkillIds, searchTitle);
        setIsFilterOpen(false);
    };

    const handleSkillCheckboxChange = (skillId) => {
        setSelectedSkillIds(prev =>
            prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
        );
    };

    if (loading && projects.length === 0) return <div className={styles.loader}>Загрузка проектов...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;

    return (
        <main className={styles.mainContainer}>
            {/* ===== SEARCH & STACK ===== */}
            <div className={styles.searchContainer}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>
                <button className={styles.filterButton} onClick={() => setIsFilterOpen(true)}>
                    <span className={styles.filterIcon}>≡</span>
                    Фильтры ({selectedSkillIds.length})
                </button>
            </div>

            {/* ===== ✨ РЕКОМЕНДУЕМЫЕ ПРОЕКТЫ ПО СТЭКУ РЕЗЮМЕ ===== */}
            {recommendedProjects.length > 0 && (
                <section className={styles.recommendationsSection}>
                    <h2 className={styles.sectionTitle}>✨ Рекомендуется для вашего стэка технологий</h2>
                    <div className={styles.projectsGrid}>
                        {recommendedProjects.map((project) => (
                            <div key={`rec-${project.id}`} className={`${styles.projectCard} ${styles.recommendedCard}`}>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.projectTitle}>{project.title || "Без названия"}</h3>
                                    <div className={styles.metaInfo}>
                                        <p>Статус: <strong>{project.status || "OPEN"}</strong></p>
                                        <p>Создатель: <strong>{owners[project.ownerId]?.name || "Загрузка..."}</strong></p>
                                        <p>Email: <strong>{owners[project.ownerId]?.email || "не указан"}</strong></p>
                                    </div>
                                    <div className={styles.projectSkillsTags}>
                                        {project.skills?.map(s => (
                                            <span key={s.id} className={styles.miniSkillTag}>{s.name}</span>
                                        ))}
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button className={styles.applyBtn} onClick={() => handleApply(project.id)}>Записаться</button>
                                        <Link href={`/projects/${project.id}`} className={styles.membersBtn}>Открыть</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ===== FILTER MODAL ===== */}
            {isFilterOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.filterModal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Фильтровать проекты по технологиям</h2>
                            <button className={styles.closeBtn} onClick={() => setIsFilterOpen(false)}>✕</button>
                        </div>
                        <div className={styles.filterContent}>
                            <div className={styles.filterColumn}>
                                <h3>Технологический Стэк</h3>
                                <input
                                    type="text"
                                    className={styles.modalSearchInput}
                                    placeholder="Быстрый поиск технологии..."
                                    value={searchSkillQuery}
                                    onChange={(e) => setSearchSkillQuery(e.target.value)}
                                />
                                <div className={styles.skillsScrollList}>
                                    {allDbSkills
                                        .filter(skill => skill.name.toLowerCase().includes(searchSkillQuery.toLowerCase()))
                                        .map((skill) => (
                                            <label key={skill.id} className={styles.checkboxContainer}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSkillIds.includes(skill.id)}
                                                    onChange={() => handleSkillCheckboxChange(skill.id)}
                                                />
                                                <span className={styles.checkmark}></span>
                                                {skill.name}
                                            </label>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.applyBtn} onClick={applyFilters}>Применить</button>
                            <button className={styles.clearBtn} onClick={() => {setSelectedSkillIds([]); setSearchTitle(""); setSearchSkillQuery("");}}>Очистить все</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ALL PROJECTS GRID ===== */}
            <h2 className={styles.sectionTitle} style={{marginTop: '40px'}}>Все доступные проекты</h2>
            <div className={styles.projectsGrid}>
                {projects.length === 0 ? (
                    <div className={styles.helpText}>Проекты по заданным критериям не найдены</div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className={styles.projectCard}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.projectTitle}>{project.title || "Без названия"}</h3>

                                <div className={styles.metaInfo}>
                                    <p>Статус: <strong>{project.status || "OPEN"}</strong></p>
                                    <p>Создатель: <strong>{owners[project.ownerId]?.name || "Загрузка..."}</strong></p>
                                    <p>Email: <strong>{owners[project.ownerId]?.email || "не указан"}</strong></p>
                                </div>

                                <div className={styles.projectSkillsTags}>
                                    {project.skills?.map(s => (
                                        <span key={s.id} className={styles.miniSkillTag}>{s.name}</span>
                                    ))}
                                </div>

                                <div className={styles.cardActions}>
                                    <button className={styles.applyBtn} onClick={() => handleApply(project.id)}>Записаться</button>
                                    <Link href={`/projects/${project.id}`} className={styles.membersBtn}>Открыть</Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ===== HOW TO SECTION ===== */}
            <section className={styles.howToSection}>
                <h2 className={styles.sectionTitle}>Как объединиться в команду</h2>
                <div className={styles.stepsGrid}>
                    {[
                        {
                            num: "Шаг 1",
                            title: "Найдите людей с похожими целями",
                            text: "Соберите команду из тех, кто:\n• заинтересован в теме\n• хочет реально работать\n• имеет хотя бы базовые навыки"
                        },
                        {
                            num: "Шаг 2",
                            title: "Познакомьтесь и обсудите ожидания",
                            text: "Каждый должен сказать:\n• что он умеет\n• сколько времени готов тратить\n• чего хочет от проекта"
                        },
                        {
                            num: "Шаг 3",
                            title: "Выберите лидера",
                            text: "Нужен человек, который:\n• организует процесс\n• следит за дедлайнами\n• решает конфликты"
                        },
                        {
                            num: "Шаг 4",
                            title: "Определите общую цель",
                            text: "Вместе решите:\n• что именно вы делаете\n• какой результат нужен"
                        },
                        {
                            num: "Шаг 5",
                            title: "Распределите роли",
                            text: "Каждому — конкретная задача:\n• кто делает дизайн\n• кто кодит\n• кто делает презентацию"
                        },
                        {
                            num: "Шаг 6",
                            title: "Настройте общение",
                            text: "Договоритесь:\n• где общаетесь (Telegram, WhatsApp)\n• как часто созвоны / встречи\n• как контролируете прогресс"
                        },
                    ].map((step, idx) => (
                        <div key={idx} className={styles.stepCard}>
                            <h4 className={styles.stepNum}>{step.num}</h4>
                            <p className={styles.stepSubTitle}>{step.title}</p>
                            <p className={styles.stepText}>{step.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}