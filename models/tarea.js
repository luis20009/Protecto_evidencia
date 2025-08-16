const mongoose = require('mongoose')

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
  respuesta: { type: String, default: "" },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nombreCreador: String,  // Añadimos el nombre del creador
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
