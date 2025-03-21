"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCartStore } from "../store/useCartStore"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

export default function ProductCard({ product, isComingSoon = false }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const emailInputRef = useRef(null)
  const router = useRouter()
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)
  
  // Reset image error state when product changes
  useEffect(() => {
    setImageError(false)
  }, [product])
  
  // Check if product is in cart
  useEffect(() => {
    const productInCart = cart.find(item => 
      item.variantId === product.id
    );
    setIsInCart(!!productInCart);
  }, [cart, product.id]);
  
  const handleViewDetails = (e) => {
    e.preventDefault()
    
    // If it's not a coming soon product, navigate to product page
    if (!isComingSoon) {
      router.push(`/product/${product.handle}`)
    } else {
      // Show email popup for coming soon products
      setShowEmailPopup(true)
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
    }
  }

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddOpen(true);
  }

  const handleAddToCart = (size) => {
    setSelectedSize(size);
    setIsLoading(true);

    // Add a slight delay to simulate processing
    setTimeout(() => {
      addToCart({
        id: `${product.id}-${size}`, // Unique ID for each size variant
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0] || "/assets/mockup11.png",
        variantId: product.id,
        size: size,
      });
      setIsLoading(false);
      setQuickAddOpen(false);
      setIsInCart(true);
    }, 300);
  }

  const handleSubmitEmail = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) return
    
    setIsSubmitting(true)
    
    // Simulate API call to store email
    try {
      // In a real app, this would be an API call to store the email
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSubmitSuccess(true)
      
      // Close popup after success message
      setTimeout(() => {
        setShowEmailPopup(false)
        setEmail("")
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error submitting email:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Display name
  const getDisplayName = (originalName) => {
    if (originalName === "Peace Tee") return "Luxury Garment"
    if (originalName === "Unity Tee") return "Luxury Accessories"
    return originalName
  }
  
  const displayName = getDisplayName(product.name)
  
  // Use mockup images only for Freedom Tee, no images for coming soon products
  const isFreedomTee = product.name === "Freedom Tee"
  const frontImage = isFreedomTee ? ("/assets/mockup11.png") : (product.images?.[0] || product.imageUrl || "")
  const backImage = isFreedomTee ? ("/assets/mockup22.png") : (product.images?.[1] || product.imageUrl || "")
  
  // Handle image load errors
  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div 
      className={`group relative p-4 transition-all duration-500 ${
        isComingSoon 
          ? 'teardrop-container' 
          : 'rounded-lg hover:bg-white/5'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...(isComingSoon ? {
          minHeight: '400px',
          WebkitFontSmoothing: 'antialiased',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none'
        } : {})
      }}
    >
      {/* Base layer with clean glow effect for coming soon products */}
      {isComingSoon && (
        <>
          {/* Main teardrop glow - no containing box */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ overflow: 'visible', zIndex: 0 }}>
            <div 
              className="teardrop-glow pulse-scale"
              style={{
                width: '75%',
                height: '90%',
                position: 'relative',
                mixBlendMode: 'screen'
              }}
            >
              {/* Core teardrop glow */}
              <div 
                className="absolute inset-0 transition-all duration-700 ease-natural"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, rgba(200,200,255,0.08) 40%, rgba(150,150,255,0.02) 75%)',
                  filter: 'blur(8px)',
                  mixBlendMode: 'screen'
                }}
              />
              
              {/* Colored elements inside teardrop */}
              <div className="absolute inset-0 overflow-visible">
                {/* Red glow */}
                <div 
                  className="absolute w-40 h-40 rounded-full bg-red-700/25 filter blur-3xl mix-blend-screen pulse-opacity"
                  style={{
                    bottom: '20%',
                    left: '25%',
                  }}
                />
                
                {/* Blue glow */}
                <div 
                  className="absolute w-40 h-40 rounded-full bg-blue-700/25 filter blur-3xl mix-blend-screen pulse-opacity-delayed"
                  style={{
                    bottom: '30%',
                    right: '25%',
                  }}
                />
                
                {/* Purple intersection naturally forms from red + blue overlap with screen blend mode */}
              </div>
              
              {/* Edge diffusion overlay */}
              <div
                className="absolute inset-0"
                style={{
                  boxShadow: 'inset 0 0 30px 10px rgba(255,255,255,0.08)',
                  filter: 'blur(15px)',
                  mixBlendMode: 'screen'
                }}
              />
              
              {/* Extended glow - ensures no visible boundary */}
              <div
                className="absolute"
                style={{
                  inset: '-50px',
                  borderRadius: 'inherit',
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
          
          {/* Center all content perfectly */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full text-center">
            {/* Coming Soon text - centered and always visible */}
            <div className="transition-all duration-500 ease-natural opacity-100 transform scale-100 absolute">
              <div 
                className="text-white text-opacity-90 font-medium text-2xl tracking-wide py-3 px-7"
                style={{
                  textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2)',
                  letterSpacing: '0.05em'
                }}
              >
                COMING SOON
              </div>
            </div>
            
            {/* Product name with subtle hover effect */}
            <div 
              className={`transition-all duration-500 ease-natural mt-auto pt-8 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 
                className="text-lg font-medium text-white transition-all duration-500 ease-natural my-2"
                style={{
                  letterSpacing: isHovered ? '0.03em' : '0em',
                  fontSize: isHovered ? 'calc(1.125rem + 1pt)' : '1.125rem'
                }}
              >
                {displayName}
              </h3>
              
              {/* Notify button with subtle hover effect */}
              <button
                onClick={handleViewDetails}
                className="mt-4 px-6 py-2.5 border border-white/30 rounded-full backdrop-blur-sm text-white transition-all duration-500 ease-natural notify-button"
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  background: 'rgba(0,0,0,0.1)'
                }}
              >
                Notify Me
              </button>
              
              {/* Exclusive label */}
              <div 
                className="mt-4 flex items-center justify-center text-center opacity-80"
              >
                <div className="h-px w-8 bg-white opacity-30 mr-3"></div>
                <span className="text-white text-xs tracking-widest uppercase">Orvello Exclusive</span>
                <div className="h-px w-8 bg-white opacity-30 ml-3"></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Product display area - only for non-coming-soon products */}
      {!isComingSoon && (
        <div className="block">
          <div
            className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-900 lg:aspect-none lg:h-80 relative"
          >
            {/* IN CART indicator */}
            <AnimatePresence>
              {isInCart && (
                <motion.div 
                  className="absolute top-1/3 left-0 right-0 z-20 flex justify-center items-center pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="relative">
                    {/* Arched text background */}
                    <div 
                      className="absolute inset-0 bg-white/80 rounded-full w-48 h-16 mx-auto"
                      style={{ 
                        filter: 'blur(8px)',
                        transform: 'perspective(40px) rotateX(5deg)',
                      }}
                    ></div>
                    
                    {/* Arched text */}
                    <div className="relative">
                      <svg viewBox="0 0 500 100" className="w-48 h-16 mx-auto">
                        <path id="curve" fill="transparent" d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97" />
                        <text width="500" fontWeight="bold" fontSize="36" fill="rgb(220, 38, 38)">
                          <textPath alignmentBaseline="top" xlinkHref="#curve" startOffset="50%" textAnchor="middle">
                            IN CART
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* For regular products - show front image by default */}
            <div className="transition-opacity duration-300 absolute inset-0 z-10">
              {!imageError && frontImage ? (
                <Image
                  src={frontImage}
                  alt={`${displayName} - Front View`}
                  fill
                  className={`object-cover object-center transition-opacity duration-300 ${
                    isHovered ? 'opacity-0' : 'opacity-100'
                  }`}
                  priority
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-gray-400">{displayName}</span>
                </div>
              )}
            </div>
            
            {/* For regular products - show back image on hover */}
            {backImage && (
              <div className="transition-opacity duration-300 absolute inset-0 z-10">
                <Image
                  src={backImage}
                  alt={`${displayName} - Back View`}
                  fill
                  className={`object-cover object-center transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={handleImageError}
                />
              </div>
            )}
          </div>
          
          {/* Product Info - for regular products */}
          <div className="mt-6 space-y-3 relative z-10">
            <div>
              <Link href={`/product/${product.handle}`} className="block">
                <h3 className="text-lg font-medium hover:text-gray-300">{displayName}</h3>
                <p className="text-gray-400">{product.category || "Apparel"}</p>
              </Link>
            </div>
            
            {/* Price and Cart Button Row */}
            <div className="flex items-center justify-between">
              <p className="text-lg">${Number.parseFloat(product.price || 0).toFixed(2)}</p>
              
              {/* Floating quick add button - moved from image to bottom right */}
              <button 
                onClick={handleQuickAdd}
                className="p-3 rounded-full bg-black/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover-glow"
                style={{
                  boxShadow: '0 0 15px 5px rgba(255,255,255,0.15)',
                }}
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-6 w-6 text-white" />
                  <div className="absolute inset-0 animate-ping-slow opacity-70">
                    <ShoppingCartIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </button>
            </div>
            
            {/* Details button row - moved underneath */}
            <div className="flex justify-end">
              <button
                onClick={handleViewDetails}
                className="px-3 py-2 text-sm rounded-lg bg-black/30 backdrop-blur-md text-white transition-all duration-300 hover:scale-105 hover-glow"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Add Popup */}
      <AnimatePresence>
        {quickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickAddOpen(false)}
            ></motion.div>
            
            {/* Popup Panel */}
            <motion.div 
              className="relative z-10 max-w-md w-full mx-4 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { 
                  type: "spring",
                  duration: 0.5,
                  delay: 0.1
                }
              }}
              exit={{ 
                opacity: 0,
                scale: 0.9,
                y: -10, 
                transition: { 
                  duration: 0.3,
                  ease: [0.04, 0.62, 0.23, 0.98]
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gaussian blur background with diffused edges */}
              <div className="quick-add-popup p-6 rounded-xl relative overflow-hidden">
                {/* Animated smoke effects */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="smoke-particle particle-1"></div>
                  <div className="smoke-particle particle-2"></div>
                  <div className="smoke-particle particle-3"></div>
                  <div className="smoke-particle particle-4"></div>
                  <div className="smoke-particle particle-5"></div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-medium text-white text-center mb-4">
                    Choose a Size
                  </h3>
                  
                  {/* Size Selection */}
                  <div className="mb-5">
                    <div className="flex flex-wrap justify-center gap-3">
                      {["S", "M", "L", "XL", "XXL"].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleAddToCart(size)}
                          disabled={isLoading}
                          className="w-16 h-16 border rounded-full flex items-center justify-center transition-all duration-200 border-white/40 text-white hover:border-white hover:scale-105 hover-glow"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Email collection popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowEmailPopup(false)}
          ></div>
          
          {/* Popup container */}
          <div 
            className="relative email-popup max-w-md w-full mx-4 overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="email-popup-inner p-8 relative overflow-hidden">
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 text-white/80 hover:text-white z-20"
                onClick={() => setShowEmailPopup(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              {/* Email form */}
              <form onSubmit={handleSubmitEmail} className="relative z-10">
                <h3 className="text-xl md:text-2xl font-medium text-white mb-2 text-center">
                  Enter your email to receive
                </h3>
                <p className="text-2xl md:text-3xl font-bold text-white mb-6 text-center glow-text">
                  25% OFF
                </p>
                <p className="text-sm text-white/80 mb-6 text-center">
                  Be the first to know when we release our latest fashion
                </p>
                
                {submitSuccess ? (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-white text-center">
                    Thank you! Your discount code will be sent to your email.
                  </div>
                ) : (
                  <>
                    <div className="mb-4 relative">
                      <input
                        type="email"
                        ref={emailInputRef}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg relative overflow-hidden notify-button-submit"
                    >
                      <span className="relative z-10">
                        {isSubmitting ? "Submitting..." : "Get 25% Off"}
                      </span>
                    </button>
                  </>
                )}
                
                <p className="text-xs text-white/60 mt-4 text-center">
                  By submitting, you agree to receive marketing emails from Orvello.
                </p>
              </form>
              
              {/* Background glow effects */}
              <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute w-full h-full opacity-30 mix-blend-overlay film-grain"></div>
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full filter blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add keyframe animations and custom styles */}
      <style jsx global>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.4);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        /* Smoke animation keyframes */
        @keyframes smoke-animation {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.6;
            filter: blur(10px);
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
            filter: blur(20px);
          }
        }
        
        /* Smoke particles base styling */
        .smoke-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(120, 210, 255, 0.4) 0%, rgba(120, 210, 255, 0.1) 50%, transparent 70%);
          border-radius: 50%;
          mix-blend-mode: screen;
          pointer-events: none;
          will-change: transform, opacity;
          z-index: 1;
        }
        
        /* Individual smoke particles with different sizes, positions, and timings */
        .particle-1 {
          width: 400px;
          height: 400px;
          animation: smoke-animation 8s ease-out infinite;
        }
        
        .particle-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(160, 230, 255, 0.4) 0%, rgba(160, 230, 255, 0.1) 50%, transparent 70%);
          animation: smoke-animation 10s ease-out 1s infinite;
        }
        
        .particle-3 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(100, 200, 255, 0.3) 0%, rgba(100, 200, 255, 0.1) 50%, transparent 70%);
          animation: smoke-animation 9s ease-out 2s infinite;
        }
        
        .particle-4 {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(140, 220, 255, 0.35) 0%, rgba(140, 220, 255, 0.1) 50%, transparent 70%);
          animation: smoke-animation 11s ease-out 3s infinite;
        }
        
        .particle-5 {
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(180, 240, 255, 0.45) 0%, rgba(180, 240, 255, 0.1) 50%, transparent 70%);
          animation: smoke-animation 7s ease-out 1.5s infinite;
        }
        
        .hover-glow {
          position: relative;
          overflow: hidden;
        }
        
        .hover-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(120, 210, 255, 0.5), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          filter: blur(8px);
          transform: scale(1.2);
        }
        
        .hover-glow:hover::before {
          opacity: 1;
        }
        
        .quick-add-popup {
          background: rgba(15, 15, 25, 0.7);
          backdrop-filter: blur(12px);
          box-shadow: 0 0 40px 5px rgba(120, 210, 255, 0.18);
          position: relative;
        }
        
        .quick-add-popup::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(125deg, rgba(120, 210, 255, 0.3), rgba(120, 210, 255, 0.1), rgba(160, 230, 255, 0.3), rgba(120, 210, 255, 0.1));
          border-radius: inherit;
          z-index: -1;
          filter: blur(4px);
          opacity: 0.7;
        }
        
        @keyframes pulse-scale {
          0% { transform: scale(0.96); }
          50% { transform: scale(1.04); }
          100% { transform: scale(0.96); }
        }
        
        @keyframes pulse-opacity {
          0% { opacity: 0.7; }
          50% { opacity: 0.85; }
          100% { opacity: 0.7; }
        }
        
        .pulse-scale {
          animation: pulse-scale 8s infinite cubic-bezier(0.2, 0, 0.2, 1);
        }
        
        .pulse-opacity {
          animation: pulse-opacity 4s infinite cubic-bezier(0.2, 0, 0.2, 1);
        }
        
        .pulse-opacity-delayed {
          animation: pulse-opacity 4s infinite 1s cubic-bezier(0.2, 0, 0.2, 1);
        }
        
        .teardrop-glow {
          border-radius: 40% 40% 60% 60% / 30% 30% 70% 70%;
          overflow: visible;
          transform: rotate(180deg); /* Flip to get narrow at top, round at bottom */
          position: relative;
        }
        
        .teardrop-glow::after {
          content: '';
          position: absolute;
          inset: -50px;
          border-radius: inherit;
          filter: blur(40px);
          opacity: 0.4;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.15), transparent 70%);
          z-index: -1;
          pointer-events: none;
        }
        
        .teardrop-container {
          position: relative;
          isolation: isolate;
          background: transparent;
          overflow: visible;
        }
        
        .card-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(125deg, rgba(120, 120, 255, 0.2), rgba(60, 60, 255, 0.1), rgba(200, 100, 255, 0.2), rgba(255, 100, 100, 0.1));
          border-radius: inherit;
          z-index: -1;
          filter: blur(15px);
          opacity: 0.5;
        }

        @keyframes float-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(10px, 20px) scale(1.1); opacity: 0.7; }
          66% { transform: translate(-15px, 10px) scale(0.9); opacity: 0.6; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
        }
        
        @keyframes float-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(-20px, -10px) scale(1.1); opacity: 0.7; }
          66% { transform: translate(15px, -20px) scale(0.9); opacity: 0.6; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
        }
        
        @keyframes float-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33% { transform: translate(15px, -15px) scale(1.2); opacity: 0.6; }
          66% { transform: translate(-5px, 15px) scale(0.95); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
        }
        
        .floating-particle-1 {
          animation: float-1 12s infinite cubic-bezier(0.2, 0, 0.2, 1);
        }
        
        .floating-particle-2 {
          animation: float-2 15s infinite cubic-bezier(0.2, 0, 0.2, 1);
        }
        
        .floating-particle-3 {
          animation: float-3 18s infinite cubic-bezier(0.2, 0, 0.2, 1);
        }
        
        .notify-button {
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .notify-button::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(125deg, rgba(255,255,255,0.3), rgba(150,150,255,0.2), rgba(200,150,255,0.3));
          z-index: -1;
          filter: blur(8px);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .notify-button:hover::before {
          opacity: 1;
        }
        
        .email-popup-inner {
          background: rgba(20, 20, 30, 0.8);
          border-radius: 1rem;
          backdrop-filter: blur(12px);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
        }
        
        .email-popup::before {
          content: '';
          position: absolute;
          inset: -5px;
          background: linear-gradient(125deg, rgba(120, 120, 255, 0.4), rgba(60, 60, 255, 0.2), rgba(200, 100, 255, 0.4), rgba(255, 100, 100, 0.2));
          border-radius: 1.2rem;
          z-index: -1;
          filter: blur(15px);
          opacity: 0.6;
        }
        
        .notify-button-submit {
          background: linear-gradient(to right, rgba(120, 120, 255, 0.8), rgba(200, 100, 255, 0.8));
          color: white;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .notify-button-submit:hover {
          filter: brightness(1.1);
        }
        
        .notify-button-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .glow-text {
          text-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3);
        }
        
        .film-grain {
          background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3/LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhzuYqtHRVG2y4x+KOlnyqla8AoWWpuBoYRxzXrfKuILl6SfiWCbjxoZJUaCBj1CjH7GIaDbc9kqBY3W/Rgjda1iqQcOJu2WW+76pZC9QG7M00dffe9hNnseupFL53r8F7YHSwJWUKP2q+k7RdsxyOB11n0xtOvnW4irMMFNV4H0uqwS5ExsmP9AxbDTc9JwgneAT5vTiUSm1E7BSflSt3bfa1tv8Di3R8n3Af7MNWzs49hmauE2wP+ttrq+AsWpFG2awvsuOqbipWHgtuvuaAE+A1Z/7gC9hesnr+7wqCwG8c5yAg3AL1fm8T9AZtp/bbJGwl1pNrE7RuOX7PeMRUERVaPpEs+yqeoSmuOlokqw49pgomjLeh7icHNlG19yjs6XXOMedYm5xH2YxpV2tc0Ro2jJfxC50ApuxGob7lMsxfTbeUv07TyYxpeLucEH1gNd4IKH2LAg5TdVhlCafZvpskfncCfx8pOhJzd76bJWeYFnFciwcYfubRc12Ip/ppIhA1/mSZ/RxjFDrJC5xifFjJpY2Xl5zXdguFqYyTR1zSp1Y9p+tktDYYSNflcxI0iyO4TPBdlRcpeqjK/piF5bklq77VSEaA+z8qmJTFzIWiitbnzR794USKBUaT0NTEsVjZqLaFVqJoPN9ODG70IPbfBHKK+/q/AWR0tJzYHRULOa4MP+W/HfGadZUbfw177G7j/OGbIs8TahLyynl4X4RinF793Oz+BU0saXtUHrVBFT/DnA3ctNPoGbs4hRIjTok8i+algT1lTHi4SxFvONKNrgQFAq2/gFnWMXgwffgYMJpiKYkmW3tTg3ZQ9Jq+f8XN+A5eeUKHWvJWJ2sgJ1Sop+wwhqFVijqWaJhwtD8MNlSBeWNNWTa5Z5kPZw5+LbVT99wqTdx29lMUH4OIG/D86ruKEauBjvH5xy6um/Sfj7ei6UUVk4AIl3MyD4MSSTOFgSwsH/QJWaQ5as7ZcmgBZkzjjU1UrQ74ci1gWBCSGHtuV1H2mhSnO3Wp/3fEV5a+4wz//6qy8JxjZsmxxy5+4w9CDNJY09T072iKG0EnOS0arEYgXqYnXcYHwjTtUNAcMelOd4xpkoqiTYICWFq0JSiPfPDQdnt+4/wuqcXY47QILbgAAAABJRU5ErkJggg==");
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  )
}

