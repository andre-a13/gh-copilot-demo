import { test, expect } from '@playwright/test'

test.describe('Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    
    // Wait for albums to load
    await page.waitForSelector('.album-card', { timeout: 10000 })
  })

  test('should display cart icon in header', async ({ page }) => {
    await page.goto('/')
    
    // Check if cart icon is visible
    const cartIcon = page.locator('.cart-icon')
    await expect(cartIcon).toBeVisible()
    
    // Initially cart should have no badge (or badge with 0)
    const badge = page.locator('.cart-badge')
    await expect(badge).not.toBeVisible()
  })

  test('should add album to cart and update count', async ({ page }) => {
    await page.goto('/')
    
    // Wait for albums to load
    await page.waitForSelector('.album-card')
    
    // Click "Add to Cart" button on the first album
    const firstAddButton = page.locator('.album-card .btn-primary').first()
    await firstAddButton.click()
    
    // Wait for the button text to change
    await page.waitForTimeout(500)
    
    // Check if cart badge appears with count of 1
    const badge = page.locator('.cart-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('1')
    
    // Verify "In cart" status appears
    const inCartStatus = page.locator('.in-cart-status').first()
    await expect(inCartStatus).toBeVisible()
    await expect(inCartStatus).toContainText('In cart')
  })

  test('should add multiple albums to cart', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add first album
    const firstAddButton = page.locator('.album-card .btn-primary').first()
    await firstAddButton.click()
    await page.waitForTimeout(300)
    
    // Add second album
    const secondAddButton = page.locator('.album-card .btn-primary').nth(1)
    await secondAddButton.click()
    await page.waitForTimeout(300)
    
    // Check cart count is 2
    const badge = page.locator('.cart-badge')
    await expect(badge).toHaveText('2')
  })

  test('should open cart drawer when clicking cart icon', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album first
    const addButton = page.locator('.album-card .btn-primary').first()
    await addButton.click()
    await page.waitForTimeout(300)
    
    // Click cart icon
    const cartIcon = page.locator('.cart-icon')
    await cartIcon.click()
    
    // Check if drawer is visible
    const drawer = page.locator('.drawer')
    await expect(drawer).toBeVisible()
    
    // Check if drawer has correct title
    const drawerTitle = page.locator('#cart-title')
    await expect(drawerTitle).toHaveText('Shopping Cart')
  })

  test('should display cart items in drawer', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    const addButton = page.locator('.album-card .btn-primary').first()
    await addButton.click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Check cart items
    const cartItems = page.locator('.cart-item')
    await expect(cartItems).toHaveCount(1)
    
    // Verify item has image, title, artist, price, and quantity
    const cartItem = cartItems.first()
    await expect(cartItem.locator('.item-image')).toBeVisible()
    await expect(cartItem.locator('.item-title')).toBeVisible()
    await expect(cartItem.locator('.item-artist')).toBeVisible()
    await expect(cartItem.locator('.item-price')).toBeVisible()
    await expect(cartItem.locator('.quantity')).toHaveText('1')
  })

  test('should increment quantity in cart drawer', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Click increment button
    const incrementBtn = page.locator('.qty-btn').last()
    await incrementBtn.click()
    
    // Verify quantity changed to 2
    const quantity = page.locator('.quantity')
    await expect(quantity).toHaveText('2')
    
    // Verify cart badge also updated
    const badge = page.locator('.cart-badge')
    await expect(badge).toHaveText('2')
  })

  test('should decrement quantity in cart drawer', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album twice
    const addButton = page.locator('.album-card .btn-primary').first()
    await addButton.click()
    await page.waitForTimeout(300)
    await addButton.click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Click decrement button
    const decrementBtn = page.locator('.qty-btn').first()
    await decrementBtn.click()
    
    // Verify quantity changed to 1
    const quantity = page.locator('.quantity')
    await expect(quantity).toHaveText('1')
  })

  test('should remove item when quantity decremented to 0', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Click decrement button to remove
    const decrementBtn = page.locator('.qty-btn').first()
    await decrementBtn.click()
    
    // Verify empty cart message
    const emptyMessage = page.locator('.empty-cart')
    await expect(emptyMessage).toBeVisible()
    await expect(emptyMessage).toContainText('Your cart is empty')
    
    // Verify badge is not visible
    const badge = page.locator('.cart-badge')
    await expect(badge).not.toBeVisible()
  })

  test('should remove item with Remove button', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Click remove button
    const removeBtn = page.locator('.remove-btn')
    await removeBtn.click()
    
    // Verify empty cart message
    const emptyMessage = page.locator('.empty-cart')
    await expect(emptyMessage).toBeVisible()
  })

  test('should display correct total price', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add first album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Check that total section is visible
    const totalSection = page.locator('.total-section')
    await expect(totalSection).toBeVisible()
    
    // Check that total value exists
    const totalValue = page.locator('.total-main .total-value')
    await expect(totalValue).toBeVisible()
  })

  test('should close drawer when clicking close button', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Click close button
    await page.locator('.close-btn').click()
    
    // Verify drawer is closed
    const drawer = page.locator('.drawer')
    await expect(drawer).not.toBeVisible()
  })

  test('should close drawer when clicking overlay', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Click overlay
    await page.locator('.drawer-overlay').click({ position: { x: 10, y: 10 } })
    
    // Verify drawer is closed
    const drawer = page.locator('.drawer')
    await expect(drawer).not.toBeVisible()
  })

  test('should close drawer with Escape key', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Press Escape key
    await page.keyboard.press('Escape')
    
    // Verify drawer is closed
    const drawer = page.locator('.drawer')
    await expect(drawer).not.toBeVisible()
  })

  test('should clear entire cart', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add multiple albums
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    await page.locator('.album-card .btn-primary').nth(1).click()
    await page.waitForTimeout(300)
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    
    // Set up dialog handler for confirm
    page.on('dialog', dialog => dialog.accept())
    
    // Click clear cart button
    await page.locator('.clear-btn').click()
    
    // Verify empty cart message
    const emptyMessage = page.locator('.empty-cart')
    await expect(emptyMessage).toBeVisible()
  })

  test('should persist cart to localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Reload page
    await page.reload()
    await page.waitForSelector('.album-card')
    
    // Check cart count persists
    const badge = page.locator('.cart-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('1')
    
    // Open cart and verify item is still there
    await page.locator('.cart-icon').click()
    const cartItems = page.locator('.cart-item')
    await expect(cartItems).toHaveCount(1)
  })

  test('should handle keyboard navigation for cart icon', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(300)
    
    // Focus cart icon with Tab and activate with Enter
    const cartIcon = page.locator('.cart-icon')
    await cartIcon.focus()
    await page.keyboard.press('Enter')
    
    // Verify drawer opens
    const drawer = page.locator('.drawer')
    await expect(drawer).toBeVisible()
  })

  test('should show correct quantity when same album added multiple times', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Add same album 3 times
    const addButton = page.locator('.album-card .btn-primary').first()
    await addButton.click()
    await page.waitForTimeout(200)
    await addButton.click()
    await page.waitForTimeout(200)
    await addButton.click()
    await page.waitForTimeout(300)
    
    // Check cart count is 3
    const badge = page.locator('.cart-badge')
    await expect(badge).toHaveText('3')
    
    // Open cart and verify only one item with quantity 3
    await page.locator('.cart-icon').click()
    const cartItems = page.locator('.cart-item')
    await expect(cartItems).toHaveCount(1)
    
    const quantity = page.locator('.quantity')
    await expect(quantity).toHaveText('3')
  })

  test('should take screenshots of cart functionality', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.album-card')
    
    // Screenshot 1: Initial state
    await page.screenshot({ path: 'e2e/screenshots/01-initial-state.png', fullPage: true })
    
    // Add an album
    await page.locator('.album-card .btn-primary').first().click()
    await page.waitForTimeout(500)
    
    // Screenshot 2: After adding to cart
    await page.screenshot({ path: 'e2e/screenshots/02-item-added.png', fullPage: true })
    
    // Open cart drawer
    await page.locator('.cart-icon').click()
    await page.waitForTimeout(500)
    
    // Screenshot 3: Cart drawer open
    await page.screenshot({ path: 'e2e/screenshots/03-cart-drawer-open.png', fullPage: true })
    
    // Add more items
    await page.locator('.close-btn').click()
    await page.waitForTimeout(300)
    await page.locator('.album-card .btn-primary').nth(1).click()
    await page.waitForTimeout(300)
    await page.locator('.album-card .btn-primary').nth(2).click()
    await page.waitForTimeout(300)
    
    // Screenshot 4: Multiple items in cart
    await page.locator('.cart-icon').click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'e2e/screenshots/04-multiple-items.png', fullPage: true })
  })
})
