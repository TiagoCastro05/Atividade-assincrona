const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch'); // Instala: npm install node-fetch



dotenv.config();

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SECRET || "12345";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

let db;
let usersCollection;
let historyCollection;

// Middleware de autenticação
function estaAutenticado(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Rota de registo de utilizador
app.get('/register', (req, res) => {
    res.render('register'); // Cria views/register.ejs
});

app.post('/register', async (req, res) => {
    const { username, password, nick, color } = req.body;
    if (!username || !password) {
        return res.send('Preenche todos os campos!');
    }
    const userExists = await usersCollection.findOne({ username });
    if (userExists) {
        return res.send('Utilizador já existe!');
    }
    const hash = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ username, password: hash, nick, color });
    res.redirect('/login.html');
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user.username;
        req.session.nick = user.nick;
        req.session.color = user.color;
        res.redirect('/protected');
    } else {
        res.redirect('/login.html');
    }
});

// Página protegida
app.get('/protected', estaAutenticado, async (req, res) => {
    const history = await historyCollection.find({ username: req.session.user }).toArray();
    res.render('viewprotected', { 
        nick: req.session.nick, 
        color: req.session.color, 
        history // <-- esta linha garante que a variável é passada para a view
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})


// Pesquisa (Mashup de APIs)
app.get('/search', estaAutenticado, (req, res) => {
    res.render('search'); // Cria views/search.ejs
});

app.post('/search', estaAutenticado, async (req, res) => {
    const { termo } = req.body;

    // Exemplo: OpenWeatherMap + Wikipedia
    const weatherKey = process.env.OPENWEATHER_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(termo)}&appid=${weatherKey}&units=metric&lang=pt`;
    const wikiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`;

    let weatherData = {};
    let wikiData = {};

    try {
        const weatherResp = await fetch(weatherUrl);
        weatherData = await weatherResp.json();

        const wikiResp = await fetch(wikiUrl);
        wikiData = await wikiResp.json();

        // Guarda histórico
        await historyCollection.insertOne({
            username: req.session.user,
            termo,
            data: new Date(),
            weather: weatherData.weather ? weatherData.weather[0].description : 'N/A',
            wiki: wikiData.extract || 'N/A'
        });

        res.render('result', { termo, weather: weatherData, wiki: wikiData });
    } catch (err) {
        res.send('Erro ao obter dados das APIs.');
    }
});

// Liga à base de dados e inicia servidor
async function startServer() {
    try {
        const client = new MongoClient(process.env.MONGOURL);
        await client.connect();

        db = client.db('UsersDB');
        usersCollection = db.collection('Users');
        historyCollection = db.collection('History');

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
    }
}

startServer();