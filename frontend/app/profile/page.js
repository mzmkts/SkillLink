"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token");

                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;
                const headers = { 'Authorization': 'Bearer ' + token };

                const userRes = await fetch(`http://localhost:8080/api/user/${userId}`, { headers });
                const userJson = await userRes.json();
                setUserData(userJson);

                const resumeRes = await fetch(`http://localhost:8080/api/resumes/user/${userId}`, { headers });
                const resumeJson = await resumeRes.json();
                setResumes(resumeJson);

            } catch (err) {
                console.error("Ошибка загрузки:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <div className={styles.loader}>Загрузка профиля...</div>;
    if (!userData) return <div className={styles.error}>Пользователь не найден</div>;

    return (
        <main className={styles.container}>
            <div className={styles.profileCard}>
                {/* ВЕРХНЯЯ ЧАСТЬ: Аватар и Основная информация */}
                <header className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarCircle}>
                            {userData.lastNameDto?.[0]}{userData.firstNameDto?.[0]}
                        </div>
                        <button className={styles.editIcon}>✎</button>
                    </div>

                    <div className={styles.mainInfo}>
                        {/* 🔥 ФАМИЛИЯ ИМЯ */}
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