const express = require('express')
const Tarea = require('../models/tarea')
const User = require('../models/user')
const tareasRouter = express.Router()
const { userExtractor } = require('../utils/middleware')

// Modificar el GET para filtrar por roles
tareasRouter.get('/mis-tareas', userExtractor, async (req, res) => {
  try {
    const usuario = req.user

    let tareas
    if (usuario.Rol === 'maker') {
      // Si es maker, obtiene las tareas que ha creado
      tareas = await Tarea.find({ creador: usuario.id })
        .populate('creador', { username: 1, name: 1, Rol: 1 })
    } else if (usuario.Rol === 'user') {
      // Si es user, obtiene todas las tareas creadas por makers
      tareas = await Tarea.find({ 'userInfo.Rol': 'maker' })
        .populate('creador', { username: 1, name: 1, Rol: 1 })
    }

    res.json(tareas)
  } catch (error) {
    console.error('Error al obtener tareas:', error)
    res.status(500).json({ error: 'Error al obtener las tareas' })
  }
})

// Añadir este nuevo endpoint GET
tareasRouter.get('/', async (req, res) => {
  try {
    const tareas = await Tarea.find({})
      .populate('creador', { username: 1, name: 1, Rol: 1 })
    res.json(tareas)
  } catch (error) {
    console.error('Error al obtener tareas:', error)
    res.status(500).json({ error: 'Error al obtener las tareas' })
  }
})

// POST para crear tarea con preguntas
tareasRouter.post('/', userExtractor, async (req, res) => {
  try {
    const { titulo, descripcion, fechaLimite, preguntas } = req.body
    const user = req.user

    // Validación básica
    if (!titulo) {
      return res.status(400).json({ error: 'El título es obligatorio' })
    }

    if (!fechaLimite) {
      return res.status(400).json({ error: 'La fecha límite es obligatoria' })
    }

    // Validación de preguntas
    if (!preguntas || !Array.isArray(preguntas) || preguntas.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos una pregunta' })
    }

    // Validar estructura de cada pregunta
    for (const pregunta of preguntas) {
      if (!pregunta.pregunta) {
        return res.status(400).json({ error: 'Cada pregunta debe tener un texto' })
      }
      
      if (!pregunta.opciones || !Array.isArray(pregunta.opciones) || pregunta.opciones.length === 0) {
        return res.status(400).json({ error: 'Cada pregunta debe tener al menos una opción' })
      }

      // Verificar que haya exactamente una respuesta correcta
      const opcionesCorrectas = pregunta.opciones.filter(opcion => opcion.esCorrecta)
      if (opcionesCorrectas.length !== 1) {
        return res.status(400).json({ 
          error: 'Cada pregunta debe tener exactamente una opción correcta' 
        })
      }
    }

    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      fechaLimite: new Date(fechaLimite),
      completada: false,
      preguntas: preguntas.map(p => ({
        pregunta: p.pregunta,
        opciones: p.opciones,
        respuestas: []
      })),
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

// POST para responder una pregunta específica de una tarea
tareasRouter.post('/:id/responder', userExtractor, async (req, res) => {
  try {
    const { preguntaIndex, respuestaIndex } = req.body
    const user = req.user

    if (user.Rol !== 'user') {
      return res.status(403).json({ error: 'Solo los usuarios pueden responder tareas' })
    }

    const tarea = await Tarea.findById(req.params.id)
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    // Validar que el índice de la pregunta sea válido
    if (preguntaIndex < 0 || preguntaIndex >= tarea.preguntas.length) {
      return res.status(400).json({ error: 'Índice de pregunta inválido' })
    }

    // Validar que el índice de la respuesta sea válido
    const pregunta = tarea.preguntas[preguntaIndex]
    if (respuestaIndex < 0 || respuestaIndex >= pregunta.opciones.length) {
      return res.status(400).json({ error: 'Índice de respuesta inválido' })
    }

    // Actualizar solo la respuesta de la pregunta específica
    const respuestas = pregunta.respuestas || []

const yaRespondio = respuestas.find(r => r.usuarioId.toString() === user.id.toString())

if (yaRespondio) {
  yaRespondio.seleccion = respuestaIndex
} else {
  respuestas.push({ usuarioId: user.id, seleccion: respuestaIndex })
}

pregunta.respuestas = respuestas

    // Verificar si todas las preguntas han sido respondidas
    const todasRespondidas = tarea.preguntas.every(p => p.respuestaSeleccionada !== -1)
    if (todasRespondidas) {
      tarea.completada = true
    }

    const tareaActualizada = await tarea.save()
    res.json(tareaActualizada)
  } catch (error) {
    console.error('Error al responder pregunta:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = tareasRouter
