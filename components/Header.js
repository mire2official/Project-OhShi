"use client"

import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import Cart from "./Cart"
import { useCartStore } from "../store/useCartStore"

console.log("Header component loaded");

export default function Header() {
  const [showCart, setShowCart] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [hoveredLetter, setHoveredLetter] = useState(null)
  const logoRef = useRef(null)
  const pathname = usePathname()

  // Use useEffect to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const logoLetters = "ORVELLO".split("");

  const cart = useCartStore((state) => state.cart)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
      {/* Left: Logo with letter animations */}
      <div 
        className="logo-container relative"
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => {
          setIsLogoHovered(false);
          setHoveredLetter(null);
        }}
        ref={logoRef}
      >
        {/* Simplified glow background */}
        <div 
          className="absolute inset-0 rounded-md"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 80%)',
            filter: 'blur(6px)',
            opacity: 0.6,
            transform: 'translateZ(0)'
          }}
        />
        
        <Link href="/" className="text-xl font-semibold z-10 relative logo-text-container">
          <div className="flex">
            {logoLetters.map((letter, index) => (
              <span 
                key={index}
                className="animated-letter"
                onMouseEnter={() => setHoveredLetter(index)}
                onMouseLeave={() => setHoveredLetter(null)}
                style={{
                  display: 'inline-block',
                  transition: 'all 0.3s ease-out',
                  position: 'relative',
                  transform: hoveredLetter === index 
                    ? 'translateY(-5px) scale(1.1)' 
                    : isLogoHovered 
                      ? `translateY(${Math.sin((index * 0.5) + 1) * 2}px)` 
                      : 'translateY(0)',
                  textShadow: hoveredLetter === index
                    ? '0 0 15px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.5)'
                    : isLogoHovered
                      ? '0 0 10px rgba(255,255,255,0.7), 0 0 15px rgba(215,235,255,0.5)'
                      : '0 0 8px rgba(255,255,255,0.5), 0 0 15px rgba(215,235,255,0.3)',
                  color: hoveredLetter === index ? '#fff' : undefined,
                  animation: isLogoHovered ? `subtle-float 2s ease-in-out infinite alternate ${index * 0.07}s` : 'none',
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </Link>
        
        {/* Palm Tree Image */}
        <div className="z-10 relative ml-2">
          <img 
            src="/assets/palmtree.png" 
            alt="Palm Tree" 
            className="h-8 w-auto"
            style={{
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.4))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              transform: isLogoHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
            }}
          />
        </div>
      </div>

      {/* Center: Nav Links */}
      <nav className="space-x-8">
        <Link
          href="/releases"
          className={`hover:text-gray-400 transition-colors ${pathname === "/releases" ? "text-gray-400 font-medium" : ""}`}
        >
          Latest Releases
        </Link>
        <Link
          href="/collections"
          className={`hover:text-gray-400 transition-colors ${pathname === "/collections" ? "text-gray-400 font-medium" : ""}`}
        >
          Collections
        </Link>
      </nav>

      {/* Right: Cart Icon */}
      <div className="relative">
        <button
          className="hover:text-gray-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] p-2 rounded-full"
          onClick={() => setShowCart(!showCart)}
          aria-label="Shopping cart"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {mounted && cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
        <AnimatePresence>{showCart && <Cart onClose={() => setShowCart(false)} />}</AnimatePresence>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .logo-container {
          padding: 0.5rem 1rem;
          overflow: hidden;
          position: relative;
          border-radius: 0.5rem;
          min-width: 120px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-text-container {
          letter-spacing: 0.1em;
          font-weight: 500;
          margin-right: 4px;
          display: flex;
          align-items: center;
        }
        
        .animated-letter {
          margin: 0 1px;
          cursor: default;
        }
        
        /* Single subtle float animation for all letters */
        @keyframes subtle-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
      `}</style>
    </header>
  )
}

