const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');



dotenv.config(); //Carrega variáveis de ambiente do ficheiro .env

const PORT = process.env.PORT;


//const SECRET = "12345";
const SESSION_SECRET = process.env.SECRET || "12345"; // Variável de ambiente para a chave secreta da sessão



//simular base de dados de utilizadores

bdusers = [
    { username: "tiago", password: "1234", nick: "Castro", color:"yellow"},
    { username: "paulo", password: "54321" , nick : "paulinho", color:"lightblue"},
    ];

const app = new express();
app.use(express.urlencoded());
app.use(express.static('public'));
app.use(session({ secret: "12345" }));

// configurar render engine de templates
app.set('view engine', 'ejs');
app.set('views', 'views');


// middleware de verificação de autenticação

function estaAutenticado(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html')
    }
}

app.get('/ola', estaAutenticado ,(req, res) => {
    res.send("ola" +  " " + req.session.user)
})
    




//login
app.post('/login', async (req, res) => {
    dadoslogin = req.body;
    console.log(dadoslogin);

    //Verifica se o utilizador existe na base de dados mongodb
   user = usersCollection.findOne({ username: dadoslogin.username, password: dadoslogin.password })
        .then(user => {
            if (user) {

                
                // login com sucesso
                req.session.user = user.username;
                req.session.nick = user.nick;
                req.session.color = user.color;
                console.log("sucesso");
                res.redirect('/protected');
            } else {
                // falhou login
                console.log("insucesso");
                res.redirect('/login.html');
            }
        })
        .catch(err => {
            console.error("Erro ao verificar usuário:", err);
            res.redirect('/login.html');
        });

    /*
    const user = bdusers.find((element) => element.username === dadoslogin.username)
    if (user && user.password === dadoslogin.password) {
        // login com sucesso
        req.session.user = user.username;
        req.session.nick = user.nick;
        req.session.color = user.color;
        console.log("sucesso")
        res.redirect('/protected');

    } else {
        // falhou login
        console.log("insucesso");
        res.redirect('/login.html')
    }*/
});

app.get('/protected', estaAutenticado,(req, res) => {
        res.render('viewprotected', { nick: req.session.nick , color: req.session.color});
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})


//liga servidor
app.listen(PORT, () => {
    console.log("o servidor está a funcionar na porta : " + PORT);
})

let db;
let usersCollection;


//liga bd e servidor
async function startServer(){
    try {
        const client = new MongoClient(process.env.MONGOURL);
        await client.connect();

        db = client.db('UsersDB'); 
        usersCollection = db.collection('Users'); 

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
    }
}


startServer();