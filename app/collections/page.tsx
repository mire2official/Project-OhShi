"use client"

import Header from "@/components/Header"
import Link from "next/link"
import Image from "next/image"

export default function CollectionsPage() {
  // Sample collections data
  const collections = [
    {
      id: "summer-2025",
      title: "Summer 2025",
      description: "Our latest summer collection featuring bold designs and premium materials.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mockup%2011%20.png-YwrmjEVJxCiDdJGChwP06gl8thI5sm.jpeg",
      colors: "from-orange-500/40 to-red-600/40",
      accent: "rgba(255, 120, 50, 0.6)",
      colorFilter: "hue-rotate(0deg) saturate(1.4)",
    },
    {
      id: "essentials",
      title: "Essentials",
      description: "Timeless pieces that form the foundation of your wardrobe.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mockup%2022.png-6p1K2QKw3qUi72KphcRaDI8l4RCMl0.jpeg",
      colors: "from-green-500/40 to-yellow-400/40",
      accent: "rgba(150, 230, 80, 0.6)",
      colorFilter: "hue-rotate(-10deg) saturate(1.3)",
    },
    {
      id: "limited-edition",
      title: "Limited Edition",
      description: "Exclusive designs available for a limited time only.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mockup%2011%20.png-YwrmjEVJxCiDdJGChwP06gl8thI5sm.jpeg",
      colors: "from-blue-500/40 to-purple-600/40",
      accent: "rgba(130, 120, 255, 0.6)",
      colorFilter: "none",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-12">Collections</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/releases?collection=${collection.id}`} className="group">
              <div className="relative h-96 overflow-hidden rounded-xl transform transition-all duration-700 hover:scale-[1.02]">
                {/* Background pulse animation and film grain */}
                <div 
                  className="absolute inset-0 z-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/png;base64,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")`,
                    opacity: 0.15,
                    mixBlendMode: 'overlay'
                  }}
                ></div>
                
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.title}
                  width={650}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 translate-y-10"
                  style={{ 
                    filter: collection.id === "limited-edition" ? "none" : collection.colorFilter 
                  }}
                />
                
                {/* Main gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end p-8">
                  <div className="relative">
                    {/* Animated glow effect */}
                    <div 
                      className="absolute -inset-x-8 bottom-0 top-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{ 
                        backgroundImage: `radial-gradient(circle at center, ${collection.accent}, transparent 70%)`,
                        filter: 'blur(25px)',
                        transform: 'translateY(20%)',
                        mixBlendMode: 'screen'
                      }}
                    ></div>
                    
                    {/* Diffused glowing background for title */}
                    <div 
                      className={`absolute -inset-4 rounded-lg bg-gradient-to-r ${collection.colors} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pulse-subtle`}
                      style={{ 
                        mixBlendMode: 'screen',
                        filter: 'blur(15px)',
                      }}
                    ></div>
                    
                    <h2 
                      className="text-3xl font-bold relative z-10 text-white drop-shadow-sm mb-3 tracking-wide"
                      style={{ 
                        textShadow: `0 0 8px ${collection.accent}, 0 0 12px rgba(255, 255, 255, 0.3)`,
                        filter: 'saturate(1.2)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {collection.title}
                    </h2>
                    
                    <p className="text-gray-100 mt-3 mb-5 relative z-10 max-w-md opacity-90">
                      {collection.description}
                    </p>
                    
                    <div className="mt-6 relative z-10 flex">
                      <span 
                        className="relative px-6 py-3 overflow-hidden rounded-lg" 
                      >
                        {/* Button blur background */}
                        <span 
                          className="absolute inset-0 bg-black/30 backdrop-blur-md"
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
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                          style={{ 
                            background: `linear-gradient(45deg, rgba(120, 210, 255, 0.15), rgba(160, 230, 255, 0.25))`,
                            filter: 'blur(8px)',
                            transform: 'translateY(-1px)'
                          }}
                        ></span>
                        
                        {/* Text content */}
                        <span className="relative text-white font-medium">
                          Explore Collection
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes pulse-subtle {
          0% { opacity: 0.8; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.8; transform: scale(0.98); }
        }
        
        .pulse-subtle {
          animation: pulse-subtle 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

