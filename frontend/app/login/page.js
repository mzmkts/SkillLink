"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const token = await response.text();

                login(token); // 🔥 главный момент

                router.push("/");
            } else {
                const message = await response.text();
                setError(message || "Ошибка входа");
            }
        } catch (err) {
            setError("Ошибка сервера");
        }
    };

    return (
        <div className={styles.authOverlay}>
            <div className={styles.authModal}>
                <Link href="/" className={styles.closeBtn}>✕</Link>
                <h2 className={styles.authTitle}>Вход в аккаунт</h2>

                {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}

                <form className={styles.authForm} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="somemail@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label>Пароль</label>
                            <span className={styles.forgotPass}>Я забыл пароль</span>
                        </div>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>Войти</button>
                </form>

                <Link href="/register" className={styles.switchAuth}>
                    У меня еще нет аккаунта
                </Link>
            </div>
        </div>
    );
}