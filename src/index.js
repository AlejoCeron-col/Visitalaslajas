import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import mapaRoutes from "./routes/mapa.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../src/views/layout"))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")))

// Ruta principal para index.ejs
app.get("/", (req, res) => {
  res.render("index")
})

// Rutas
app.use("/", mapaRoutes)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Página principal disponible en http://localhost:${PORT}/`)
  console.log(`Mapa turístico disponible en http://localhost:${PORT}/mapa-turistico`)
})
