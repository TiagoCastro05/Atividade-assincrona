const express = require('express');
const session = require('express-session')

const PORT = 3000;

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
    
app.post('/login', (req, res) => {
    dadoslogin = req.body;
    console.log(dadoslogin);
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
    }
});

app.get('/protected', estaAutenticado,(req, res) => {
        res.render('viewprotected', { nick: req.session.nick , color: req.session.color});
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log("o servidor está a funcionar na porta : " + PORT);
})