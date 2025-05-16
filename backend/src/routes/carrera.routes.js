import express from 'express';
import {
  obtenerCarreras,
  crearCarrera,
  actualizarCarrera,
  eliminarCarrera
} from '../controllers/carrera.controller.js';

const router = express.Router();

router.get('/carreras', obtenerCarreras);
router.post('/carreras', crearCarrera);
router.put('/carreras/:id', actualizarCarrera);
router.delete('/carreras/:id', eliminarCarrera);

export default router;