"use client";
import {usePathname} from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';
import {AuthProvider} from "../context/AuthContext.js";

export default function RootLayout({children}) {
    const pathname = usePathname();

    // Список страниц, на которых НЕ должно быть футера
    const noFooterPages = ['/login', '/register'];
    const showFooter = !noFooterPages.includes(pathname);

    return (
        <html lang="ru">
        <body>
        <AuthProvider>
            <Navbar/>
            {children}
            {showFooter && <Footer/>}
        </AuthProvider>
        </body>
        </html>
    );
}