"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from "../../../context/AuthContext";

export default function CreateProjectPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Основная форма проекта (Поле skills убрано отсюда, так как оно управляется отдельным стейтом)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'OPEN'
    });

    // Состояния для динамических скиллов из БД
    const [availableSkills, setAvailableSkills] = useState([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(true);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const MAX_CHARACTERS = 3000;

    // Загружаем актуальный список скиллов из PostgreSQL при старте страницы
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
                    console.error("Не удалось загрузить скиллы с бэкенда");
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
        if (name === 'description' && value.length > MAX_CHARACTERS) return;
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

        // Проверка авторизации
        if (!user?.userId) {
            alert("Ошибка: вы не авторизованы");
            return;
        }

        const projectToSave = {
            ...formData,
            ownerId: user.userId,
            ownerName: user.name,
            skills: selectedSkills
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
            console.error("Ошибка отправки проекта:", error);
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Создать новый проект</h1>
                <p className={styles.authorInfo}>Автор: <strong>{user?.name || "Загрузка..."}</strong></p>
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
                    <label>Технологический стэк проекта</label>

                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Кликните для выбора или начните вводить..."
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