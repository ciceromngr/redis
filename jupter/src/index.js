const express = require('express')
const db = require('./db')
const { setRedis, getRedis } = require('./redisConfig')
const app = express()


function enviarUsersParaRedis() {
    setRedis('users', Buffer.from(JSON.stringify(db)))
}

enviarUsersParaRedis()

app.use('/getAllUsers', async (req, res) => {
    const users = await getRedis('users')
    return res.json(JSON.parse(users))
})

app.listen(process.env.PORT || 5002, () => console.log('Porta rodando na 5002 da jupter'))