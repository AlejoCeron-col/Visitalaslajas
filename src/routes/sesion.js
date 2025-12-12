import express from "express"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const usuariosPath = path.join(__dirname, "../data/usuarios.json")

// Función para leer usuarios
function leerUsuarios() {
  try {
    const datos = fs.readFileSync(usuariosPath, "utf-8")
    return JSON.parse(datos)
  } catch (error) {
    return []
  }
}

// Función para guardar usuarios
function guardarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
}

// Ruta para mostrar formulario de registro
router.get("/registro", (req, res) => {
  res.render("registro", {
    titulo: "Registro - Las Lajas e Ipiales",
    ocultarbtnreg: false,
    ocultarbtnini: true,
    error: null
  })
})

// Ruta para procesar registro
router.post("/registrar-usuario", async (req, res) => {
  try {
    const { cedula, nombre, fechanacimiento, telefono, email, password, Conf_password } = req.body

    // Validaciones
    if (!cedula || !nombre || !fechanacimiento || !telefono || !email || !password) {
      return res.status(400).send(`
    <script>
      alert("Todos los campos son requeridos");
      window.history.back();
    </script>
  `)}

    if (password !== Conf_password) {
      return res.status(400).send(`
    <script>
      alert("Las contraseñas no coinciden");
      window.history.back();
    </script>
    `)}

    let usuarios = leerUsuarios()

    // Verificar si el email ya existe
    const usuarioExistente = usuarios.find(u => u.email === email)
    if (usuarioExistente) {
      return res.status(400).send(`
    <script>
      alert("El email ya esta registrado");
      window.history.back();
    </script>
    `)}

    // Verificar si la cédula ya existe
    const cedulaExistente = usuarios.find(u => u.cedula === cedula)
    if (cedulaExistente) {
      return res.status(400).send(`
    <script>
      alert("La cedula ya esta registrada");
      window.history.back();
    </script>
    `)}
    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: Date.now().toString(),
      cedula,
      nombre,
      fechanacimiento,
      telefono,
      email,
      passwordHash,
      fechaRegistro: new Date().toISOString()
    }

    usuarios.push(nuevoUsuario)
    guardarUsuarios(usuarios)

    // Crear sesión
    req.session.user = {
      id: nuevoUsuario.id,
      cedula: nuevoUsuario.cedula,
      nombre: nuevoUsuario.nombre,
      fechanacimiento: nuevoUsuario.fechanacimiento,
      telefono: nuevoUsuario.telefono,
      email: nuevoUsuario.email
    }

    return res.redirect("/registro?registro=ok");
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).send(`
    <script>
      alert("Error al registrar el usuario");
      window.history.back();
    </script>
    `)}
})

// Ruta para mostrar formulario de login
router.get("/iniciosesion", (req, res) => {
  res.render("iniciosesion", {
    titulo: "Iniciar Sesión - Las Lajas e Ipiales",
    ocultarbtnreg: true,
    ocultarbtnini: false,
    error: null
  })
})

// Ruta para procesar login
router.post("/iniciar-sesion", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).send(`
    <script>
      alert("Email y Contraseña son requeridos");
      window.history.back();
    </script>
    `)}

    const usuarios = leerUsuarios()
    const usuario = usuarios.find(u => u.email === email)

    if (!usuario) {
      return res.status(401).send(`
    <script>
      alert("Email o Contraseña incorrectos");
      window.history.back();
    </script>
    `)}

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash)

    if (!passwordValida) {
      return res.status(401).send(`
    <script>
      alert("Email o Contraseña incorrectos");
      window.history.back();
    </script>
    `)}

    // Crear sesión
    req.session.user = {
      id: usuario.id,
      cedula: usuario.cedula,
      nombre: usuario.nombre,
      fechanacimiento: usuario.fechanacimiento,
      telefono: usuario.telefono,
      email: usuario.email
    }

    return res.redirect("/iniciosesion?inicio=ok");
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).send(`
    <script>
      alert("Error al iniciar sesion");
      window.history.back();
    </script>
    `)}
})

// Ruta para logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err)
    }
    res.redirect("/")
  })
})

// Middleware para proteger rutas
export function verificarAutenticacion(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/iniciar-sesion")
  }
  next()
}

export default router
