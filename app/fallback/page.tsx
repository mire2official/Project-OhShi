"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FallbackPage() {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">ORVELLO</h1>
      
      <div className="space-y-6">
        <Link href="/releases">
          <Button className="px-8 py-6 text-lg w-full">
            Enter Store
          </Button>
        </Link>
        
        <Link href="/">
          <Button variant="outline" className="px-8 py-6 text-lg w-full">
            Try 3D Entrance
          </Button>
        </Link>
      </div>
      
      <div className="mt-12 text-gray-400 text-center max-w-md">
        <p>This is a fallback page in case the 3D entrance is not working on your device.</p>
        <p className="mt-2">You can access the store directly from here.</p>
      </div>
    </div>
  )
} 