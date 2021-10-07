const env = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cache = require('./redisConfig')
const app = express()

const users = []

app.use(express.json())
app.use(cors())
app.use(helmet())

app.get('/get/users', async (req, res) => {
    console.time()
    const users = await cache.get('users')
    console.timeEnd()
    return res.send(users)
})

app.post('/set/users', (req, res) => {
    const data = req.body
    console.time()
    users.push(data)
    console.timeEnd()
    cache.set('users', JSON.stringify(users))
    return res.json(data)
})

app.delete('/del/:key', (req, res) => {
    const { key } = req.params
    console.time()
    cache.del(key)
    console.timeEnd()
    return res.json('deletado!!')
})

app.listen(
    process.env.PORT || 5002,
    () => console.log(`Server is Running on port: ${process.env.PORT || 5002}`)
)