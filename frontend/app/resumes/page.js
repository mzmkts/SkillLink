"use client";

import {useState, useEffect} from "react";
import Link from "next/link"; // Импортируем Link для переходов
import styles from "./page.module.css";

export default function ResumePage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [search, setSearch] = useState("");

    const fetchUsers = async (skills = [], schools = [], searchText = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchText) {
                const parts = searchText.split(" ");
                // Если ввели "Иванов Иван", то parts[0] - фамилия, parts[1] - имя
                // Но так как бэкенд ждет name и surname, подставляем аккуратно:
                if (parts[0]) params.append("name", parts[0]);
                if (parts[1]) params.append("surname", parts[1]);
            }

            if (skills.length > 0) params.append("skill", skills[0]);
            if (schools.length > 0) params.append("school", schools[0]);

            const response = await fetch(`http://localhost:8080/api/user?${params.toString()}`);
            if (!response.ok) throw new Error("Не удалось загрузить пользователей");

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleSkill = (item) => {
        setSelectedSkills((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const toggleSchool = (item) => {
        setSelectedSchools((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const clearFilters = () => {
        setSelectedSkills([]);
        setSelectedSchools([]);
        setSearch("");
    };

    const applyFilters = () => {
        fetchUsers(selectedSkills, selectedSchools, search);
        setIsFilterOpen(false);
    };

    if (loading) return <div className={styles.loader}>Загрузка резюме...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;

    return (
        <main className={styles.mainContainer}>

            {/* ===== SEARCH ===== */}
            <div className={styles.searchContainer}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Поиск по фамилии и имени"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                <button className={styles.filterButton} onClick={() => setIsFilterOpen(true)}>
                    <span className={styles.filterIcon}>≡</span>
                    Фильтр ({selectedSkills.length + selectedSchools.length})
                </button>
            </div>

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
                                <h3>Скилы</h3>
                                {["Java", "Spring", "Design", "Frontend", "Backend"].map((item) => (
                                    <label key={item} className={styles.checkboxContainer}>
                                        <input type="checkbox" checked={selectedSkills.includes(item)}
                                               onChange={() => toggleSkill(item)}/>
                                        <span className={styles.checkmark}></span>
                                        {item}
                                    </label>
                                ))}
                            </div>
                            <div className={styles.filterColumn}>
                                <h3>Школа</h3>
                                {["DE", "Digital Engineering", "Школа цифровых технологий"].map((item) => (
                                    <label key={item} className={styles.checkboxContainer}>
                                        <input type="checkbox" checked={selectedSchools.includes(item)}
                                               onChange={() => toggleSchool(item)}/>
                                        <span className={styles.checkmark}></span>
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.applyBtn} onClick={applyFilters}>Применить</button>
                            <button className={styles.clearBtn} onClick={clearFilters}>Очистить все</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== USERS GRID ===== */}
            <div className={styles.projectsGrid}>
                {users.map((user) => (
                    <div key={user.userIdDto} className={styles.projectCard}>
                        <div className={styles.cardContent}>
                            {/* 🔥 1) ФАМИЛИЯ ИМЯ (поменяли порядок) */}
                            <h3 className={styles.projectTitle}>
                                {user.lastNameDto} {user.firstNameDto}
                            </h3>

                            <span className={styles.category}>
                                {user.school || "No school"}
                            </span>

                            <p className={styles.description}>
                                {user.emailDto}
                            </p>

                            <div className={styles.metaInfo}>
                                <span>
                                    Skills:{" "}
                                    <strong>
                                        {user.skills?.join(", ") || "No skills"}
                                    </strong>
                                </span>
                            </div>

                            <div className={styles.cardActions}>
                                <Link href={`/profile/${user.userIdDto}`} className={styles.membersBtn}
                                      style={{textAlign: 'center', width: '100%'}}>
                                    Профиль
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}