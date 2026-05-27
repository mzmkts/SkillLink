"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from "../../../context/AuthContext";

export default function CreateResumePage() {
    const router = useRouter();
    const { user } = useAuth();

    // Основная форма
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });

    // Состояния для поиска и выбора технологий
    const [availableSkills, setAvailableSkills] = useState([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(true);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Достаем userId из токена в безопасном для SSR режиме
    let userId = null;
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userId = payload.userId;
            } catch (e) {
                console.error("Ошибка парсинга токена:", e);
            }
        }
    }

    // Загружаем список технологий при старте
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/skills', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableSkills(data);
                } else {
                    console.error("Не удалось загрузить скиллы");
                }
            } catch (error) {
                console.error("Ошибка при получении списка скиллов:", error);
            } finally {
                setIsLoadingSkills(false);
            }
        };

        fetchSkills();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillToggle = (skill) => {
        const isAlreadyAdded = selectedSkills.some(s => s.id === skill.id);
        if (isAlreadyAdded) {
            setSelectedSkills(prev => prev.filter(s => s.id !== skill.id));
        } else {
            setSelectedSkills(prev => [...prev, skill]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert("Ошибка: пользователь не авторизован или токен не найден");
            return;
        }

        const resumeToSave = {
            ...formData,
            skills: selectedSkills.map(s => ({
                id: s.id,
                name: s.name
            }))
        };

        try {
            const response = await fetch(`http://localhost:8080/api/resumes/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(resumeToSave),
            });

            if (response.ok) {
                alert("Резюме успешно создано!");
                router.push('/projects');
            } else {
                alert("Ошибка при сохранении резюме");
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
                    <label>Ваш технологический стэк (навыки)</label>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Кликните для выбора навыков или начните вводить..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => {
                                setTimeout(() => setIsDropdownOpen(false), 200);
                            }}
                            className={styles.searchInput}
                            disabled={isLoadingSkills}
                        />

                        {isDropdownOpen && (
                            <div className={styles.dropdown}>
                                {availableSkills
                                    .filter(skill =>
                                        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                        !selectedSkills.some(s => s.id === skill.id)
                                    )
                                    .map(skill => (
                                        <div
                                            key={skill.id}
                                            className={styles.dropdownItem}
                                            onClick={() => {
                                                handleSkillToggle(skill);
                                                setSearchQuery('');
                                            }}
                                        >
                                            {skill.name}
                                        </div>
                                    ))}

                                {availableSkills.filter(skill =>
                                    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                    !selectedSkills.some(s => s.id === skill.id)
                                ).length === 0 && (
                                    <div className={styles.noResults}>Ничего не найдено</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.skillsContainer} style={{ marginTop: '12px' }}>
                        {selectedSkills.map(skill => (
                            <div key={skill.id} className={styles.chosenTag}>
                                <span>{skill.name}</span>
                                <button
                                    type="button"
                                    className={styles.removeTagBtn}
                                    onClick={() => handleSkillToggle(skill)}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Основная информация (опыт работы, выполненные проекты)</label>
                    <textarea
                        name="content"
                        rows="10"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Опишите ваши ключевые достижения и опыт работы..."
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