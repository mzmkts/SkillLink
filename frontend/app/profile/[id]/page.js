"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function UserProfile({ params }) {
    const [userData, setUserData] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstNameDto: "",
        lastNameDto: "",
        school: "",
        about: ""
    });

    const [isMyProfile, setIsMyProfile] = useState(false);
    const targetUserId = params.id;

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setIsMyProfile(payload.userId.toString() === targetUserId.toString());
                    } catch (e) {
                        console.error("Ошибка декодирования JWT", e);
                    }
                }

                const userRes = await fetch(`http://localhost:8080/api/user/${targetUserId}`, { headers });
                if (!userRes.ok) throw new Error("Пользователь не найден");
                const userJson = await userRes.json();

                setUserData(userJson);
                setEditForm({
                    firstNameDto: userJson.firstNameDto || "",
                    lastNameDto: userJson.lastNameDto || "",
                    school: userJson.school || "",
                    about: userJson.about || ""
                });

                const [resumesRes, projectsRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/resumes/user/${targetUserId}`, { headers }),
                    fetch(`http://localhost:8080/api/projects/user/${targetUserId}`, { headers })
                ]);

                if (resumesRes.ok) setResumes(await resumesRes.json());
                if (projectsRes.ok) setProjects(await projectsRes.json());

            } catch (err) {
                console.error("Ошибка загрузки:", err);
            } finally {
                setLoading(false);
            }
        };
        if (targetUserId) fetchAllData();
    }, [targetUserId]);

    const handleSaveUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Ошибка: вы не авторизованы!");
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const updateInfo = await fetch(`http://localhost:8080/api/user/${targetUserId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    firstNameDto: editForm.firstNameDto,
                    lastNameDto: editForm.lastNameDto,
                    school: editForm.school,
                    about: editForm.about
                })
            });

            if (updateInfo.ok) {
                setUserData({ ...userData, ...editForm });
                setIsEditing(false);
                alert("Данные успешно сохранены!");
            } else {
                alert(`Ошибка сохранения. Проверьте права доступа.`);
            }
        } catch (err) {
            alert("Произошла ошибка при отправке данных");
        }
    };

    if (loading) return <div className={styles.loader}>Загрузка...</div>;
    if (!userData) return <div className={styles.error}>Пользователь не найден</div>;

    return (
        <main className={styles.container}>
            <div className={styles.profileCard}>
                <header className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarCircle}>
                            {(userData.lastNameDto?.[0] || "")}{(userData.firstNameDto?.[0] || "")}
                        </div>
                        {isMyProfile && (
                            <button className={styles.editIcon} onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? "✖" : "✎"}
                            </button>
                        )}
                    </div>

                    <div className={styles.mainInfo}>
                        {isEditing ? (
                            <div className={styles.editFields}>
                                <div className={styles.rowInputs}>
                                    <input
                                        className={styles.input}
                                        value={editForm.firstNameDto}
                                        onChange={e => setEditForm({...editForm, firstNameDto: e.target.value})}
                                        placeholder="Имя"
                                    />
                                    <input
                                        className={styles.input}
                                        value={editForm.lastNameDto}
                                        onChange={e => setEditForm({...editForm, lastNameDto: e.target.value})}
                                        placeholder="Фамилия"
                                    />
                                </div>

                                <select
                                    className={styles.input}
                                    value={editForm.school}
                                    onChange={e => setEditForm({...editForm, school: e.target.value})}
                                >
                                    <option value="" disabled>Выберите школу</option>
                                    <option value="Школа цифровых технологий">Школа цифровых технологий</option>
                                    <option value="Школа экономики и менеджмента">Школа экономики и менеджмента</option>
                                    <option value="Narxoz Business School">Narxoz Business School</option>
                                    <option value="Гуманитарная школа">Гуманитарная школа</option>
                                    <option value="Школа права и государственного управления">Школа права и государственного управления</option>
                                </select>

                                <div className={styles.aboutSection}>
                                    <label className={styles.label}>О себе</label>
                                    <textarea
                                        className={styles.inputTextarea}
                                        value={editForm.about}
                                        onChange={e => setEditForm({...editForm, about: e.target.value})}
                                        placeholder="Расскажите о себе, ваших интересах и целях..."
                                    />
                                </div>

                                <button className={styles.saveBtn} onClick={handleSaveUser}>Сохранить изменения</button>
                            </div>
                        ) : (
                            <>
                                <h1 className={styles.fullName}>{userData.lastNameDto} {userData.firstNameDto}</h1>
                                <p className={styles.schoolTag}>{userData.school || "Школа не указана"}</p>

                                {userData.about && (
                                    <p className={styles.aboutTextDisplay}>{userData.about}</p>
                                )}
                            </>
                        )}
                    </div>
                </header>

                <div className={styles.content}>
                    {/* СЕКЦИЯ РЕЗЮМЕ С КНОПКОЙ ОТКРЫТЬ */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Резюме</h3>
                        {resumes.length > 0 ? resumes.map(r => (
                            <div key={`resume-${r.id}`} className={styles.projectWideRow}>
                                <h4 className={styles.projectTitleWide}>{r.title}</h4>
                                <Link href={`/resumes/${r.id}`} className={styles.membersBtn}>Открыть</Link>
                            </div>
                        )) : <p className={styles.helpText}>Резюме пока нет</p>}
                    </section>

                    {/* СЕКЦИЯ ПРОЕКТОВ */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Проекты</h3>
                        {projects.length > 0 ? projects.map(p => (
                            <div key={`project-${p.id}`} className={styles.projectWideRow}>
                                <h4 className={styles.projectTitleWide}>{p.title}</h4>
                                <Link href={`/projects/${p.id}`} className={styles.membersBtn}>Открыть</Link>
                            </div>
                        )) : <p className={styles.helpText}>Проектов пока нет</p>}
                    </section>
                </div>
            </div>
        </main>
    );
}