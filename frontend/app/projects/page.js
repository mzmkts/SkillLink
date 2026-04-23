"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [owners, setOwners] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTitle, setSearchTitle] = useState("");

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    // 🔥 ФУНКЦИЯ ПОДАЧИ ЗАЯВКИ
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
                // Если бэкенд выкидывает ошибку (например, ConstraintViolation если уже подавал)
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
                setOwners(prev => ({ ...prev, [ownerId]: fullName }));
            }
        } catch (e) {
            console.error("Ошибка загрузки данных автора", e);
        }
    };

    const fetchProjects = async (categories = [], skills = [], title = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (title) params.append("title", title);
            if (categories.length > 0) params.append("category", categories[0]);

            const response = await fetch(`http://localhost:8080/api/projects?${params.toString()}`);
            if (!response.ok) throw new Error("Не удалось загрузить проекты");

            const data = await response.json();
            setProjects(data);

            data.forEach(project => {
                if (project.ownerId) fetchOwnerName(project.ownerId);
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const toggleCategory = (item) => {
        setSelectedCategories((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const toggleSkill = (item) => {
        setSelectedSkills((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const applyFilters = () => {
        fetchProjects(selectedCategories, selectedSkills, searchTitle);
        setIsFilterOpen(false);
    };

    if (loading && projects.length === 0) return <div className={styles.loader}>Загрузка проектов...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;

    return (
        <main className={styles.mainContainer}>
            {/* ===== SEARCH ===== */}
            <div className={styles.searchContainer}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>
                <button className={styles.filterButton} onClick={() => setIsFilterOpen(true)}>
                    <span className={styles.filterIcon}>≡</span>
                    Фильтр ({selectedCategories.length + selectedSkills.length})
                </button>
            </div>

            {/* ===== FILTER MODAL ===== */}
            {isFilterOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.filterModal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Фильтровать проекты</h2>
                            <button className={styles.closeBtn} onClick={() => setIsFilterOpen(false)}>✕</button>
                        </div>
                        <div className={styles.filterContent}>
                            <div className={styles.filterColumn}>
                                <h3>Категория</h3>
                                {["To-Do приложение", "Онлайн-магазин", "Стартап-проект", "Анимационный ролик"].map((item) => (
                                    <label key={item} className={styles.checkboxContainer}>
                                        <input type="checkbox" checked={selectedCategories.includes(item)} onChange={() => toggleCategory(item)} />
                                        <span className={styles.checkmark}></span>
                                        {item}
                                    </label>
                                ))}
                            </div>
                            <div className={styles.filterColumn}>
                                <h3>Скилы</h3>
                                {["Дизайн", "Бэк енд/фронт енд", "Ораторство"].map((item) => (
                                    <label key={item} className={styles.checkboxContainer}>
                                        <input type="checkbox" checked={selectedSkills.includes(item)} onChange={() => toggleSkill(item)} />
                                        <span className={styles.checkmark}></span>
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.applyBtn} onClick={applyFilters}>Применить</button>
                            <button className={styles.clearBtn} onClick={() => {setSelectedCategories([]); setSelectedSkills([]); setSearchTitle("");}}>Очистить все</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PROJECTS GRID ===== */}
            <div className={styles.projectsGrid}>
                {projects.map((project) => (
                    <div key={project.id} className={styles.projectCard}>
                        <div className={styles.cardContent}>
                            <h3 className={styles.projectTitle}>{project.title || "Без названия"}</h3>
                            <div className={styles.metaInfo}>
                                <p>Статус: <strong>{project.status || "OPEN"}</strong></p>
                                <p>Создатель: <strong>
                                    {owners[project.ownerId] || project.ownerName || "Admin"}
                                </strong></p>
                            </div>
                            <div className={styles.cardActions}>
                                {/* 🔥 ТЕПЕРЬ КНОПКА РАБОТАЕТ */}
                                <button
                                    className={styles.applyBtn}
                                    onClick={() => handleApply(project.id)}
                                >
                                    Записаться
                                </button>
                                <Link href={`/projects/${project.id}`} className={styles.membersBtn}>
                                    Открыть
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== HOW TO SECTION ===== */}
            <section className={styles.howToSection}>
                <h2 className={styles.sectionTitle}>Как объединиться в команду</h2>
                <div className={styles.stepsGrid}>
                    {[
                        { num: "Шаг 1", title: "Найдите людей", text: "• заинтересован в теме\n• хочет реально работать" },
                        { num: "Шаг 2", title: "Познакомьтесь", text: "• что умеет\n• сколько времени" },
                        { num: "Шаг 3", title: "Выберите лидера", text: "• организует процесс\n• дедлайны" },
                        { num: "Шаг 4", title: "Цель", text: "• что делаете\n• результат" },
                        { num: "Шаг 5", title: "Роли", text: "• дизайн\n• разработка" },
                        { num: "Шаг 6", title: "Коммуникация", text: "• Telegram\n• созвоны" },
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