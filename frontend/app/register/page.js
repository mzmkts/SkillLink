"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css'; // Используем общие стили

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstNameDto: '',
        lastNameDto: '',
        emailDto: '',
        passwordDto: '',
        school: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Регистрация успешна!");
                router.push('/login');
            } else {
                const message = await response.text();
                setError(message || 'Ошибка регистрации');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        }
    };

    return (
        <div className={styles.authOverlay}>
            <div className={styles.authModal}>
                <Link href="/" className={styles.closeBtn}>✕</Link>
                <h2 className={styles.authTitle}>Регистрация</h2>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <form className={styles.authForm} onSubmit={handleRegister}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Имя</label>
                            <input
                                type="text"
                                placeholder="Имя"
                                onChange={(e) => setFormData({...formData, firstNameDto: e.target.value})}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Фамилия</label>
                            <input
                                type="text"
                                placeholder="Фамилия"
                                onChange={(e) => setFormData({...formData, lastNameDto: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Школа (Факультет)</label>
                        <div className={styles.selectWrapper}>
                            <select
                                className={styles.authSelect}
                                value={formData.school}
                                onChange={(e) => setFormData({...formData, school: e.target.value})}
                                required
                            >
                                {/* Вместо 'selected', просто делаем эту опцию пустой и заблокированной */}
                                <option value="" disabled>Выберите школу</option>
                                <option value="Школа цифровых технологий">Школа цифровых технологий</option>
                                <option value="Школа экономики и менеджмента">Школа экономики и менеджмента</option>
                                <option value="Narxoz Business School">Narxoz Business School</option>
                                <option value="Гуманитарная школа">Гуманитарная школа</option>
                                <option value="Школа права и государственного управления">Школа права и государственного управления</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="somemail@mail.com"
                            onChange={(e) => setFormData({...formData, emailDto: e.target.value})}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            onChange={(e) => setFormData({...formData, passwordDto: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>Зарегистрироваться</button>
                </form>

                <Link href="/login" className={styles.switchAuth}>
                    У меня уже есть аккаунт
                </Link>
            </div>
        </div>
    );
}