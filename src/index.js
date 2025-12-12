import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import mapaRoutes from "./routes/rutas.js"
import sesionRoutes from "./routes/sesion.js"
import { TicketPlusIcon } from "lucide-react"
import fs from "fs"
import session from "express-session";
import dotenv from "dotenv"
import cors from "cors"
import sessionFileStore from "session-file-store"


dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const FileStore = sessionFileStore(session);
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: true,
  credentials: true
}))



app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../src/views/layout"))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "../public")))

app.use(session({
    store: new FileStore({
      path: './sessions',  // Carpeta donde se guardan las sesiones
      ttl: 86400           // 24 horas
    }),
    secret: process.env.SESSION_SECRET || "clave-secreta",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,                 // Cambiar a true solo si usas HTTPS
      httpOnly: true,                // Protege contra XSS
      maxAge: 1000 * 60 * 60 * 24,   // 24 horas de duración
      sameSite: 'lax'                // Permite envío de cookies en navegación normal
    }
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  next()
})

app.use("/", mapaRoutes)
app.use("/", sesionRoutes)

app.get("/", (req, res) => {
  res.render("index",{
    titulo: "Inicio",
    ocultarbtnreg: true,
    ocultarbtnini: true,
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Página principal disponible en http://localhost:${PORT}/`)
  console.log(`Mapa turístico disponible en http://localhost:${PORT}/mapa-turistico`)
})
