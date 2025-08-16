const express = require('express')
const Tarea = require('../models/tarea')
const User = require('../models/user')
const tareasRouter = express.Router()
const { userExtractor } = require('../utils/middleware')  // Añadir esta línea

// Modificar el POST para usar userExtractor
tareasRouter.post('/', userExtractor, async (req, res) => {
  try {
    const { titulo, descripcion, fechaLimite } = req.body
    const user = req.user

    if (!titulo) {
      return res.status(400).json({ error: 'El título es obligatorio' })
    }

    if (!fechaLimite) {
      return res.status(400).json({ error: 'La fecha límite es obligatoria' })
    }

    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      fechaLimite: new Date(fechaLimite),
      completada: false,
      creador: user.id,
      nombreCreador: user.name,
      userInfo: {
        username: user.username,
        name: user.name,
        Rol: user.Rol
      }
    })

    const tareaGuardada = await nuevaTarea.save()
    await tareaGuardada.populate('creador', { username: 1, name: 1, Rol: 1 })
    res.status(201).json(tareaGuardada)
  } catch (error) {
    console.error('Error al crear tarea:', error)
    res.status(500).json({ error: error.message })
  }
})

// Obtener tareas del usuario actual
tareasRouter.get('/mis-tareas', userExtractor, async (req, res) => {
  try {
    const tareas = await Tarea.find({ 'creador': req.user.id })
      .populate('creador', { username: 1, name: 1, Rol: 1 })
    res.json(tareas)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' })
  }
})

tareasRouter.get('/', async (req, res) => {
  try {
    const tareas = await Tarea.find({})
    res.json(tareas)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' })
  }
})

module.exports = tareasRouter
