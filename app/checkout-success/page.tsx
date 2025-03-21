"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { useCartStore } from "@/store/useCartStore"
import { motion } from "framer-motion"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)

  // Clear the cart when the page loads
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="flex flex-col items-center justify-center px-8 py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-4 text-center"
        >
          Order Successful!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 text-center max-w-md mb-8"
        >
          Thank you for your purchase. Your order has been received and is being processed.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 w-full max-w-md"
        >
          <button
            onClick={() => router.push("/releases")}
            className="w-full py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </div>
  )
}

