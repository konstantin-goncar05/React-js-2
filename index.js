const PORT = 9001
const URLDB = 'mongodb://127.0.0.1:27017'
const express = require ('express')
const cors = require ('cors')
const mongoose = require ('mongoose')
const jsonwebtoken = require('jsonwebtoken')
const {secret} = require('./config')
const User = require ('./models/User')
const Product = require ('./models/Product')
const app = express()


app.use(cors())
app.use(express.json())

const generateAccessToken = (id,login, password,email) => {
    const payload = {
        id,login, password,email
    };
    return jsonwebtoken.sign(payload, secret, {expiresIn: '24h'});

}
app.post('/registration', async (req, res) => {
        console.log(req.body)
        const { login:login, password:password, email:email} = req.body
        const user = new User({login, password, email})
       await user.save()
        res.json({
            message: 'Вы успешно зарегистрировались !!!'
        })
    })
    app.post('/login', async (req, res) => {
        console.log(req.body)
        const { login, password } = req.body
        const user = await User.findOne({login})
        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' })
        }
        if (user.password !==password  ) {
            return res.status(400).json({ message: 'Неверный логин или пароль' })
        }
         else {
            const token = generateAccessToken (user._id,user.login,user.password,user.email)
            res.json({
                message: 'Вы успешно авторизованы !!!',
                token: token
            })
        }
    })
    
    
    app.get('/products', async (req, res) => {
       /* const products = [

            {id:1,  header: 'Кровать двухспальная', price: 14999 }, 
            {id:2,  header: 'Стул серый', price: 4290 },
            {id:3,  header: 'Комод', price: 6738 },  
            {id:4,  header: 'Утюг', price: 2590 }, 
            {id:5,  header: 'Пылесос', price: 10700 }, 
            {id:6,  header: 'Микроволновка', price: 5990 }, 
            {id:7,  header: 'Холодильник', price: 116999 }, 
            {id:8,  header: 'Мясорубка', price: 22688 }, 
            {id:9,  header: 'Плита электрическая', price: 30807 }, 
            {id:10,  header: 'Ванна', price: 37416 }, 
            {id:11,  header: 'Кабина душевая', price: 36750 }, 
            {id:12,  header: 'Раковина', price: 15706 }, 
            {id:13,  header: 'Машина стиральная', price: 19993 } 

          ]*/
          const products = await Product.find()//вывести все с базы данных значение Product
        res.json({
            data: products
        })
    })

const start = async () => {
    try {
        await mongoose.connect(URLDB, { authSource: "admin"})
        app.listen(PORT, () => console.log(`сервер запущен на ${PORT} порте`));
    } catch(e) {
        console.log(e);
    }
}
app.post('/products/add', async (req, res) => {
    console.log(req.body)
    const { header, price } = req.body
    const product = new Product({ header, price })

    try {
        await product.save()
    } catch (err) {
        if (err && err.code !== 11000) {
            res.json({
                message: 'Неизвестная ошибка!'
            })
                .status(500)

            return
        }
    }

    res.json({
        message: 'Товар успешно добавлен! Обновите страницу для получения изменений.'
    })
})
app.post('/user/newPassword', async (req, res) => {
    console.log(req.body)
    const { token, password } = req.body
    let user

    try {
        user = await User.findOneAndUpdate( { login: jsonwebtoken.verify(token, secret).login },
            {password : password   }, { returnOriginal: false })

        if (user === null) {
            res.json({
                message: 'Пользователь отсутствует в базе.'
            })
                .status(400)
        }
    } catch (err) {
        res.json({
            message: 'Неизвестная ошибка.'
        })
            .status(500)

        return
    }

    res.json({
        message: 'Пароль изменён! выйдите и зайдите под новым паролем'
       
    })
})



start()