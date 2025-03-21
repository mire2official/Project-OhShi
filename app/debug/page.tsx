"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { detectWebGL } from "@/lib/utils"

// Dynamically import the ThreeScene component with SSR disabled
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <div className="text-white text-4xl animate-pulse">Loading 3D...</div>
    </div>
  ),
})

export default function DebugPage() {
  const [mounted, setMounted] = useState(false)
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)
  const [show3D, setShow3D] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [domInfo, setDomInfo] = useState<{[key: string]: any}>({})

  // Function to capture console logs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error
      const originalConsoleWarn = console.warn
      const originalConsoleLog = console.log

      console.error = (...args) => {
        setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`])
        originalConsoleError.apply(console, args)
      }

      console.warn = (...args) => {
        setLogs(prev => [...prev, `WARN: ${args.join(' ')}`])
        originalConsoleWarn.apply(console, args)
      }

      console.log = (...args) => {
        setLogs(prev => [...prev, `LOG: ${args.join(' ')}`])
        originalConsoleLog.apply(console, args)
      }

      return () => {
        console.error = originalConsoleError
        console.warn = originalConsoleWarn
        console.log = originalConsoleLog
      }
    }
  }, [])

  // Check WebGL and set mounted state
  useEffect(() => {
    setMounted(true)
    setIsWebGLSupported(detectWebGL())
    
    const timer = setTimeout(() => {
      setShow3D(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Analyze DOM structure after component mounts
  useEffect(() => {
    if (mounted && show3D) {
      setTimeout(() => {
        const container = document.querySelector('[data-testid="three-container"]')
        const canvas = document.querySelector('canvas')
        
        setDomInfo({
          containerExists: !!container,
          canvasExists: !!canvas,
          containerDimensions: container ? {
            width: container.clientWidth,
            height: container.clientHeight,
          } : null,
          canvasDimensions: canvas ? {
            width: canvas.width,
            height: canvas.height,
          } : null,
          zIndex: container ? window.getComputedStyle(container).zIndex : null,
          position: container ? window.getComputedStyle(container).position : null,
        })
      }, 1000) // Check after 1 second to allow for loading
    }
  }, [mounted, show3D])

  if (!mounted) {
    return <div>Loading debug tools...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6">ThreeScene Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D Scene container */}
        <div className="relative h-[400px] w-full border border-gray-700 rounded-lg">
          <div className="bg-gray-900 p-2 rounded-t-lg">
            <h2 className="font-medium">3D Scene Render Area</h2>
          </div>
          
          {isWebGLSupported ? (
            show3D ? <ThreeScene /> : <div className="p-4">Loading scene...</div>
          ) : (
            <div className="p-4 bg-red-900 rounded-lg">
              WebGL not supported in this browser
            </div>
          )}
        </div>
        
        {/* Debug info */}
        <div className="space-y-6">
          {/* WebGL Info */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="font-medium mb-2">WebGL Info</h2>
            <p>WebGL Supported: {isWebGLSupported ? "✅" : "❌"}</p>
            <p>3D Scene Shown: {show3D ? "✅" : "❌"}</p>
          </div>
          
          {/* DOM Structure */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="font-medium mb-2">DOM Structure Check</h2>
            <ul className="space-y-1">
              <li>Container exists: {domInfo.containerExists ? "✅" : "❌"}</li>
              <li>Canvas exists: {domInfo.canvasExists ? "✅" : "❌"}</li>
              <li>Container dimensions: {domInfo.containerDimensions ? 
                `${domInfo.containerDimensions.width}x${domInfo.containerDimensions.height}` : 
                "N/A"}</li>
              <li>Canvas dimensions: {domInfo.canvasDimensions ? 
                `${domInfo.canvasDimensions.width}x${domInfo.canvasDimensions.height}` : 
                "N/A"}</li>
              <li>Z-Index: {domInfo.zIndex || "N/A"}</li>
              <li>Position: {domInfo.position || "N/A"}</li>
            </ul>
          </div>
          
          {/* Console Logs */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="font-medium mb-2">Console Logs</h2>
            <div className="max-h-[200px] overflow-y-auto text-sm font-mono bg-black p-2 rounded">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i} className="border-b border-gray-800 py-1">{log}</div>)
              ) : (
                <div className="text-gray-500">No console logs captured yet</div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
} 