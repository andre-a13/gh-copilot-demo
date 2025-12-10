<template>
  <button 
    class="cart-icon"
    @click="emit('toggle')"
    :aria-label="`Shopping cart with ${count} items`"
    type="button"
  >
    <svg 
      class="cart-svg" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span v-if="count > 0" class="cart-badge">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCart } from '../composables/useCart'

const emit = defineEmits<{
  toggle: []
}>()

const cart = useCart()
const count = computed(() => cart.getCount())
</script>

<style scoped>
.cart-icon {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.cart-icon:hover {
  background: white;
  transform: scale(1.1);
}

.cart-icon:hover .cart-svg {
  color: #667eea;
}

.cart-icon:focus {
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.cart-svg {
  width: 28px;
  height: 28px;
  color: white;
  transition: color 0.3s ease;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .cart-icon {
    width: 48px;
    height: 48px;
  }
  
  .cart-svg {
    width: 24px;
    height: 24px;
  }
}
</style>
