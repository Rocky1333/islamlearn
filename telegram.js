const path = require('path')
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

// Middleware для обработки JSON и URL-encoded данных -----------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// обработка post запроса авторизация "/"
app.post('/', async (req, res) => {
  const { id, username } = req.body;

  console.log(id);

  const newUser = {
    userId: id,
    firstName: username,
    balance: 0,
    level: 1,
    click: 1
  };

  const db = await connectToDb();
  const collection = db.collection('_users');
  const user = await collection.findOne({ userId: id });

  if (!user) {
    await collection.insertOne(newUser);
  }

  await collection.updateOne({ userId: id }, { $set: { firstName: username } });

  if (user) {
    res.json({ user });
  } else {
    res.json({ newUser });
  }

});


app.post('/getUserBalance', async (req, res) => {
  const userBalance = req.body.userBalance;

  const db = await connectToDb()
  const collection = db.collection('_users')

  collection.updateOne({userId: id}, {$set: {balance: userBalance}})

})

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Сервер запущен на islamlearn.vercel.app`);
});

// закрытие базы данных
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});



