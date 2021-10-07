const env = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cache = require('./redisConfig')
const app = express()

const usersArr = []

app.use(express.json())
app.use(cors())
app.use(helmet())

app.get('/get/users', async (req, res) => {
    const users = await cache.get('users')
    return res.json(users)
})

app.post('/set/users', async (req, res) => {
    const data = req.body
    usersArr.push(data)
    cache.set('users', JSON.stringify(usersArr))
    return res.status(200).end()
})

app.delete('/del/:key', (req, res) => {
    const { key } = req.params
    cache.del(key)
    return res.json('deletado!!')
})

app.listen(
    process.env.PORT || 5002,
    () => console.log(`Server is Running on port: ${process.env.PORT || 5002}`)
)