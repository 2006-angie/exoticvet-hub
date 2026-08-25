<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { loadScript } from '@paypal/paypal-js'

const API_BASE_URL = 'https://exoticvet-hub.onrender.com'

const productos = ref([
  { id: 1, nombre: 'Alimento para Reptiles', precio: 350, categoria: 'Alimentos', emoji: '🦎', desc: 'Dieta balanceada para iguanas y dragones barbudos.' },
  { id: 2, nombre: 'Lámpara UVB 10.0', precio: 580, categoria: 'Lámparas', emoji: '💡', desc: 'Esencial para la síntesis de vitamina D3 en tu mascota.' },
  { id: 3, nombre: 'Suplemento Calcio + D3', precio: 220, categoria: 'Vitaminas', emoji: '🧪', desc: 'Previene la enfermedad ósea metabólica.' },
  { id: 4, nombre: 'Terrario de Cristal 45x45', precio: 1850, categoria: 'Terrarios', emoji: '🏠', desc: 'Hábitat seguro con ventilación frontal y superior.' }
])
const carrito = ref<any[]>([])

const metodoPago = ref<'stripe' | 'paypal'>('stripe')
const mostrarModal = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const stripePromise = loadStripe('pk_test_51TrNWTHZTq1IYy0Eh46hGjxiHBnOpUm7u7No5I5eMYZVPZQOmh2grBdF18ORDE7EPCOWn4IyIxcVFpw7mseQxUNC00j4IRrbMb')
let stripe: any = null
let elements: any = null

const agregarAlCarrito = (p: any) => carrito.value.push(p)
const total = () => carrito.value.reduce((acc, item) => acc + item.precio, 0)

const abrirCheckout = async () => {
  if (carrito.value.length === 0) return alert('El carrito está vacío.')
  mostrarModal.value = true
  errorMessage.value = ''
  successMessage.value = ''

  await nextTick()
  if (metodoPago.value === 'stripe') await inicializarStripe()
  else await inicializarPayPal()
}

const cambiarMetodo = async (nuevoMetodo: 'stripe' | 'paypal') => {
  metodoPago.value = nuevoMetodo
  errorMessage.value = ''
  await nextTick()
  if (nuevoMetodo === 'stripe') await inicializarStripe()
  else await inicializarPayPal()
}

const inicializarStripe = async () => {
  try {
    stripe = await stripePromise
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total() * 100 })
    })

    if (!response.ok) throw new Error('Servidor no disponible')

    const { clientSecret } = await response.json()
    elements = stripe.elements({ clientSecret })
    
    const container = document.getElementById('payment-element')
    if (container) {
      container.innerHTML = ''
      const paymentElement = elements.create('payment')
      paymentElement.mount('#payment-element')
    }
  } catch (err) {
    errorMessage.value = 'Error al conectar con la pasarela de Stripe.'
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
    errorMessage.value = error.message || 'Error en el pago'
  } else {
    successMessage.value = '¡Pago completado con éxito!'
    carrito.value = []
  }
  loading.value = false
}

const inicializarPayPal = async () => {
  try {
    const container = document.getElementById('paypal-button-container')
    if (container) container.innerHTML = ''

    await loadScript({
      clientId: 'Ac4GatJUdAtxsm5T4o78OX98n6FMEzqem0IQxooGaAisfqCK-wVunrLLNQUjNX2jnUKiFr100wmy0WK1',
      currency: 'USD'
    })

    if ((window as any).paypal) {
      ;(window as any).paypal.Buttons({
        createOrder: async () => {
          const response = await fetch(`${API_BASE_URL}/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total() })
          })
          const order = await response.json()
          return order.id
        },
        onApprove: async (data: any) => {
          await fetch(`${API_BASE_URL}/paypal/capture-order/${data.orderID}`, { method: 'POST' })
          successMessage.value = '¡Pago realizado con éxito vía PayPal!'
          carrito.value = []
        }
      }).render('#paypal-button-container')
    }
  } catch (e) {
    errorMessage.value = 'Error al conectar con PayPal.'
  }
}

const cerrarModal = () => mostrarModal.value = false
</script>

<template>
  <div class="shop-container">
    <header class="shop-header">
      <div>
        <h1>🛒 Tienda Exótica</h1>
        <p>Suministros y equipamiento especializado para tus mascotas exóticas</p>
      </div>
      <div class="cart-summary">
        <span>🛒 {{ carrito.length }} productos</span>
        <strong>${{ total() }} MXN</strong>
        <button class="btn-checkout" @click="abrirCheckout" :disabled="carrito.length === 0">
          Pagar Carrito
        </button>
      </div>
    </header>

    <div class="product-grid">
      <div v-for="prod in productos" :key="prod.id" class="product-card">
        <div class="product-emoji">{{ prod.emoji }}</div>
        <span class="product-badge">{{ prod.categoria }}</span>
        <h3>{{ prod.nombre }}</h3>
        <p class="product-desc">{{ prod.desc }}</p>
        <div class="product-footer">
          <span class="price">${{ prod.precio }} <small>MXN</small></span>
          <button class="btn-add" @click="agregarAlCarrito(prod)">+ Agregar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Checkout Estilizado -->
    <div v-if="mostrarModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Finalizar Compra</h3>
          <button class="btn-close" @click="cerrarModal">✕</button>
        </div>

        <p class="modal-total">Total a pagar: <strong>${{ total() }} MXN</strong></p>

        <div class="payment-tabs">
          <button :class="{ active: metodoPago === 'stripe' }" @click="cambiarMetodo('stripe')">
            💳 Tarjeta (Stripe)
          </button>
          <button :class="{ active: metodoPago === 'paypal' }" @click="cambiarMetodo('paypal')">
            🅿️ PayPal
          </button>
        </div>

        <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

        <div v-show="metodoPago === 'stripe'" class="payment-body">
          <div id="payment-element" class="stripe-box"></div>
          <button class="btn-pay" @click="handleStripeSubmit" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Confirmar y Pagar' }}
          </button>
        </div>

        <div v-show="metodoPago === 'paypal'" class="payment-body">
          <div id="paypal-button-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; font-family: system-ui, -apple-system, sans-serif; }
.shop-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.shop-header h1 { font-size: 2rem; margin: 0; color: #111827; }
.shop-header p { margin: 0.25rem 0 0 0; color: #6b7280; }
.cart-summary { display: flex; align-items: center; gap: 1rem; background: #f3f4f6; padding: 0.75rem 1.25rem; border-radius: 12px; }
.btn-checkout { background: #059669; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-checkout:disabled { background: #9ca3af; cursor: not-allowed; }
.btn-checkout:hover:not(:disabled) { background: #047857; }

.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
.product-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; position: relative; transition: transform 0.2s, box-shadow 0.2s; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
.product-emoji { font-size: 3rem; text-align: center; margin-bottom: 0.5rem; }
.product-badge { background: #ecfdf5; color: #047857; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 6px; align-self: flex-start; margin-bottom: 0.5rem; }
.product-card h3 { font-size: 1.1rem; margin: 0 0 0.5rem 0; color: #1f2937; }
.product-desc { font-size: 0.875rem; color: #6b7280; flex-grow: 1; margin-bottom: 1rem; }
.product-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.price { font-size: 1.25rem; font-weight: 800; color: #111827; }
.price small { font-size: 0.75rem; font-weight: 400; color: #6b7280; }
.btn-add { background: #2563eb; color: white; border: none; padding: 0.5rem 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-add:hover { background: #1d4ed8; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal-card { background: white; padding: 2rem; border-radius: 20px; width: 440px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-close { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
.modal-total { font-size: 1.1rem; text-align: center; margin-bottom: 1.5rem; background: #f9fafb; padding: 0.75rem; border-radius: 8px; }
.payment-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.payment-tabs button { flex: 1; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer; font-weight: 600; }
.payment-tabs button.active { background: #111827; color: white; border-color: #111827; }
.alert { padding: 0.75rem; border-radius: 8px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.stripe-box { margin-bottom: 1rem; }
.btn-pay { width: 100%; background: #059669; color: white; border: none; padding: 0.8rem; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 1rem; }
</style>