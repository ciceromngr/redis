# Redis

## bd rotas

#### protocolo GET do servidor bd-express ela faz basicamente uma tentativa
#### para se conectar com o microservico redis, se este estiver
#### desligado ele busca fazer a conection com o proprio banco

~~~~nodejs
    app.get('/get/bd/users', async (req, res) => {
            try {
                console.log('.... tentando conection com o redis')

                console.time()
                const resp = await axios.get('http://localhost:8081/get/users')
                console.timeEnd()

                return res.status(200).json(resp.data)

            } catch (error) {
                console.log('.... tentando conection com o bd')
                
                console.time()
                const userRepository = getCustomRepository(UsersRepository)
                const users = await userRepository.find()
                console.timeEnd()

                if (users.length <= 0) return res.status(400).json({ message: 'not exist users!' })

                return res.status(200).json(users) 
            }
        }) 
~~~~~~    


#### protocolo POST do servidor bd-express diferente da anterio que é um protocolo GET,
#### este, além de salvar no banco de dados pg - postgres , ela também , 
#### envia para o microservico redis atravez do protocolo POST, o usuario.
#### Para fazer um visualização basta usar o metodo GET anterior!

~~~~nodejs
    app.post('/post/bd/users', async (req, res) => {
        const userRepository = getCustomRepository(UsersRepository)

        const { name, email } = req.body

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required()
        })

        if (!(await schema.isValid({ name, email }))) return res.status(400).json({ message: 'Name or Email is required!' })

        const usersAlready = await userRepository.findOne({ email })

        if (usersAlready) return res.status(400).json({ message: 'Email already exist!' })

        const users = userRepository.create({
            name,
            email
        })

        await userRepository.save(users)

        try {
            await axios.post('http://localhost:8081/set/users', users)
        } catch (error) {
            console.log('error: set redis users')
        }

        return res.status(200).json(users)
    })
~~~~~~

#### protocolo GET do servidor bd-express um pouco diferente da anterio que é 
#### um protocolo POST que faz basicamente adicionar um usuario por vez, este #### adciona varios usarios de uma ou mais , mas sao dados fakers!,
#### basta utilizar http://localhost:8082/faker/user/10 e trocar :qtdUsers pelo numero de
#### usuarios fakers que quiser!
#### além de adicionar ela também faz um requisicao do tipo POST para o microservico redis
#### , adicionando assim a mesma quantidade de users.

~~~~nodejs
    app.get('/faker/user/:qtdUsers', async (req, res) => {
        const userRepository = getCustomRepository(UsersRepository)
        const { qtdUsers } = req.params

        var usersAll = []

        if (!qtdUsers) return res.status(400).json({ message: 'Please put the number for next!' })

        for (var i = 0; i < parseInt(qtdUsers); i++) {
            const users = userRepository.create({
                name: faker.name.firstName(),
                email: faker.internet.email()
            })

            usersAll.push(users)

            await userRepository.save(users)

            try {
                await axios.post('http://localhost:8081/set/users', users)
            } catch (error) {
                console.log('error: set redis users')
            }
        }

        return res.status(200).json(usersAll)
    })
~~~~~~    


## jupter rotas !!
### finalmente chegamos onde a magia acontece!!!

#### Está class Cache onde montamos as configs do redis,
#### o construtor e sempre inicializado primeiro, e o que fazemos nele é
#### dizer que a variavel redis recebe a instancia do Redis passando algumas propriedades
#### como HOST e PORT, como default ou utilizando as variaveis de ambiente nodejs
#### , abaixo dela temos os metodos get set del
#### a fun get ela espera uma 'key' - chave , no redis temos chave e valor ,
#### nessa fun pegamos apenas a key, no caso o indentificador do redis que definimos { 'key': 'value' }, exe: { 'users': '[{ name: 'teste' }]' } 
#### na função set dizemos qual a chave e o valor , o valor alocamos no formato string
#### JSON.stringfy(value) ou se for mandar uma string direta não precisa do JSON.stringfy

~~~~nodejs
    class Cache {
        constructor() {
            this.redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379
            })
        }

        async get(key) {
            const value = await this.redis.get(key)
            return value ? JSON.parse(value) : null
        }

        set(key, value) {
            return this.redis.set(key, value)
        }

        del(key) {
            return this.redis.del(key)
        }
    }
~~~~~~ 

#### metodo GET do microservico redis pega todos os usuarios no cache redis
#### metodo POST seta os dados no cache do redis passando chave/valor
#### metodo DELETE apaga uma determinada key do cache redis

~~~~nodejs
    app.get('/get/users', async (req, res) => {
        console.time()
        const users = await cache.get('users')
        console.timeEnd()
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
        console.time()
        cache.del(key)
        console.timeEnd()
        return res.json('deletado!!')
    })
~~~~~~    


