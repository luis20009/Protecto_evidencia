const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password, Rol } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
    Rol
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

// Nuevo endpoint para obtener usuarios maker
usersRouter.get('/makers', async (request, response) => {
  try {
    const makers = await User.find({ Rol: 'maker' })
      .select('id username name Rol')
    
    response.json(makers)
  } catch (error) {
    response.status(500).json({ error: 'Error al obtener makers' })
  }
})

module.exports = usersRouter