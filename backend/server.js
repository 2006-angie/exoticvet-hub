require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Stripe = require('stripe')
const paypal = require('@paypal/checkout-server-sdk')

const app = express()

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://exoticvet-frontend.onrender.com'
  ],
  credentials: true
}))
app.use(express.json())

// Inicializar Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// Inicializar PayPal (Sandbox)
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
)
const paypalClient = new paypal.core.PayPalHttpClient(environment)

// ==========================================
// ENDPOINT: BLOG Y ARTÍCULOS VETERINARIOS
// ==========================================
app.get('/api/posts', (req, res) => {
  const articulos = [
    {
      id: 1,
      title: 'Cuidados Esenciales y Temperatura para Iguanas Verdes',
      body: 'Las iguanas verdes requieren un gradiente térmico estricto de 28°C a 35°C en la zona de asoleamiento. La iluminación UVB es obligatoria para prevenir la Enfermedad Ósea Metabólica (MBD), permitiendo la síntesis adecuada de vitamina D3.',
      categoria: 'Reptiles',
      autor: 'Dr. Alejandro Silva',
      tiempoLectura: '4 min',
      emoji: '🦎'
    },
    {
      id: 2,
      title: 'Alimentación Segura y Prevención de Obesidad en Hurones',
      body: 'Los hurones son carnívoros estrictos que requieren dietas de alto contenido proteico (>35%) y alto contenido graso, libres de fibra o azúcares que puedan propiciar el desarrollo de insulinomas.',
      categoria: 'Mamíferos Exóticos',
      autor: 'Dra. María Fernández',
      tiempoLectura: '5 min',
      emoji: '🦦'
    },
    {
      id: 3,
      title: 'Manejo del Picaje y Estrés Ambiental en Loros y Guacamayas',
      body: 'El picaje o arrancamiento de plumas suele ser síntoma de aburrimiento o deficiencias nutricionales. Se recomienda incorporar juguetes de forrajeo, enriquecimiento ambiental diario y rutinas fijas de sueño de 10 a 12 horas.',
      categoria: 'Aves',
      autor: 'Dr. Carlos Mendoza',
      tiempoLectura: '6 min',
      emoji: '🦜'
    },
    {
      id: 4,
      title: 'Humedad e Higiene para la Piel de Anfibios (Ajolotes y Ranas)',
      body: 'Los anfibios poseen piel permeable extremadamente sensible a los químicos del agua de grifo. Es fundamental usar desclorificadores, mantener filtros biológicos estables y controlar niveles de amonio y nitritos.',
      categoria: 'Anfibios',
      autor: 'Dra. Sofía Torres',
      tiempoLectura: '3 min',
      emoji: '🐸'
    },
    {
      id: 5,
      title: 'Importancia del Heno y Desgaste Dental en Conejos y Cobayas',
      body: 'El heno de timothy o alfalfa debe constituir el 80% de la dieta diaria de los lagomorfos. El masticado constante garantiza el desgaste natural de los dientes incisivos y molares, los cuales crecen continuamente.',
      categoria: 'Mamíferos Exóticos',
      autor: 'Dr. Alejandro Silva',
      tiempoLectura: '4 min',
      emoji: '🐰'
    },
    {
      id: 6,
      title: 'Parámetros de Calidad de Agua en Acuarios Marinos y Corales',
      body: 'Manejar especies marinas requiere monitorear salinidad (1.024-1.026), pH (8.1-8.4), calcio y magnesio semanalmente para garantizar la salud de peces de arrecife y evitar proliferación de algas nocivas.',
      categoria: 'Peces',
      autor: 'Dra. Sofía Torres',
      tiempoLectura: '5 min',
      emoji: '🐠'
    }
  ]

  res.json(articulos)
})

// ==========================================
// ENDPOINTS STRIPE
// ==========================================
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 2000,
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Error Stripe:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// ENDPOINTS PAYPAL
// ==========================================
app.post('/paypal/create-order', async (req, res) => {
  try {
    const { amount } = req.body

    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (amount || 20.0).toString()
          }
        }
      ]
    })

    const order = await paypalClient.execute(request)
    res.json({ id: order.result.id })
  } catch (error) {
    console.error('Error Crear Orden PayPal:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.post('/paypal/capture-order/:orderID', async (req, res) => {
  try {
    const { orderID } = req.params

    const request = new paypal.orders.OrdersCaptureRequest(orderID)
    request.requestBody({})

    const capture = await paypalClient.execute(request)
    res.json({ status: 'COMPLETED', details: capture.result })
  } catch (error) {
    console.error('Error Capturar Orden PayPal:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Encender servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`)
})