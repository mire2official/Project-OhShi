"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useCartStore } from "../store/useCartStore"

export default function ProductDetail({ product }) {
  const [view, setView] = useState("front") // Only 'front' or 'back' now
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const addToCart = useCartStore((state) => state.addToCart)

  // Use the product's own images
  const frontImage = product.images?.[0] || "/assets/mockup11.png"
  const backImage = product.images?.[1] || "/assets/mockup22.png"

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    // Validate that a size is selected
    if (!selectedSize) {
      alert("Please select a size before adding to cart");
      return;
    }
    
    setIsLoading(true)

    // Add a slight delay to simulate processing
    setTimeout(() => {
      addToCart({
        id: `${product.id}-${selectedSize}`, // Unique ID for each size variant
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0] || "/assets/mockup11.png",
        variantId: product.id,
        size: selectedSize, // Include the selected size
      })
      setIsLoading(false)
    }, 300)
  }

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-6">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-900 relative">
            {view === "front" && (
              <Image
                src={frontImage}
                alt={product.name || "Product front view"}
                fill
                className="object-cover object-center"
                priority
              />
            )}
            {view === "back" && (
              <Image
                src={backImage}
                alt={`${product.name} back view` || "Product back view"}
                fill
                className="object-cover object-center"
                priority
              />
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setView("front")}
              className={`relative px-6 py-3 rounded-lg overflow-hidden transition-all duration-300 ${
                view === "front"
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {/* Button blur background */}
              <span 
                className={`absolute inset-0 bg-black/30 backdrop-blur-md ${
                  view === "front" ? "opacity-100" : "opacity-70"
                }`}
                style={{ mixBlendMode: 'normal' }}
              ></span>
              
              {/* Diffused border */}
              <span 
                className="absolute inset-0 rounded-lg"
                style={{ 
                  boxShadow: `0 0 0 1.5px rgba(255,255,255,0.3), 0 0 0 1px rgba(120, 210, 255, 0.5)`,
                  filter: 'blur(0.5px)',
                }}
              ></span>
              
              {/* Glowing effect */}
              <span 
                className={`absolute inset-0 opacity-0 ${
                  view === "front" ? "opacity-100" : "hover:opacity-70"
                } transition-opacity duration-300`}
                style={{ 
                  background: `linear-gradient(45deg, rgba(120, 210, 255, 0.15), rgba(160, 230, 255, 0.25))`,
                  filter: 'blur(8px)',
                  transform: 'translateY(-1px)'
                }}
              ></span>
              
              {/* Text content */}
              <span className="relative z-10 font-medium">
                Front
              </span>
            </button>
            
            <button
              onClick={() => setView("back")}
              className={`relative px-6 py-3 rounded-lg overflow-hidden transition-all duration-300 ${
                view === "back"
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {/* Button blur background */}
              <span 
                className={`absolute inset-0 bg-black/30 backdrop-blur-md ${
                  view === "back" ? "opacity-100" : "opacity-70"
                }`}
                style={{ mixBlendMode: 'normal' }}
              ></span>
              
              {/* Diffused border */}
              <span 
                className="absolute inset-0 rounded-lg"
                style={{ 
                  boxShadow: `0 0 0 1.5px rgba(255,255,255,0.3), 0 0 0 1px rgba(120, 210, 255, 0.5)`,
                  filter: 'blur(0.5px)',
                }}
              ></span>
              
              {/* Glowing effect */}
              <span 
                className={`absolute inset-0 opacity-0 ${
                  view === "back" ? "opacity-100" : "hover:opacity-70"
                } transition-opacity duration-300`}
                style={{ 
                  background: `linear-gradient(45deg, rgba(120, 210, 255, 0.15), rgba(160, 230, 255, 0.25))`,
                  filter: 'blur(8px)',
                  transform: 'translateY(-1px)'
                }}
              ></span>
              
              {/* Text content */}
              <span className="relative z-10 font-medium">
                Back
              </span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl mt-2">${Number.parseFloat(product.price).toFixed(2)}</p>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-2">Description</h2>
            <div
              className="prose prose-invert"
              dangerouslySetInnerHTML={{
                __html:
                  product.description ||
                  "Premium quality oversized t-shirt with custom ORVELLO design. Made from 100% organic cotton for maximum comfort and durability.",
              }}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium mb-2">Size</h3>
            <div className="flex gap-2">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`w-10 h-10 border border-white rounded-full flex items-center justify-center transition-colors ${
                    selectedSize === size
                      ? "bg-white text-black"
                      : "hover:bg-white/20"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-xs text-gray-400 mt-2">Please select a size</p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isLoading || !selectedSize}
            className="w-full py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
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
                Adding to Cart...
              </>
            ) : (
              `Add to Cart${selectedSize ? ` • Size ${selectedSize}` : ""}`
            )}
          </button>

          <div className="border-t border-white/10 pt-4 mt-6">
            <h3 className="text-lg font-medium mb-2">Details</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• 100% Organic Cotton</li>
              <li>• Oversized fit</li>
              <li>• Machine washable</li>
              <li>• Designed in-house</li>
              <li>• Limited edition</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* This would typically be populated with actual related products */}
          <div className="border border-white/10 p-4 rounded-lg">
            <div className="aspect-square bg-gray-900 rounded-lg mb-4 overflow-hidden">
              <Image
                src="/assets/mockup11.png"
                alt="Related Product"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">Freedom Tee</h3>
            <p className="text-gray-400">$49.99</p>
          </div>
          <div className="border border-white/10 p-4 rounded-lg">
            <div className="aspect-square bg-gray-900 rounded-lg mb-4 overflow-hidden">
              <Image
                src="/assets/mockup22.png"
                alt="Related Product"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">Peace Tee</h3>
            <p className="text-gray-400">$49.99</p>
          </div>
          <div className="border border-white/10 p-4 rounded-lg">
            <div className="aspect-square bg-gray-900 rounded-lg mb-4 overflow-hidden">
              <Image
                src="/assets/mockup11.png"
                alt="Related Product"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">Unity Tee</h3>
            <p className="text-gray-400">$49.99</p>
          </div>
        </div>
      </div>
    </div>
  )
}

