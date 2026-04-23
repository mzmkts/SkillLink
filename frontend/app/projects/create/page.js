"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CreateProjectPage() {
    const router = useRouter();
    const [userData, setUserData] = useState({ id: null, name: '' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'OPEN'
    });

    const MAX_CHARACTERS = 3000;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserData({
                    id: payload.userId,
                    name: payload.name || payload.sub
                });
            } catch (e) {
                console.error("Ошибка декодирования токена", e);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Ограничиваем ввод, если это описание
        if (name === 'description' && value.length > MAX_CHARACTERS) return;

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const projectToSave = {
            ...formData,
            ownerId: userData.id,
            ownerName: userData.name
        };

        try {
            const response = await fetch(`http://localhost:8080/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(projectToSave),
            });

            if (response.ok) {
                alert("Проект успешно создан!");
                router.push('/projects');
            } else {
                alert("Ошибка при создании проекта");
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Создать новый проект</h1>
                <p className={styles.authorInfo}>Автор: <strong>{userData.name}</strong></p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label>Название проекта</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Например: Платформа для поиска менторов"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Текущий статус</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="OPEN">🟢 OPEN (Ищем команду)</option>
                        <option value="IN_PROGRESS">🟡 IN PROGRESS (В разработке)</option>
                        <option value="CLOSED">🔴 CLOSED (Завершен)</option>
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Описание проекта</label>
                        <span className={`${styles.charCount} ${formData.description.length >= MAX_CHARACTERS ? styles.limitReached : ''}`}>
                            {formData.description.length} / {MAX_CHARACTERS}
                        </span>
                    </div>
                    <textarea
                        name="description"
                        rows="10"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Расскажите о целях проекта, технологиях и кого вы ищете..."
                        required
                    ></textarea>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn}>Опубликовать проект</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>Отмена</button>
                </div>
            </form>
        </main>
    );
}