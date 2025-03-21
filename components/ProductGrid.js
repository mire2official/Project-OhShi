"use client"

import dynamic from "next/dynamic"

// Dynamically import ProductCard to avoid SSR issues with 3D content
const ProductCard = dynamic(() => import("./ProductCard"), {
  ssr: false,
})

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {products.map((product) => {
        // Check if this is a coming soon product (Peace Tee or Unity Tee)
        const isComingSoon = product.name === "Peace Tee" || product.name === "Unity Tee"
        
        return (
          <ProductCard 
            key={product.id} 
            product={product} 
            isComingSoon={isComingSoon}
          />
        )
      })}
    </div>
  )
}

