import express from 'express'
import Tarea from '../models/tarea.js'

const tareasRouter = express.Router()

tareasRouter.post('/', async (req, res) => {
  const { titulo, descripcion, fechaLimite, creador } = req.body

  if (!titulo) {
    return res.status(400).json({ error: 'El título es obligatorio' })
  }

  const nuevaTarea = new Tarea({
    titulo,
    descripcion,
    fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
    completada: false,
    creador
  })

  const tareaGuardada = await nuevaTarea.save()
  res.status(201).json(tareaGuardada)
})

export default tareasRouter
