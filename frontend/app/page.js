"use client";
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
// import Image from 'next/image'; // Не используем, так как изображение будет фоном CSS

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Проверяем наличие токена
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <main className={styles.main}>
            {/* Навигация (предполагаем, что она у вас в Layout, если нет — добавьте сюда) */}

            {/* ОБНОВЛЕННАЯ СЕКЦИЯ HERO */}
            <section className={styles.heroWrapper}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Все актуальные проекты!</h1>
                    <p className={styles.heroSub}>Стань частью чего-то большего</p>

                    {/* Условный рендеринг кнопки */}
                    {isLoggedIn ? (
                        <Link href="/projects">
                            <button className={styles.mainBtn}>Проекты</button>
                        </Link>
                    ) : (
                        <Link href="/register">
                            <button className={styles.mainBtn}>Зарегистрироваться</button>
                        </Link>
                    )}
                </div>
                {/* Фоновое изображение задается через CSS класс .heroWrapper */}
            </section>

            <div className={styles.container}>
                {/* Бренды компаний */}
                <div className={styles.brandGrid}>
                    {['KASPI', 'NARXOZ', 'Choco', 'Halyk', 'Freedom', 'Astana M'].map(brand => (
                        <div key={brand} className={styles.brandItem}>
                            <strong>{brand}</strong>
                            <span>24 участника</span>
                        </div>
                    ))}
                </div>

                <section className={styles.howToSection}>
                    <h2 className={styles.sectionTitle}>Как объединиться в команду</h2>
                    <div className={styles.stepsGrid}>
                        {[
                            {
                                num: "Шаг 1",
                                title: "Найдите людей с похожими целями",
                                text: "Соберите команду из тех, кто:\n• заинтересован в теме\n• хочет реально работать\n• имеет хотя бы базовые навыки"
                            },
                            {
                                num: "Шаг 2",
                                title: "Познакомьтесь и обсудите ожидания",
                                text: "Каждый должен сказать:\n• что он умеет\n• сколько времени готов тратить\n• чего хочет от проекта"
                            },
                            {
                                num: "Шаг 3",
                                title: "Выберите лидера",
                                text: "Нужен человек, который:\n• организует процесс\n• следит за дедлайнами\n• решает конфликты"
                            },
                            {
                                num: "Шаг 4",
                                title: "Определите общую цель",
                                text: "Вместе решите:\n• что именно вы делаете\n• какой результат нужен"
                            },
                            {
                                num: "Шаг 5",
                                title: "Распределите роли",
                                text: "Каждому — конкретная задача:\n• кто делает дизайн\n• кто кодит\n• кто делает презентацию"
                            },
                            {
                                num: "Шаг 6",
                                title: "Настройте общение",
                                text: "Договоритесь:\n• где общаетесь (Telegram, WhatsApp)\n• как часто созвоны / встречи\n• как контролируете прогресс"
                            },
                        ].map((step, idx) => (
                            <div key={idx} className={styles.stepCard}>
                                <h4 className={styles.stepNum}>{step.num}</h4>
                                <p className={styles.stepSubTitle}>{step.title}</p>
                                <p className={styles.stepText}>{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}