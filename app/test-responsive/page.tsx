"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

// Dynamically import the ThreeScene component with SSR disabled
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => <div className="text-white">Loading 3D...</div>,
})

export default function TestResponsive() {
  const [selectedSize, setSelectedSize] = useState<string>("full")
  
  const sizes = {
    "mobile": { width: "375px", height: "667px" },
    "tablet": { width: "768px", height: "1024px" },
    "laptop": { width: "1366px", height: "768px" },
    "desktop": { width: "1920px", height: "1080px" },
    "full": { width: "100%", height: "100vh" }
  }
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">3D Scene Responsive Test</h1>
        
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.keys(sizes).map(size => (
            <Button 
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              onClick={() => setSelectedSize(size)}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="border-4 border-white/20 rounded-lg overflow-hidden">
          <div className="p-2 bg-black text-white text-sm font-mono">
            Viewport: {sizes[selectedSize].width} × {sizes[selectedSize].height}
          </div>
          
          <div 
            style={{
              width: sizes[selectedSize].width,
              height: sizes[selectedSize].height,
              position: "relative",
              margin: "0 auto",
              overflow: "hidden",
              resize: selectedSize === "full" ? "none" : "both"
            }}
            className="bg-black"
          >
            <ThreeScene />
            
            {/* Overlay UI to test z-index issues */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
              <Button className="pointer-events-auto">
                Test Button
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Debugging Tips</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Check if the 3D scene resizes properly when switching between viewport sizes</li>
            <li>Verify the button is visible and clickable (should be above the 3D scene)</li>
            <li>Look for any clipping or overflow issues with the 3D content</li>
            <li>Check if the text is centered and visible at all viewport sizes</li>
            <li>Notice any performance issues when resizing the viewport</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 