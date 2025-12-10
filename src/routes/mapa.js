import { Router } from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const reservasFile = path.join(__dirname, "../data/reservas.json")

// Asegurar que existe el directorio y archivo de reservas
function initReservasFile() {
  const dataDir = path.join(__dirname, "../data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(reservasFile)) {
    fs.writeFileSync(reservasFile, JSON.stringify([]), "utf-8")
  }
}

// Leer reservas del archivo
function leerReservas() {
  initReservasFile()
  const data = fs.readFileSync(reservasFile, "utf-8")
  return JSON.parse(data)
}

// Guardar reservas en el archivo
function guardarReservas(reservas) {
  initReservasFile()
  fs.writeFileSync(reservasFile, JSON.stringify(reservas, null, 2), "utf-8")
}

// Datos de lugares turísticos de Las Lajas e Ipiales
const lugaresTuristicos = [
  {
    id: "santuario",
    nombre: "Santuario de Las Lajas",
    descripcion: "Basílica construida sobre un cañón, una de las iglesias más hermosas del mundo",
    coordenadas: [0.8042, -77.5847],
    color: "#059669",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "puente-santuario",
    nombre: "Puente del Santuario",
    descripcion: "Impresionante puente que conecta con el Santuario sobre el río Guáitara",
    coordenadas: [0.8048, -77.5842],
    color: "#0891b2",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "mirador-lajas",
    nombre: "Mirador de Las Lajas",
    descripcion: "Punto panorámico con vistas espectaculares del cañón y el santuario",
    coordenadas: [0.8055, -77.5838],
    color: "#7c3aed",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "centro-ipiales",
    nombre: "Centro Histórico de Ipiales",
    descripcion: "Zona histórica con arquitectura colonial y calles tradicionales",
    coordenadas: [0.8281, -77.6394],
    color: "#dc2626",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "catedral-ipiales",
    nombre: "Catedral de Ipiales",
    descripcion: "Catedral principal de la ciudad con arquitectura neoclásica",
    coordenadas: [0.8278, -77.6389],
    color: "#ca8a04",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "parque-santander",
    nombre: "Parque Santander",
    descripcion: "Plaza principal de Ipiales, centro de actividad social y cultural",
    coordenadas: [0.8283, -77.6391],
    color: "#16a34a",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "plaza-mercado",
    nombre: "Plaza de Mercado",
    descripcion: "Mercado tradicional con productos locales y artesanías de la región",
    coordenadas: [0.8295, -77.6378],
    color: "#ea580c",
    icono: "/img/catalogo-lugares.jpg",
  },
  {
    id: "rumichaca",
    nombre: "Puente Internacional de Rumichaca",
    descripcion: "Puente fronterizo entre Colombia y Ecuador sobre el río Carchi",
    coordenadas: [0.8134, -77.6652],
    color: "#2563eb",
    icono: "/img/catalogo-lugares.jpg",
  },
]

// Guías turísticos de ejemplo
const guiasTuristicos = [
  { id: 'g1', nombre: 'Carlos Mendoza', foto: 'https://i.pravatar.cc/150?img=11', rating: 5 },
  { id: 'g2', nombre: 'María López', foto: 'https://i.pravatar.cc/150?img=12', rating: 4 },
  { id: 'g3', nombre: 'Jorge Ramírez', foto: 'https://i.pravatar.cc/150?img=13', rating: 5 },
  { id: 'g4', nombre: 'Ana Torres', foto: 'https://i.pravatar.cc/150?img=14', rating: 4 },
  { id: 'g5', nombre: 'Luis Fernández', foto: 'https://i.pravatar.cc/150?img=15', rating: 3 },
  { id: 'g6', nombre: 'Sofía Rojas', foto: 'https://i.pravatar.cc/150?img=16', rating: 5 },
  { id: 'g7', nombre: 'Andrés Calderón', foto: 'https://i.pravatar.cc/150?img=17', rating: 4 },
  { id: 'g8', nombre: 'Paula Guerrero', foto: 'https://i.pravatar.cc/150?img=18', rating: 5 },
  { id: 'g9', nombre: 'Diego Castro', foto: 'https://i.pravatar.cc/150?img=19', rating: 3 },
  { id: 'g10', nombre: 'Laura Peña', foto: 'https://i.pravatar.cc/150?img=20', rating: 4 },
]

// Ruta principal del mapa turístico
router.get("/guia_turistica", (req, res) => {
  res.render("guia_turistica", {
    titulo: "Mapa Turístico - Las Lajas e Ipiales",
    lugares: lugaresTuristicos,
    guias: guiasTuristicos,
  })
})

router.get("/consulta_reserva", (req, res) => {
  res.render("consulta_reserva", {
    titulo: "Consultar Reserva - Las Lajas e Ipiales",
    lugares: lugaresTuristicos,
    reserva: null,
    error: null,
  })
})

router.post("/api/reservas", (req, res) => {
  try {
    const { cedula, nombre, email, telefono, fechaVisita, lugaresSeleccionados, guiaId } = req.body

    if (!cedula || !nombre || !lugaresSeleccionados || lugaresSeleccionados.length === 0 || !guiaId) {
      return res.status(400).json({ error: "Faltan datos requeridos. Asegúrese de seleccionar un guía y al menos un lugar." })
    }

    const reservas = leerReservas()

    const nuevaReserva = {
      id: Date.now().toString(),
      cedula,
      nombre,
      email: email || "",
      telefono: telefono || "",
      fechaVisita: fechaVisita || new Date().toISOString().split("T")[0],
      lugaresSeleccionados,
      guiaId: guiaId || null,
      fechaCreacion: new Date().toISOString(),
    }

    reservas.push(nuevaReserva)
    guardarReservas(reservas)

    res.json({ success: true, reserva: nuevaReserva })
  } catch (error) {
    res.status(500).json({ error: "Error al guardar la reserva" })
  }
})

router.get("/api/reservas/:cedula", (req, res) => {
  try {
    const { cedula } = req.params
    const reservas = leerReservas()
    const reservasUsuario = reservas.filter((r) => r.cedula === cedula)

    if (reservasUsuario.length === 0) {
      return res.status(404).json({ error: "No se encontraron reservas con esa cédula" })
    }

    // Retornar la última reserva del usuario
    const ultimaReserva = reservasUsuario[reservasUsuario.length - 1]

    // Agregar información completa de los lugares
    const lugaresCompletos = ultimaReserva.lugaresSeleccionados
      .map((id) => {
        return lugaresTuristicos.find((l) => l.id === id)
      })
      .filter(Boolean)

    // Agregar información del guía si existe
    const guiaInfo = ultimaReserva.guiaId ? guiasTuristicos.find(g => g.id === ultimaReserva.guiaId) : null

    res.json({
      ...ultimaReserva,
      lugaresInfo: lugaresCompletos,
      guiaInfo
    })
  } catch (error) {
    res.status(500).json({ error: "Error al consultar la reserva" })
  }
})

// API para obtener lugares
router.get("/api/lugares", (req, res) => {
  res.json(lugaresTuristicos)
})

// Eliminar reserva por id
router.delete('/api/reservas/:id', (req, res) => {
  try {
    const { id } = req.params
    const reservas = leerReservas()
    const index = reservas.findIndex(r => r.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }
    reservas.splice(index, 1)
    guardarReservas(reservas)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva' })
  }
})

export default router