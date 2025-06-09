const { Console } = require('console');
const expresss  = require('express');
const session = require('express-session');
const PORT = 3000;

//Simular base de dados de utilizadores


bdusers = [
    {username : "tiago", password : "1234", nickname : "Castro"},
    {username : "Paulo", password : "123", nickname: "Paulinho"},
]

const app = new expresss();
app.use(expresss.urlencoded())
app.use(expresss.static('public'));
app.use(session({secret: "1234"}));

app.post('/login', (req,res)=> {
    dadoslogin = req.body;
    console.log(dadoslogin);
   const user =  bdusers.find((element) => element.username === dadoslogin.username)
   
   if(user && user.password === dadoslogin.password){
    //Login com sucesso
    req.session.user = user.username;
    console.log("Login com sucesso");
    res.redirect('/protected');

   } else{
    //falhou Login
    console.log("Login falhou");
    res.redirect('/login.html');
   }

   



   
  /* let validlogin;
    if(!user){
        validlogin = false;
    } else if (user.password === dadoslogin.password) {
            validlogin = true;
        } else {
            validlogin = false;
        }
    

     console.log(user + " : " + validlogin);



     if(validlogin){
    req.session.user = user.username;
    req.redirect('/protected');
   }else{
    req.redirect('/login.html');
   }
*/

   
    
})








app.listen(PORT, () => {
  console.log(`O servidor está a funcionar na porta: http://localhost:${PORT}`);
})





