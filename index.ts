import express from 'express'
import cors from 'cors'
import routesCarros from './routes/carros'
import routesFotos from './routes/fotos'
import routesClientes from './routes/clientes'
import routesLogin from './routes/login'
import routesPropostas from './routes/propostas'
import routesAdmins from './routes/admins'
import routesLoginAdmin from './routes/adminLogin'
import routesDashboard from './routes/dashboard'

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())

app.use("/carros", routesCarros)
app.use("/fotos", routesFotos)
app.use("/clientes", routesClientes)
app.use("/clientes/login", routesLogin)
app.use("/propostas", routesPropostas)
app.use("/admins", routesAdmins)
app.use("/admins/login", routesLoginAdmin)
app.use("/dashboard", routesDashboard)

app.get('/', (req, res) => {
  res.send('API: Revenda de Veículos')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})