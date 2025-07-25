# TW Mashup App

## Autor
- Tiago Castro (31456)

## Descrição do Trabalho
Aplicação web desenvolvida para a unidade curricular de Tecnologias Web, que permite pesquisar termos (como cidades, artistas ou palavras) e integra dados de APIs externas, apresentando ao utilizador informações do clima e resumos da Wikipedia. O sistema inclui autenticação de utilizadores e histórico de pesquisas, tudo persistido em MongoDB.

## O que faz e como funciona
- Permite o registo e login de utilizadores (com password encriptada).
- Após login, o utilizador pode pesquisar um termo.
- O servidor consulta duas APIs externas (OpenWeatherMap e Wikipedia) e apresenta os resultados integrados.
- Cada pesquisa é guardada no histórico do utilizador, que pode ser consultado após login.
- Todas as requisições às APIs são feitas no servidor, protegendo as chaves.

## Onde está publicado
- **Deployment Render.com:**  
  [https://api-mashup-h2tw.onrender.com](https://api-mashup-h2tw.onrender.com)

## Como instalar e correr localmente

1. **Clona o repositório:**
   ```
   git clone https://github.com/TiagoCastro05/Atividade-assincrona
   cd Atividade-assincrona
   ```

2. **Instala as dependências:**
   ```
   npm install
   ```

3. **Configura o ficheiro `.env`:**
   Cria um ficheiro `.env` na raiz do projeto com o seguinte conteúdo:
   ```
   PORT=3000
   SESSION_SECRET=algumasecreta
   MONGOURL=... (a tua connection string do MongoDB Atlas)
   OPENWEATHER_KEY=... (a tua chave do OpenWeatherMap)
   ```
   - **Como obter a chave do OpenWeatherMap:**  
     Regista-te em [https://openweathermap.org/](https://openweathermap.org/), vai a "API keys" e copia a tua chave.
   - **Como obter a connection string do MongoDB Atlas:**  
     Cria uma conta em [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), cria um cluster gratuito e copia a connection string.

4. **Inicia o servidor:**
   ```
   node app.js
   ```

5. **Acede à aplicação:**  
   [http://localhost:3000](http://localhost:3000)

## Descrição da Base de Dados
- **MongoDB Atlas** é utilizado para persistência.
- **Coleção `Users`:** Guarda utilizadores com os campos: `username`, `password` (hash), `nick`, `color`.
- **Coleção `History`:** Guarda o histórico de pesquisas de cada utilizador com os campos: `username`, `termo`, `data`, `weather`, `wiki`.

## Descrição da Autenticação
- Utiliza **express-session** para sessões de utilizador.
- Passwords são guardadas com hash usando **bcrypt**.
- Apenas utilizadores autenticados podem aceder à pesquisa e ao histórico.
- Registo e login disponíveis via formulários.

## APIs Externas Utilizadas
- **OpenWeatherMap:** Para obter o clima atual de cidades pesquisadas.
- **Wikipedia REST API:** Para obter resumos de artigos relacionados com o termo pesquisado.

## Outros conteúdos relevantes
- Frontend responsivo com Bootstrap 5.
- Todas as chaves e credenciais estão protegidas no `.env` e nunca expostas no frontend.
- O histórico de pesquisas é apresentado ao utilizador após login.
- O projeto pode ser facilmente adaptado para integrar outras APIs externas.