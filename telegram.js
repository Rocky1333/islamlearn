
// Импортируем необходимые библиотеки ------------------------------------------------------------------------------
const express = require('express');
const app = express();
const http = require("http")
const server = http.createServer(app)

// Подключаем Socket.io
const socketIo = require('socket.io');
const io = socketIo(server);

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
const bot = new TelegramBot(token, { polling: true });

// шаблонизатор ------------------------------------------------------------------------------------------------------
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware для обработки JSON и URL-encoded данных -----------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Обрабочтик команды /start в телеграм боте --------------------------------------------------------------------------
let current_user = null;
let current_photo = null

bot.onText(/\/start/, async (msg) => {
    const chat_id = msg.chat.id;
    bot.sendMessage(chat_id, "Здравствуй джыл")
});

// получение user_name пользователя по его user_id телеграм 
async function findUserByUserId(current_user){
    try {
      const db = await connectToDb();
      const collection = db.collection('_users')
      const user = await collection.findOne(
        {user_id: current_user},
        {projection: {user_name: 1, click: 1, balance: 1, level: 1}}
      )
      return user;
    }
    catch (err) {
      console.log("пиздец!")
      throw err
    }
  };

// Запуск сервера 

const port = 3000;

server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:3000`);
});

// обработка папки public 
app.use(express.static('public'));

// получаем id из webapp

app.post('/', async (req, res) => {
  const user = req.body;
  const id = user.id;
  current_user = id;
})

// Отображаем в index,ejs user_name пользователя из телеграм 
app.get('/', async (req, res) => {
  const user = await findUserByUserId(current_user);

  if (user) {
    const data = {
      user_name: user.user_name,
    }
    res.render('index', {
      user_name: user.user_name,
      user_photo: current_photo
    });
  } else {
    res.send('User not found');
  }
});


// socket ----------------------------------------------------------------------------------------------------------------------

io.on('connect', async socket => {

  const user = await findUserByUserId(current_user)
  if (user) {
       
    let user_balance = user.balance;
    let click = user.click;
    let level = user.level;
    
    socket.emit('balance', user_balance);

    socket.emit('click', click);

    socket.emit('level', level);
    

    async function UpdateUserBalance(balance){
      const db = await connectToDb();
      const users = db.collection("_users")
      await users.updateOne({ user_id: current_user }, { $set: { balance: balance } });
      
    }

    

    socket.on("balance", balance => {
      user_balance = balance;
    })

    socket.on('disconnect', () => {
      UpdateUserBalance(user_balance)
    });
  
  };

});

// закрытие базы данных
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});




