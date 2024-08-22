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
  const { id, firstname } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing id or username' });
  }

  const newUser = {
    userId: id,
    firstName: firstname,
    balance: 0,
    level: 1,
    click: 1
  };

  try {
    const db = await connectToDb();
    const collection = db.collection('_users');
    const user = await collection.findOne({ userId: id });

    if (!user) {
      // Если пользователь не найден, создаем нового
      await collection.insertOne(newUser);
      return res.status(201).json({ user: newUser });
    } else {
      // Если пользователь найден, обновляем его имя
      await collection.updateOne({ userId: id }, { $set: { firstName: firstname } });
      const updatedUser = await collection.findOne({ userId: id }); // Обновленный пользователь
      return res.json({ user: updatedUser });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/getUserBalance', async (req, res) => {
  const {userBalance, id} = req.body; // Извлекаем необходимые данные из тела запроса

  if (!id || userBalance === undefined) {
    return res.status(400).json({ error: 'Missing id or userBalance' }); // Проверка на наличие необходимых данных
  }

  try {
    const db = await connectToDb();
    const collection = db.collection('_users');

    // Обновляем баланс пользователя
    const result = await collection.updateOne(
      { userId: id },
      { $set: { balance: userBalance } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' }); // Если пользователь не найден
    }

    res.status(200).json({ message: 'User balance updated successfully' }); // Успешный ответ
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Ошибка сервера
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



