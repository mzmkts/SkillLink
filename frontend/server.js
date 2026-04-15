const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Явные маршруты для страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.listen(PORT, () => {
    console.log(`Фронтенд сервер запущен на http://localhost:${PORT}`);
    console.log(`Ожидается, что бэкенд работает на http://localhost:8080`);
});