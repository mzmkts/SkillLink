"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProjectDetailPage({ params }) {
    const router = useRouter();
    const projectId = params.id;

    const [project, setProject] = useState(null);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/projects/${projectId}`);
                if (!res.ok) throw new Error("Проект не найден");
                const projectData = await res.json();
                setProject(projectData);

                if (projectData.ownerId) {
                    const userRes = await fetch(`http://localhost:8080/api/user/${projectData.ownerId}`);
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setOwner(userData);
                    }
                }
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchProjectData();
    }, [projectId]);

    // 🔥 ФУНКЦИЯ ПОДАЧИ ЗАЯВКИ
    const handleApply = async () => {
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
            console.error(err);
            alert("Произошла ошибка при отправке");
        }
    };

    if (loading) return <div className={styles.loader}>Загрузка...</div>;
    if (!project) return <div className={styles.error}>Проект не найден</div>;

    return (
        <main className={styles.container}>
            <button className={styles.backBtn} onClick={() => router.back()}>← Назад</button>

            <div className={styles.projectWrapper}>
                <header className={styles.header}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.projectTitle}>{project.title}</h1>
                        <span className={styles.statusBadge}>{project.status}</span>
                    </div>
                    <p className={styles.ownerInfo}>
                        Создатель: <strong>
                        {owner ? `${owner.lastNameDto} ${owner.firstNameDto}` : project.ownerName}
                    </strong>
                    </p>
                </header>

                <div className={styles.contentGrid}>
                    <section className={styles.mainContent}>
                        <h3 className={styles.sectionTitle}>Описание</h3>
                        <p className={styles.descriptionText}>{project.description}</p>
                    </section>

                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sectionTitle}>Команда</h3>
                            <p className={styles.noMembers}>Мест много — записывайся!</p>
                            {/* 🔥 КНОПКА ТЕПЕРЬ РАБОТАЕТ */}
                            <button className={styles.applyBtnLarge} onClick={handleApply}>
                                Стать участником
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}