"use client"

import { useCartStore } from "../store/useCartStore"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

export default function Cart({ onClose }) {
  const { cart, removeFromCart, clearCart, addToCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  const total = cart.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id)
    } else {
      // Remove the item and add it back with the new quantity
      removeFromCart(item.id)
      addToCart({
        ...item,
        quantity: newQuantity,
      })
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    setCheckoutError(null)

    try {
      // Simulate checkout process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, we'll just clear the cart
      clearCart()
      alert("Checkout successful! This is a demo, so no actual purchase was made.")
      onClose()
    } catch (error) {
      console.error("Checkout error:", error)
      setCheckoutError("There was an error processing your checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-80 h-full bg-black text-white p-6 z-50 shadow-lg overflow-y-auto border-l border-white/10"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl">Your Cart</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      {cart.length === 0 && <p className="text-gray-400">Cart is empty</p>}

      <AnimatePresence>
        {cart.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center justify-between mb-4 border-b border-white/10 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden mr-3">
                <Image
                  src={
                    item.imageUrl ||
                    "/assets/mockup11.png"
                  }
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                {item.size && (
                  <p className="text-xs text-gray-400">Size: {item.size}</p>
                )}
                <div className="flex items-center mt-1">
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="mx-2 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">${Number.parseFloat(item.price).toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 ml-2">
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {cart.length > 0 && (
        <div className="mt-auto pt-4 border-t border-white/10">
          <p className="text-lg mb-4">Total: ${total.toFixed(2)}</p>

          {checkoutError && <div className="bg-red-900/50 text-red-200 p-2 rounded mb-4 text-sm">{checkoutError}</div>}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed mb-2 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Checkout"
            )}
          </button>
          <button
            onClick={clearCart}
            className="w-full py-2 border border-white text-white rounded-lg hover:bg-white/10"
          >
            Clear Cart
          </button>
        </div>
      )}
    </motion.div>
  )
}

