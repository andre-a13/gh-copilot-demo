<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="drawer-overlay" @click="emit('close')">
        <div class="drawer" @click.stop role="dialog" aria-labelledby="cart-title" aria-modal="true">
          <div class="drawer-header">
            <h2 id="cart-title">Shopping Cart</h2>
            <button 
              class="close-btn" 
              @click="emit('close')"
              aria-label="Close cart"
              type="button"
            >
              ✕
            </button>
          </div>

          <div class="drawer-content">
            <div v-if="cart.items.value.length === 0" class="empty-cart">
              <svg 
                class="empty-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Your cart is empty</p>
            </div>

            <div v-else class="cart-items">
              <div 
                v-for="item in cart.items.value" 
                :key="item.id" 
                class="cart-item"
              >
                <img 
                  :src="item.album.image_url" 
                  :alt="item.album.title"
                  class="item-image"
                  @error="handleImageError"
                />
                <div class="item-details">
                  <h3 class="item-title">{{ item.album.title }}</h3>
                  <p class="item-artist">{{ item.album.artist }}</p>
                  <p class="item-price">${{ item.album.price.toFixed(2) }}</p>
                </div>
                <div class="item-controls">
                  <div class="quantity-controls">
                    <button 
                      class="qty-btn"
                      @click="decrementQuantity(item.album.id)"
                      :aria-label="`Decrease quantity of ${item.album.title}`"
                      type="button"
                    >
                      -
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button 
                      class="qty-btn"
                      @click="incrementQuantity(item.album.id)"
                      :aria-label="`Increase quantity of ${item.album.title}`"
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    class="remove-btn"
                    @click="cart.removeFromCart(item.album.id)"
                    :aria-label="`Remove ${item.album.title} from cart`"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="cart.items.value.length > 0" class="drawer-footer">
            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${{ cart.getTotalPrice().toFixed(2) }}</span>
              </div>
              <div class="total-row total-main">
                <span class="total-label">Total:</span>
                <span class="total-value">${{ cart.getTotalPrice().toFixed(2) }}</span>
              </div>
            </div>
            <button class="checkout-btn" type="button">
              Proceed to Checkout
            </button>
            <button class="clear-btn" @click="handleClearCart" type="button">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCart } from '../composables/useCart'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const cart = useCart()

const incrementQuantity = (albumId: number): void => {
  const currentQty = cart.getQuantity(albumId)
  cart.changeQuantity(albumId, currentQty + 1)
}

const decrementQuantity = (albumId: number): void => {
  const currentQty = cart.getQuantity(albumId)
  cart.changeQuantity(albumId, currentQty - 1)
}

const handleClearCart = (): void => {
  if (confirm('Are you sure you want to clear your cart?')) {
    cart.clearCart()
  }
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/80x80/667eea/white?text=Album'
}

// Close drawer on Escape key
const handleEscape = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}

.drawer {
  background: white;
  width: 100%;
  max-width: 450px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #667eea;
  color: white;
}

.drawer-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  color: #ccc;
}

.empty-cart p {
  font-size: 1.2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-artist {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}

.item-price {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #667eea;
}

.item-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 20px;
  padding: 0.25rem;
  border: 1px solid #e0e0e0;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

.quantity {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: #333;
}

.remove-btn {
  background: transparent;
  border: 1px solid #ff4757;
  color: #ff4757;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ff4757;
  color: white;
}

.drawer-footer {
  border-top: 1px solid #e0e0e0;
  padding: 1.5rem;
  background: #f9f9f9;
}

.total-section {
  margin-bottom: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #666;
}

.total-row.total-main {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 0.5rem;
}

.total-value {
  color: #667eea;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
}

.checkout-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.clear-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: #ff4757;
  border: 1px solid #ff4757;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #ff4757;
  color: white;
}

/* Transition animations */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .drawer {
    max-width: 100%;
  }
  
  .cart-item {
    flex-direction: column;
  }
  
  .item-controls {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
