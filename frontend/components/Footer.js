import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.content}>
                    <p className={styles.copyright}>
                        © 2026 SkillLink — сервис для создания, поиска команды.
                    </p>
                    <div className={styles.links}>
                        <a href="/contacts" className={styles.link}>Контактная информация</a>
                        <a href="/privacy" className={styles.link}>Политика конфиденциальности</a>
                        <a href="/terms" className={styles.link}>Пользовательское соглашение</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}