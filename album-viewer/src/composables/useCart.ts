import { ref, computed } from 'vue'
import type { Album } from '../types/album'

export interface CartItem {
  id: number
  album: Album
  quantity: number
}

const STORAGE_KEY = 'album_viewer_cart_v1'

// Shared reactive state
const items = ref<CartItem[]>([])

// Load cart from localStorage on init
const loadCart = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        items.value = parsed
      }
    }
  } catch (err) {
    console.warn('Failed to load cart from localStorage:', err)
    items.value = []
  }
}

// Save cart to localStorage
const saveCart = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  } catch (err) {
    console.warn('Failed to save cart to localStorage:', err)
  }
}

// Initialize cart on first import
loadCart()

export const useCart = () => {
  const getItems = (): CartItem[] => {
    return items.value
  }

  const getCount = (): number => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  }

  const addToCart = (album: Album, qty: number = 1): void => {
    const existingItem = items.value.find(item => item.album.id === album.id)
    
    if (existingItem) {
      existingItem.quantity += qty
    } else {
      items.value.push({
        id: album.id,
        album,
        quantity: qty
      })
    }
    
    saveCart()
  }

  const removeFromCart = (albumId: number): void => {
    items.value = items.value.filter(item => item.album.id !== albumId)
    saveCart()
  }

  const changeQuantity = (albumId: number, newQty: number): void => {
    if (newQty <= 0) {
      removeFromCart(albumId)
      return
    }
    
    const item = items.value.find(item => item.album.id === albumId)
    if (item) {
      item.quantity = newQty
      saveCart()
    }
  }

  const clearCart = (): void => {
    items.value = []
    saveCart()
  }

  const getTotalPrice = (): number => {
    return items.value.reduce((sum, item) => sum + (item.album.price * item.quantity), 0)
  }

  const isInCart = (albumId: number): boolean => {
    return items.value.some(item => item.album.id === albumId)
  }

  const getQuantity = (albumId: number): number => {
    const item = items.value.find(item => item.album.id === albumId)
    return item ? item.quantity : 0
  }

  return {
    items: computed(() => items.value),
    getItems,
    getCount,
    addToCart,
    removeFromCart,
    changeQuantity,
    clearCart,
    getTotalPrice,
    isInCart,
    getQuantity
  }
}
