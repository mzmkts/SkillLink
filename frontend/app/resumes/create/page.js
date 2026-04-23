"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CreateResumePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    let userId = null;

    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");

        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId;
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch(`http://localhost:8080/api/resumes/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Резюме создано!");
                router.push('/projects');
            } else {
                alert("Ошибка при сохранении");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Создание резюме</h1>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label>Название резюме (например: Frontend разработчик)</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Введите заголовок..."
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Основная информация (навыки, опыт, о себе)</label>
                    <textarea
                        name="content"
                        rows="10"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Опишите ваши навыки и опыт работы..."
                        required
                    ></textarea>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn}>Сохранить резюме</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>Отмена</button>
                </div>
            </form>
        </main>
    );
}