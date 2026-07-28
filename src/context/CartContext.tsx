import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

// ======================================================
// سياق سلة التسوق (Cart Context)
// يُدار بالكامل على جانب العميل مع حفظ في localStorage
// ======================================================

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

const CART_STORAGE_KEY = 'shams_syria_cart'

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(item => item.product.id === action.product.id)
      if (existing) {
        // زيادة الكمية إن كان المنتج موجوداً
        return state.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: Math.min(item.quantity + action.quantity, action.product.stock_quantity) }
            : item
        )
      }
      return [...state, { product: action.product, quantity: action.quantity }]
    }

    case 'REMOVE_ITEM':
      return state.filter(item => item.product.id !== action.productId)

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return state.filter(item => item.product.id !== action.productId)
      }
      return state.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: Math.min(action.quantity, item.product.stock_quantity) }
          : item
      )
    }

    case 'CLEAR_CART':
      return []

    case 'LOAD_CART':
      return action.items

    default:
      return state
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [], () => {
    // تحميل السلة من localStorage عند أول تشغيل
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // حفظ السلة في localStorage عند كل تغيير
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity })
  }

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })
  }

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const isInCart = (productId: string) => items.some(item => item.product.id === productId)

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart يجب استخدامه داخل CartProvider')
  return context
}
