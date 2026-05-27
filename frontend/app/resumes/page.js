"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ResumePage() {
    const [resumes, setResumes] = useState([]); // Храним список всех резюме вместо пользователей
    const [recommendedUsers, setRecommendedUsers] = useState([]); // Рекомендованные кандидаты
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Состояния фильтрации
    const [selectedSkillIds, setSelectedSkillIds] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [search, setSearch] = useState("");
    const [skillSearch, setSkillSearch] = useState("");

    // Динамический список навыков из бэкенда
    const [allDbSkills, setAllDbSkills] = useState([]);

    const schoolsList = [
        "Школа цифровых технологий",
        "Школа экономики и менеджмента",
        "Narxoz Business School",
        "Гуманитарная школа",
        "Школа права и государственного управления"
    ];

    // 🔥 ИСПРАВЛЕНО: Загрузка всех РЕЗЮМЕ с фильтрацией (клиентская фильтрация для кастомных полей или эндпоинт /api/resumes)
    const fetchAllResumes = async (skillIds = [], schools = [], searchText = "") => {
        try {
            setLoading(true);

            // Стучимся в твой новый метод getAllResumes() -> GET /api/resumes
            const response = await fetch(`http://localhost:8080/api/resumes`);
            if (!response.ok) throw new Error("Не удалось загрузить резюме");

            let data = await response.json();

            // 🛠 Фильтрация на стороне фронтенда, так как метод /api/resumes возвращает полный список
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                data = data.filter(r =>
                    r.userDto?.firstNameDto?.toLowerCase().includes(searchLower) ||
                    r.userDto?.lastNameDto?.toLowerCase().includes(searchLower) ||
                    r.title?.toLowerCase().includes(searchLower)
                );
            }

            if (schools.length > 0) {
                data = data.filter(r => schools.includes(r.userDto?.school));
            }

            if (skillIds.length > 0) {
                data = data.filter(r =>
                    r.skills && r.skills.some(skill => skillIds.includes(skill.id))
                );
            }

            setResumes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка справочника скиллов и генерация рекомендаций на основе ВСЕХ резюме текущего юзера
    const fetchSkillsAndRecommendations = async () => {
        try {
            const skillsRes = await fetch("http://localhost:8080/api/skills");
            if (skillsRes.ok) {
                const skillsData = await skillsRes.json();
                setAllDbSkills(skillsData);
            }

            const token = localStorage.getItem("token");
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = payload.userId;

            if (!currentUserId) return;

            // Тянем все резюме текущего пользователя по твоему эндпоинту
            const resumeRes = await fetch(`http://localhost:8080/api/resumes/user/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resumeRes.ok) {
                const myResumes = await resumeRes.json();

                if (myResumes && myResumes.length > 0) {
                    const mySkillsSet = new Set();

                    myResumes.forEach(resume => {
                        if (resume.skills && resume.skills.length > 0) {
                            resume.skills.forEach(skill => {
                                mySkillsSet.add(skill.id);
                            });
                        }
                    });

                    const consolidatedSkillIds = Array.from(mySkillsSet);

                    if (consolidatedSkillIds.length > 0) {
                        const recParams = new URLSearchParams();
                        consolidatedSkillIds.forEach(id => recParams.append("skillIds", id));

                        const recUsersRes = await fetch(`http://localhost:8080/api/user?${recParams.toString()}`);
                        if (recUsersRes.ok) {
                            const recUsersData = await recUsersRes.json();
                            const filteredRecUsers = recUsersData.filter(u =>
                                u.userIdDto?.toString() !== currentUserId?.toString()
                            );
                            setRecommendedUsers(filteredRecUsers.slice(0, 3));
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Ошибка при генерации рекомендаций студентов по резюме:", e);
        }
    };

    useEffect(() => {
        fetchAllResumes();
        fetchSkillsAndRecommendations();
    }, []);

    const toggleSkill = (skillId) => {
        setSelectedSkillIds((prev) =>
            prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
        );
    };

    const toggleSchool = (item) => {
        setSelectedSchools((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const clearFilters = () => {
        setSelectedSkillIds([]);
        setSelectedSchools([]);
        setSearch("");
        setSkillSearch("");
    };

    const applyFilters = () => {
        fetchAllResumes(selectedSkillIds, selectedSchools, search);
        setIsFilterOpen(false);
    };

    const filteredSkillsToShow = allDbSkills.filter(s =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    );

    if (loading && resumes.length === 0) return <div className={styles.loader}>Загрузка резюме...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;

    return (
        <main className={styles.mainContainer}>

            {/* ===== SEARCH BAR ===== */}
            <div className={styles.searchContainer}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Поиск по автору или названию резюме..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                <button className={styles.filterButton} onClick={() => setIsFilterOpen(true)}>
                    <span className={styles.filterIcon}>≡</span>
                    Фильтры ({selectedSkillIds.length + selectedSchools.length})
                </button>
            </div>

            {/* ===== ✨ РЕКОМЕНДУЕМЫЕ КАНДИДАТЫ ===== */}
            {recommendedUsers.length > 0 && (
                <section className={styles.recommendationsSection}>
                    <h2 className={styles.sectionTitle}>✨ Студенты со схожим стэком технологий</h2>
                    <div className={styles.projectsGrid}>
                        {recommendedUsers.map((user) => (
                            <div key={`rec-user-${user.userIdDto}`} className={`${styles.projectCard} ${styles.recommendedCard}`}>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.projectTitle}>
                                        {user.lastNameDto} {user.firstNameDto}
                                    </h3>
                                    <span className={styles.category}>
                                        {user.school || "Школа не указана"}
                                    </span>
                                    <p className={styles.description} style={{marginBottom: '10px'}}>
                                        {user.emailDto}
                                    </p>
                                    <div className={styles.projectSkillsTags}>
                                        {user.skills?.map(s => (
                                            <span key={s.id} className={styles.miniSkillTag}>{s.name}</span>
                                        ))}
                                    </div>
                                    <div className={styles.cardActions} style={{marginTop: '15px'}}>
                                        <Link href={`/profile/${user.userIdDto}`} className={styles.membersBtn} style={{textAlign: 'center', width: '100%'}}>
                                            Профиль
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ===== MODAL (Фильтры) ===== */}
            {isFilterOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.filterModal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Фильтровать резюме</h2>
                            <button className={styles.closeBtn} onClick={() => setIsFilterOpen(false)}>✕</button>
                        </div>

                        <div className={styles.filterContent}>
                            <div className={styles.filterColumn}>
                                <h3>Навыки из Базы Данных</h3>
                                <input
                                    type="text"
                                    placeholder="Найти навык..."
                                    className={styles.miniSearch}
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                />
                                <div className={styles.skillsScrollArea}>
                                    <div className={styles.skillsGrid}>
                                        {filteredSkillsToShow.map((skill) => (
                                            <label key={skill.id} className={styles.checkboxContainer}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSkillIds.includes(skill.id)}
                                                    onChange={() => toggleSkill(skill.id)}
                                                />
                                                <span className={styles.checkmark}></span>
                                                <span className={styles.skillLabel}>{skill.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.filterColumn}>
                                <h3>Школа</h3>
                                <div className={styles.scrollArea}>
                                    {schoolsList.map((item) => (
                                        <label key={item} className={styles.checkboxContainer}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSchools.includes(item)}
                                                onChange={() => toggleSchool(item)}
                                            />
                                            <span className={styles.checkmark}></span>
                                            {item}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.applyBtn} onClick={applyFilters}>Применить</button>
                            <button className={styles.clearBtn} onClick={clearFilters}>Очистить все</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 🔥 СЕТКА РЕЗЮМЕ (ВМЕСТО ЮЗЕРОВ) ===== */}
            <h2 className={styles.sectionTitle} style={{marginTop: '40px'}}>Все доступные резюме</h2>
            <div className={styles.projectsGrid}>
                {resumes.length > 0 ? (
                    resumes.map((resume) => (
                        <div key={resume.id} className={styles.projectCard}>
                            <div className={styles.cardContent}>
                                {/* Показываем название резюме, если оно есть, иначе имя автора */}
                                <h3 className={styles.projectTitle}>
                                    {resume.title || "Резюме без названия"}
                                </h3>

                                <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#555', marginBottom: '5px' }}>
                                    Автор: {resume.userDto ? `${resume.userDto.lastNameDto} ${resume.userDto.firstNameDto}` : "Не указан"}
                                </p>

                                <span className={styles.category}>
                                    {resume.userDto?.school || "Школа не указана"}
                                </span>

                                {/* Отображаем краткое описание или контент из резюме */}
                                <p className={styles.description}>
                                    {resume.content || "Описание отсутствует"}
                                </p>

                                <div className={styles.projectSkillsTags}>
                                    {resume.skills && resume.skills.length > 0 ? (
                                        resume.skills.map(s => (
                                            <span key={s.id} className={styles.miniSkillTag}>{s.name}</span>
                                        ))
                                    ) : (
                                        <span style={{fontSize: '0.8rem', color: '#999'}}>Стэк не указан</span>
                                    )}
                                </div>

                                <div className={styles.cardActions}>
                                    {/* Ссылка на профиль автора этого резюме */}
                                    <Link href={`/profile/${resume.userDto?.userIdDto}`} className={styles.membersBtn}
                                          style={{textAlign: 'center', width: '100%'}}>
                                        Профиль автора
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noResults}>Резюме не найдены</div>
                )}
            </div>
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