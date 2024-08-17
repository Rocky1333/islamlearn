
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


const path = require('path');
const cors = require('cors');
app.use(cors());

// Middleware для обработки JSON и URL-encoded данных -----------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



bot.onText(/\/start/, async (msg) => {
    const chat_id = msg.chat.id;
<<<<<<< HEAD
    const user_name = msg.from.first_name;

    bot.sendMessage(chat_id, "Откройте наше веб-приложение:", {
      reply_markup: {
          inline_keyboard: [
              [{
                  text: "Открыть Web App",
                  web_app: { url: "https://94c8-87-215-94-174.ngrok-free.app" } 
              }]
          ]
      }
  });
=======
    bot.sendMessage(chat_id, "Здравствуй джыл")
>>>>>>> 978e5264639603d25157fefaa90ecba299603b66
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

let userId = null
let firstName = null

app.post('/', async (req, res) => {
  const {id, username} = req.body;
  
  userId = id;
  firstName = username
  console.log(userId)
  console.log(firstName)
  
  const newUser = {
    userId: userId,
    firstName: firstName,
    balance: 0,
    level: 1,
    click: 1
  }

  const db = await connectToDb()
  const collection = db.collection('_users')
  const user = await collection.findOne( {userId: userId } )

  if(!user){
    await collection.insertOne(newUser)
  } else {
    collection.updateOne({userId: userId}, { $set: { firstName: firstName } })
    res.status(200).json({ message: 'Пользователь уже существует', user });
  }



})

app.get('/getFirstName', (req, res) => {
  res.json({firstName: firstName})
})

<<<<<<< HEAD

// Запуск сервера 

const port = 5500;

server.listen(port, () => {
    console.log(`Сервер запущен на https://94c8-87-215-94-174.ngrok-free.app`);
=======
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
>>>>>>> 978e5264639603d25157fefaa90ecba299603b66
});


// socket ----------------------------------------------------------------------------------------------------------------------

io.on('connect', async socket => {

  const user = await findUserByUserId(userId)
  
  if (user) {

    let user_balance = user.balance;
    let click = user.click;
    let level = user.level;

    socket.emit('balance', user_balance);

    socket.emit('click', click);

    socket.emit('level', level);

    const db = await connectToDb();
    const users = db.collection("_users")

    async function UpdateUserBalance(balance){
      await users.updateOne({ userId: userId }, { $set: { balance: balance } });
    }


    socket.on("balance", balance => {
      user_balance = balance;
    })

    socket.on('disconnect', async () => {
      await UpdateUserBalance(user_balance)
    });

  };

});

// закрытие базы данных
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});




