<script setup>
import { ref, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { loadScript } from '@paypal/paypal-js'

const API_BASE_URL = 'https://exoticvet-hub.onrender.com'

// Catálogo y Carrito
const productos = ref([
  { id: 1, nombre: 'Alimento para Reptiles', precio: 350, categoria: 'Alimentos', emoji: '🦎' },
  { id: 2, nombre: 'Lámpara UVB 10.0', precio: 580, categoria: 'Lámparas', emoji: '💡' },
  { id: 3, nombre: 'Suplemento Calcio + D3', precio: 220, categoria: 'Vitaminas', emoji: '🧪' },
  { id: 4, nombre: 'Terrario de Cristal 45x45', precio: 1850, categoria: 'Terrarios', emoji: '🏠' }
])
const carrito = ref([])

// Estados del Modal y Pago
const metodoPago = ref('stripe')
const mostrarModal = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Instancias de Stripe
const stripePromise = loadStripe('pk_test_51TrNWTHZTq1IYy0Eh46hGjxiHBnOpUm7u7No5I5eMYZVPZQOmh2grBdF18ORDE7EPCOWn4IyIxcVFpw7mseQxUNC00j4IRrbMb')
let stripe = null
let elements = null

const agregarAlCarrito = (p) => carrito.value.push(p)
const total = () => carrito.value.reduce((acc, item) => acc + item.precio, 0)

// Abrir checkout y cargar pasarela
const abrirCheckout = async () => {
  if (carrito.value.length === 0) return alert('El carrito está vacío.')
  
  mostrarModal.value = true
  errorMessage.value = ''
  successMessage.value = ''

  await nextTick()
  if (metodoPago.value === 'stripe') {
    await inicializarStripe()
  } else {
    await inicializarPayPal()
  }
}

// Cambiar pestaña de método de pago
const cambiarMetodo = async (nuevoMetodo) => {
  metodoPago.value = nuevoMetodo
  errorMessage.value = ''
  await nextTick()
  if (nuevoMetodo === 'stripe') {
    await inicializarStripe()
  } else {
    await inicializarPayPal()
  }
}

// 1. Stripe Elements
const inicializarStripe = async () => {
  try {
    stripe = await stripePromise
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total() * 100 })
    })

    const { clientSecret } = await response.json()
    elements = stripe.elements({ clientSecret })
    
    document.getElementById('payment-element').innerHTML = ''
    const paymentElement = elements.create('payment')
    paymentElement.mount('#payment-element')
  } catch (err) {
    errorMessage.value = 'Error al conectar con la pasarela de Stripe en Render.'
  }
}

const handleStripeSubmit = async () => {
  if (!stripe || !elements) return
  loading.value = true
  errorMessage.value = ''

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: window.location.href },
    redirect: 'if_required'
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    successMessage.value = '¡Pago completado con éxito vía Stripe!'
    carrito.value = []
  }
  loading.value = false
}

// 2. PayPal SDK
const inicializarPayPal = async () => {
  try {
    const container = document.getElementById('paypal-button-container')
    container.innerHTML = ''

    await loadScript({
      clientId: 'Ac4GatJUdAtxsm5T4o78OX98n6FMEzqem0IQxooGaAisfqCK-wVunrLLNQUjNX2jnUKiFr100wmy0WK1',
      currency: 'USD'
    })

    window.paypal.Buttons({
      createOrder: async () => {
        const response = await fetch(`${API_BASE_URL}/paypal/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total() })
        })
        const order = await response.json()
        return order.id
      },
      onApprove: async (data) => {
        await fetch(`${API_BASE_URL}/paypal/capture-order/${data.orderID}`, {
          method: 'POST'
        })
        successMessage.value = '¡Pago realizado con éxito vía PayPal!'
        carrito.value = []
      }
    }).render('#paypal-button-container')
  } catch (e) {
    errorMessage.value = 'Error al conectar con PayPal.'
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}
</script>