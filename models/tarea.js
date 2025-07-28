import mongoose from 'mongoose'

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  fechaLimite: Date,
  completada: { type: Boolean, default: false },
  respuesta: { type: String, default: "" }, // campo editable por el estudiante
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})



tareaSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

export default mongoose.model('Tarea', tareaSchema)
