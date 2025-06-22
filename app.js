const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));



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
    res.render('register', { message: null });
});

app.post('/register', async (req, res) => {
    const { username, password, nick, color } = req.body;
    if (!username || !password || !nick) {
        return res.render('register', { message: 'Preenche todos os campos!' });
    }
    const userExists = await usersCollection.findOne({ username });
    if (userExists) {
        return res.render('register', { message: 'Utilizador já existe!' });
    }
    const hash = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ username, password: hash, nick, color });
    res.render('register', { message: 'Conta criada com sucesso! Agora podes fazer login.' });
});

// Login
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    if (!user) {
        return res.render('login', { message: 'Utilizador não existe!' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.render('login', { message: 'Password incorreta!' });
    }
    req.session.user = user.username;
    req.session.nick = user.nick;
    req.session.color = user.color;
    res.redirect('/protected');
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
    const termo = req.body.termo;
    const weatherKey = process.env.OPENWEATHER_KEY; // mete a tua chave no .env
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(termo)}&appid=${weatherKey}&units=metric&lang=pt`;
    const wikiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`;

    let weatherData = {};
    let wikiData = {};

    try {
        // Chama as APIs externas
        const weatherResp = await fetch(weatherUrl);
        weatherData = await weatherResp.json();
        console.log("Resposta OpenWeatherMap:", weatherData); // <-- Adiciona isto

        const wikiResp = await fetch(wikiUrl);
        wikiData = await wikiResp.json();

        let weatherDescription = 'N/A';
        if (weatherData.weather && Array.isArray(weatherData.weather) && weatherData.weather[0]) {
            weatherDescription = weatherData.weather[0].description;
        } else if (weatherData.message) {
            weatherDescription = `Erro: ${weatherData.message}`;
        }
        await historyCollection.insertOne({
            username: req.session.user,
            termo,
            data: new Date(),
            weather: weatherDescription,
            wiki: wikiData.extract || 'N/A'
        });

        // Mostra o resultado ao utilizador (cria uma view result.ejs para mostrar)
        res.render('result', { termo, weather: weatherData, wiki: wikiData });
    } catch (err) {
        console.error("ERRO DETALHADO:", err, weatherData, wikiData); // <-- Adiciona isto
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
        historyCollection = db.collection('Historico');

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
    }
}

startServer();