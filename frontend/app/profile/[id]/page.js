"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function UserProfile({ params }) {
    const [userData, setUserData] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    const targetUserId = params.id;

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem("token");
                // Токен все еще нужен для заголовка Authorization, если бэкенд защищен
                const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

                // 1. Загружаем данные КОНКРЕТНОГО пользователя по ID из URL
                const userRes = await fetch(`http://localhost:8080/api/user/${targetUserId}`, { headers });
                if (!userRes.ok) throw new Error("User not found");
                const userJson = await userRes.json();
                setUserData(userJson);

                // 2. Загружаем резюме этого пользователя
                const resumeRes = await fetch(`http://localhost:8080/api/resumes/user/${targetUserId}`, { headers });
                if (resumeRes.ok) {
                    const resumeJson = await resumeRes.json();
                    setResumes(resumeJson);
                }

            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
            } finally {
                setLoading(false);
            }
        };

        if (targetUserId) fetchAllData();
    }, [targetUserId]);

    if (loading) return <div className={styles.loader}>Загрузка профиля...</div>;
    if (!userData) return <div className={styles.error}>Пользователь не найден</div>;

    // Проверяем, мой ли это профиль, чтобы скрыть кнопку редактирования
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    let isMyProfile = false;
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        isMyProfile = payload.userId.toString() === targetUserId.toString();
    }

    return (
        <main className={styles.container}>
            <div className={styles.profileCard}>
                <header className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarCircle}>
                            {userData.lastNameDto?.[0]}{userData.firstNameDto?.[0]}
                        </div>
                        {/* Показываем карандаш только если профиль наш */}
                        {isMyProfile && <button className={styles.editIcon}>✎</button>}
                    </div>

                    <div className={styles.mainInfo}>
                        <h1 className={styles.fullName}>
                            {userData.lastNameDto} {userData.firstNameDto}
                        </h1>
                        <p className={styles.schoolTag}>{userData.school || "Школа не указана"}</p>

                        <div className={styles.skillsContainer}>
                            {userData.skills?.map((skill, index) => (
                                <span key={index} className={styles.skillBadge}>{skill}</span>
                            ))}
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    <h3 className={styles.sectionTitle}>Резюме</h3>
                    {resumes.length > 0 ? (
                        resumes.map((resume) => (
                            <div key={resume.id} className={styles.resumeBox}>
                                <h4 className={styles.resumeTitle}>{resume.title}</h4>
                                <p className={styles.resumeText}>{resume.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyBox}>
                            <p>Резюме ещё не добавлено.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}