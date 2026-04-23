"use client";
import Link from 'next/link';
import { useState } from 'react';
import styles from './Navbar.module.css';
import { useAuth } from "../context/AuthContext"; // Твой контекст

export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 🔥 Берем данные и функцию выхода из контекста
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout(); // Используем метод из контекста
        setIsDropdownOpen(false);
        window.location.href = "/";
    };

    return (
        <header className={styles.header}>
            <div className={styles.navContainer}>
                {/* Левое меню */}
                <nav className={styles.leftNav}>
                    <Link href="/projects">Проекты</Link>
                    <Link href="/resumes">Резюме</Link>
                </nav>

                {/* Центральный Логотип */}
                <Link href="/" className={styles.logo}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span>Skill Link</span>
                </Link>

                <div className={styles.rightNav}>
                    <Link href="/resumes/create" className={styles.navAction}>
                        <span className={styles.plusCircle}>+</span> Резюме
                    </Link>
                    <Link href="/projects/create" className={styles.navAction}>
                        <span className={styles.plusCircle}>+</span> Новый проект
                    </Link>

                    {/* 🔥 Теперь проверяем user из контекста */}
                    {user ? (
                        <div className={styles.userSection}>
                            <div
                                className={styles.userTrigger}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className={styles.userName}>
                                    {/* Данные в контексте уже должны быть декодированы */}
                                    {user.firstName || user.name || user.sub || "Профиль"}
                                </span>
                                <span className={styles.arrow}>{isDropdownOpen ? '▲' : '▼'}</span>
                            </div>

                            {isDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <Link
                                        href={`/profile/${user.userId || ''}`}
                                        className={styles.dropdownLink}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Профиль
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className={styles.dropdownLink}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Настройки
                                    </Link>
                                    <hr className={styles.divider}/>
                                    <button
                                        onClick={handleLogout}
                                        className={styles.logoutBtn}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <button className={styles.loginBtn}>Войти</button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}