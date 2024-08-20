
// Импортируем необходимые библиотеки ------------------------------------------------------------------------------
const express = require('express');
const app = express();
const http = require("http")
const server = http.createServer(app)


// Подключаемся к MongoDB 
const { MongoClient } = require('mongodb');
const url = "mongodb+srv://margiev:12345@alan.wcglgbh.mongodb.net/?retryWrites=true&w=majority&appName=Alan";
const dbName = "users";
const client = new MongoClient(url);

async function connectToDb() {
    try {
        await client.connect();
        return client.db(dbName);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

// Подключаем Telegram Bot API 

const TelegramBot = require('node-telegram-bot-api');
const token = "7179470973:AAFd-JnC8bpNE36X1VAYV0eb21CbGSrmexM";
const bot = new TelegramBot(token);


const path = require('path');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешает запросы с любого домена
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});



// Middleware для обработки JSON и URL-encoded данных -----------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



bot.onText(/\/start/, async (msg) => {
    const chat_id = msg.chat.id;

    const user_name = msg.from.first_name;

    bot.sendMessage(chat_id, "Залетай в нашу халяль игру:", {
      reply_markup: {
          inline_keyboard: [
              [{
                  text: "Открыть IslamLearn",
                  web_app: { url: "https://islamlearn.vercel.app/" } 
              }]
          ]
      }
  });

    bot.sendMessage(chat_id, "Здравствуй джыл")

});

// получение user_name пользователя по его user_id телеграм 
async function findUserByUserId(id){
    try {
      const db = await connectToDb();
      const collection = db.collection('_users')
      const user = await collection.findOne(
        {userId: id},
        {projection: {firstName: 1, click: 1, balance: 1, level: 1}}
      )
      return user;
    }
    catch (err) {
      console.log("жопа", err)
      throw err
    }
  };


// обработка папки public 
app.use(express.static(path.join(__dirname, 'public')));


app.post('/', async (req, res) => {
  const {id, username} = req.body;
  
  console.log(id)
  
  const newUser = {
    userId: id,
    firstName: username,
    balance: 0,
    level: 1,
    click: 1
  }

  const db = await connectToDb()
  const collection = db.collection('_users')
  const user = await collection.findOne( {userId: id } )

  if(!user){
    await collection.insertOne(newUser)
  } else {
    collection.updateOne({userId: id}, { $set: { firstName: username } })
    res.status(200).json({ message: 'Пользователь уже существует', user });
  }

})

// socket ----------------------------------------------------------------------------------------------------------------------

const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', async (socket) => {

 const user = socket.handshake.query.userId

  if (user) {
    let user_balance = user.balance;
    let click = user.click;
    let level = user.level;

    socket.emit('balance', user_balance);
    socket.emit('click', click);
    socket.emit('level', level);

    const db = await connectToDb();
    const users = db.collection("_users");

    async function UpdateUserBalance(balance) {
      await users.updateOne({ userId: userId }, { $set: { balance: balance } });
    }

    socket.on("balance", balance => {
      user_balance = balance;
    });

    socket.on('disconnect', async () => {
      await UpdateUserBalance(user_balance);
    });
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Сервер запущен на islamlearn.vercel.app`);
});

// закрытие базы данных
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});



