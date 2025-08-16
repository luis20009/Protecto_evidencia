const mongoose = require('mongoose')

const preguntaSchema = new mongoose.Schema({
  pregunta: { 
    type: String, 
    required: [true, 'La pregunta es obligatoria']
  },
  opciones: [{
    texto: { 
      type: String, 
      required: [true, 'El texto de la opción es obligatorio']
    },
    esCorrecta: { 
      type: Boolean, 
      required: [true, 'Debe indicar si la opción es correcta']
    }
  }],
  respuestaSeleccionada: {
    type: Number,
    default: -1
  }
})

// Validación para asegurar que hay al menos una opción
preguntaSchema.path('opciones').validate(function(opciones) {
  return opciones.length > 0;
}, 'Debe proporcionar al menos una opción');

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  fechaLimite: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'La fecha límite debe ser posterior a la fecha actual'
    }
  },
  completada: { type: Boolean, default: false },
  preguntas: [preguntaSchema],
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nombreCreador: String,
  userInfo: {
    username: String,
    name: String,
    Rol: String
  }
})

tareaSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

module.exports = mongoose.model('Tarea', tareaSchema)
