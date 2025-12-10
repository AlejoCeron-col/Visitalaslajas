const express = require("express")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")))

// Importar rutas
const mapaRoutes = require("./routes/mapa")

// Usar rutas
app.use("/", mapaRoutes)

// Ruta principal redirige al mapa
app.get("/", (req, res) => {
  res.redirect("/mapa-turistico")
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Mapa turístico disponible en http://localhost:${PORT}/mapa-turistico`)
})

