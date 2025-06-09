const expresss  = require('express');
const PORT = 3000;

//Simular base de dados de utilizadores
bdusers = [
    {username : "tiago", password : "1234"},
    {username : "Paulo", password : "123"},
    
]

const app = new expresss();
app.use(expresss.urlencoded())

app.use(expresss.static('public'));

app.listen(PORT, () => {
  console.log(`O servidor está a funcionar na porta: http://localhost:${PORT}`);
})

app.post('/login', (req,res)=> {
    dadoslogin = req.body;
    console.log(dadoslogin);
})













