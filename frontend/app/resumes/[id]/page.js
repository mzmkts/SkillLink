"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ResumeDetail({ params }) {
    const router = useRouter();
    const resumeId = params.id;

    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🔥 Стейт для ID авторизованного пользователя
    const [currentUserId, setCurrentUserId] = useState(null);

    // Стейты для редактирования полей резюме
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Стейты для работы со скиллами
    const [allAvailableSkills, setAllAvailableSkills] = useState([]);
    const [selectedSkillIds, setSelectedSkillIds] = useState([]);

    useEffect(() => {
        const fetchResumeAndSkills = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                // Извлекаем ID текущего пользователя из JWT токена
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        // В зависимости от того, как зашит id в твоем токене (id или userId)
                        setCurrentUserId(payload.userId || payload.id);
                    } catch (e) {
                        console.error("Ошибка декодирования JWT токена:", e);
                    }
                }

                // 1. Загружаем данные резюме
                const resumeRes = await fetch(`http://localhost:8080/api/resumes/${resumeId}`, { headers });
                if (!resumeRes.ok) throw new Error("Не удалось загрузить данные резюме");
                const resumeData = await resumeRes.json();

                setResume(resumeData);
                setEditTitle(resumeData.title || "");
                setEditContent(resumeData.content || "");

                const currentSkillIds = resumeData.skills ? resumeData.skills.map(s => s.id) : [];
                setSelectedSkillIds(currentSkillIds);

                // 2. Загружаем все существующие скиллы из БД
                const skillsRes = await fetch(`http://localhost:8080/api/skills`, { headers });
                if (skillsRes.ok) {
                    const skillsData = await skillsRes.json();
                    setAllAvailableSkills(skillsData);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (resumeId) fetchResumeAndSkills();
    }, [resumeId]);

    // Вычисляем ID автора резюме на основе структуры твоего бэкенда
    const author = resume?.userDto || resume?.user;
    const authorId = resume?.userDto?.userIdDto || resume?.userDto?.id || resume?.user?.userId || resume?.user?.id;

    // 🔥 Проверка: является ли текущий пользователь автором резюме?
    const isOwner = currentUserId && authorId && currentUserId.toString() === authorId.toString();

    const toggleSkillSelection = (skillId) => {
        if (!isOwner) return; // Защита
        if (selectedSkillIds.includes(skillId)) {
            setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
        } else {
            setSelectedSkillIds([...selectedSkillIds, skillId]);
        }
    };

    // Функция сохранения изменений
    const handleSave = async () => {
        if (!isOwner) {
            alert("У вас нет прав на редактирование этого резюме!");
            return;
        }

        if (!editTitle.trim() || !editContent.trim()) {
            alert("Поля не могут быть пустыми");
            return;
        }

        setSaveLoading(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const skillsToSave = selectedSkillIds.map(id => {
                const found = allAvailableSkills.find(s => s.id === id);
                return found ? { id: found.id, name: found.name } : { id };
            });

            const res = await fetch(`http://localhost:8080/api/resumes/${resumeId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    title: editTitle,
                    content: editContent,
                    skills: skillsToSave
                })
            });

            if (!res.ok) throw new Error("Не удалось сохранить изменения");

            const updatedRes = await fetch(`http://localhost:8080/api/resumes/${resumeId}`, { headers });
            const updatedData = await updatedRes.json();

            setResume(updatedData);
            setIsEditing(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaveLoading(false);
        }
    };

    // Функция удаления
    const handleDelete = async () => {
        if (!isOwner) {
            alert("У вас нет прав на удаление этого резюме!");
            return;
        }

        const isConfirmed = window.confirm("Вы уверены, что хотите навсегда удалить это резюме?");
        if (!isConfirmed) return;

        setDeleteLoading(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`http://localhost:8080/api/resumes/${resumeId}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!res.ok) throw new Error("Не удалось удалить резюме");

            alert("Резюме успешно удалено!");

            if (authorId) {
                router.push(`/profile/${authorId}`);
            } else {
                router.push('/profile');
            }

        } catch (err) {
            alert(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancel = () => {
        setEditTitle(resume.title || "");
        setEditContent(resume.content || "");
        setSelectedSkillIds(resume.skills ? resume.skills.map(s => s.id) : []);
        setIsEditing(false);
    };

    if (loading) return <div className={styles.loader}>Загрузка резюме...</div>;
    if (error) return <div className={styles.errorContainer}>Ошибка: {error}</div>;
    if (!resume) return <div className={styles.errorContainer}>Резюме не найдено</div>;

    return (
        <main className={styles.container}>
            <div className={styles.resumeCard}>
                <div className={styles.topActions}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        ← Назад
                    </button>

                    {/* 🔥 Кнопки «Редактировать» и «Удалить» показываются ТОЛЬКО владельцу (isOwner) */}
                    {!isEditing && isOwner && (
                        <div className={styles.managementButtons}>
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                Редактировать
                            </button>
                            <button
                                className={styles.deleteBtn}
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? "Удаление..." : "Удалить"}
                            </button>
                        </div>
                    )}
                </div>

                <header className={styles.header}>
                    {isEditing ? (
                        <div className={styles.editInputGroup}>
                            <label className={styles.inputLabel}>Название резюме</label>
                            <input
                                type="text"
                                className={styles.editInput}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                    ) : (
                        <h1 className={styles.title}>{resume.title || "Без названия"}</h1>
                    )}

                    {author && (author.lastNameDto || author.firstNameDto) ? (
                        <p className={styles.author}>
                            Автор: <span>{author.lastNameDto || ""} {author.firstNameDto || ""}</span>
                        </p>
                    ) : author && (author.lastName || author.firstName) ? (
                        <p className={styles.author}>
                            Автор: <span>{author.lastName || ""} {author.firstName || ""}</span>
                        </p>
                    ) : (
                        <p className={styles.author}>Автор не указан</p>
                    )}
                </header>

                <div className={styles.skillsSection}>
                    <h3 className={styles.sectionLabel}>Профессиональные навыки (Стэк)</h3>

                    {isEditing ? (
                        <div className={styles.skillsSelectorContainer}>
                            <p className={styles.selectorHelpText}>Выберите технологии, используемые в этом резюме:</p>
                            <div className={styles.skillsGrid}>
                                {allAvailableSkills.map((skill) => {
                                    const isSelected = selectedSkillIds.includes(skill.id);
                                    return (
                                        <button
                                            key={`skill-choice-${skill.id}`}
                                            type="button"
                                            className={`${styles.skillChoiceBtn} ${isSelected ? styles.skillSelected : ''}`}
                                            onClick={() => toggleSkillSelection(skill.id)}
                                        >
                                            {skill.name} {isSelected ? '✓' : '+'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.skillsList}>
                            {resume.skills && resume.skills.length > 0 ? (
                                resume.skills.map((s) => (
                                    <span key={`resume-skill-${s.id}`} className={styles.skillTagView}>
                                        {s.name}
                                    </span>
                                ))
                            ) : (
                                <span className={styles.helpText}>Стэк технологий не указан</span>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.contentSection}>
                    <h3 className={styles.sectionLabel}>Содержимое резюме</h3>

                    {isEditing ? (
                        <div className={styles.editInputGroup}>
                            <textarea
                                className={styles.editTextarea}
                                rows="10"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className={styles.bodyText}>
                            {resume.content || "Содержимое пустое"}
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className={styles.editActions}>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={saveLoading}
                        >
                            {saveLoading ? "Сохранение..." : "Сохранить"}
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={handleCancel}
                            disabled={saveLoading}
                        >
                            Отмена
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}