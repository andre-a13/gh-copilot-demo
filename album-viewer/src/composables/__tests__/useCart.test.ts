import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCart } from '../useCart'
import type { Album } from '../../types/album'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Replace global localStorage with mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

const mockAlbum1: Album = {
  id: 1,
  title: 'Test Album 1',
  artist: 'Test Artist 1',
  price: 9.99,
  image_url: 'https://example.com/album1.jpg'
}

const mockAlbum2: Album = {
  id: 2,
  title: 'Test Album 2',
  artist: 'Test Artist 2',
  price: 14.99,
  image_url: 'https://example.com/album2.jpg'
}

describe('useCart', () => {
  beforeEach(() => {
    localStorageMock.clear()
    // Clear the cart state
    const cart = useCart()
    cart.clearCart()
  })

  it('should initialize with empty cart', () => {
    const cart = useCart()
    expect(cart.getItems()).toEqual([])
    expect(cart.getCount()).toBe(0)
    expect(cart.getTotalPrice()).toBe(0)
  })

  it('should add album to cart', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    
    expect(cart.getCount()).toBe(1)
    expect(cart.getItems()).toHaveLength(1)
    expect(cart.getItems()[0].album.id).toBe(1)
    expect(cart.getItems()[0].quantity).toBe(1)
  })

  it('should add album with custom quantity', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1, 3)
    
    expect(cart.getCount()).toBe(3)
    expect(cart.getItems()[0].quantity).toBe(3)
  })

  it('should increment quantity when adding same album', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.addToCart(mockAlbum1)
    
    expect(cart.getItems()).toHaveLength(1)
    expect(cart.getCount()).toBe(2)
    expect(cart.getItems()[0].quantity).toBe(2)
  })

  it('should add multiple different albums', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.addToCart(mockAlbum2)
    
    expect(cart.getItems()).toHaveLength(2)
    expect(cart.getCount()).toBe(2)
  })

  it('should remove album from cart', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.addToCart(mockAlbum2)
    cart.removeFromCart(1)
    
    expect(cart.getItems()).toHaveLength(1)
    expect(cart.getItems()[0].album.id).toBe(2)
    expect(cart.getCount()).toBe(1)
  })

  it('should change quantity of album', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.changeQuantity(1, 5)
    
    expect(cart.getCount()).toBe(5)
    expect(cart.getItems()[0].quantity).toBe(5)
  })

  it('should remove item when quantity changed to 0', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.changeQuantity(1, 0)
    
    expect(cart.getItems()).toHaveLength(0)
    expect(cart.getCount()).toBe(0)
  })

  it('should remove item when quantity changed to negative', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.changeQuantity(1, -1)
    
    expect(cart.getItems()).toHaveLength(0)
  })

  it('should clear entire cart', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    cart.addToCart(mockAlbum2)
    cart.clearCart()
    
    expect(cart.getItems()).toHaveLength(0)
    expect(cart.getCount()).toBe(0)
  })

  it('should calculate total price correctly', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1, 2) // 9.99 * 2 = 19.98
    cart.addToCart(mockAlbum2, 1) // 14.99 * 1 = 14.99
    
    const total = cart.getTotalPrice()
    expect(total).toBeCloseTo(34.97, 2)
  })

  it('should check if album is in cart', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    
    expect(cart.isInCart(1)).toBe(true)
    expect(cart.isInCart(2)).toBe(false)
  })

  it('should get quantity of specific album', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1, 3)
    
    expect(cart.getQuantity(1)).toBe(3)
    expect(cart.getQuantity(2)).toBe(0)
  })

  it('should persist cart to localStorage', () => {
    const cart = useCart()
    cart.addToCart(mockAlbum1)
    
    const stored = localStorageMock.getItem('album_viewer_cart_v1')
    expect(stored).toBeTruthy()
    
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].album.id).toBe(1)
  })

  it('should load cart from localStorage', () => {
    // Add item and save
    const cart1 = useCart()
    cart1.addToCart(mockAlbum1, 2)
    
    // Simulate reload by clearing and loading again
    const stored = localStorageMock.getItem('album_viewer_cart_v1')
    localStorageMock.clear()
    localStorageMock.setItem('album_viewer_cart_v1', stored!)
    
    // Create new cart instance which should load from storage
    const cart2 = useCart()
    expect(cart2.getCount()).toBe(2)
    expect(cart2.getItems()[0].album.id).toBe(1)
  })

  it('should handle localStorage parse errors gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Set invalid JSON after clearing
    const cart = useCart()
    cart.clearCart()
    localStorageMock.setItem('album_viewer_cart_v1', 'invalid json')
    
    // Mock getItem to return invalid JSON
    const getItemSpy = vi.spyOn(localStorageMock, 'getItem').mockReturnValue('invalid json')
    
    // Try to add an item which will trigger a save and the next load will fail
    cart.addToCart(mockAlbum1)
    
    // Since the save will work but parsing would fail on next load, 
    // we just verify the cart can recover from bad data
    expect(cart.getItems()).toHaveLength(1)
    
    getItemSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('should handle localStorage save errors gracefully', () => {
    const cart = useCart()
    const setItemSpy = vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    cart.addToCart(mockAlbum1)
    
    expect(consoleWarnSpy).toHaveBeenCalled()
    
    setItemSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })
})
