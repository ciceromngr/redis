# redis

## bd rota get

        ``` app.get('/get/bd/users', async (req, res) => {
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
            }) ```