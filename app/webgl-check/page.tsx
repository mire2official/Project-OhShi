"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function WebGLCheck() {
  const [webGLInfo, setWebGLInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      // Create canvas element
      const canvas = document.createElement('canvas')
      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
      
      // Try WebGL2 first
      gl = canvas.getContext('webgl2')
      let version = 2
      
      // Fall back to WebGL1
      if (!gl) {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext
        version = 1
      }
      
      if (!gl) {
        setError('WebGL is not supported in this browser')
        setLoading(false)
        return
      }
      
      // Get renderer information
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const vendor = debugInfo 
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
        : gl.getParameter(gl.VENDOR)
      const renderer = debugInfo 
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
        : gl.getParameter(gl.RENDERER)
      
      // Get max texture size
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
      
      // Get max viewport dimensions
      const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS)
      
      // Get available extensions
      const extensions = gl.getSupportedExtensions()
      
      // Get color buffer info
      const colorBits = {
        r: gl.getParameter(gl.RED_BITS),
        g: gl.getParameter(gl.GREEN_BITS),
        b: gl.getParameter(gl.BLUE_BITS),
        a: gl.getParameter(gl.ALPHA_BITS),
      }
      
      // Get depth and stencil bits
      const depthBits = gl.getParameter(gl.DEPTH_BITS)
      const stencilBits = gl.getParameter(gl.STENCIL_BITS)
      
      // Check for key extensions needed for Three.js
      const criticalExtensions = [
        'ANGLE_instanced_arrays',
        'OES_element_index_uint',
        'OES_standard_derivatives',
        'OES_texture_float',
        'WEBGL_depth_texture'
      ]
      
      const missingCriticalExtensions = criticalExtensions.filter(
        ext => !extensions?.includes(ext)
      )
      
      // Update state
      setWebGLInfo({
        version,
        vendor,
        renderer,
        maxTextureSize,
        maxViewportDims,
        colorBits,
        depthBits,
        stencilBits,
        extensions: extensions || [],
        missingCriticalExtensions,
        isThreeJsCompatible: missingCriticalExtensions.length === 0,
        hasPotentialIssues: renderer.includes('SwiftShader') || 
                            renderer.includes('llvmpipe') || 
                            vendor.includes('Microsoft')
      })
      
      setLoading(false)
      
    } catch (err) {
      setError(`Error checking WebGL: ${err.message}`)
      setLoading(false)
    }
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl animate-pulse">
          Checking WebGL capabilities...
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md p-6 bg-red-900/50 rounded-lg text-white">
          <h1 className="text-2xl font-bold mb-4">WebGL Error</h1>
          <p className="mb-4">{error}</p>
          <p className="mb-4">
            Your browser does not appear to support WebGL, which is required for 3D graphics.
            Please try using a different browser such as Chrome, Firefox, or Edge.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebGL Diagnostic Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall status */}
          <div className={`p-6 rounded-lg ${webGLInfo.isThreeJsCompatible ? 'bg-green-800/30' : 'bg-red-800/30'}`}>
            <h2 className="text-xl font-semibold mb-4">Overall Status</h2>
            <div className="flex items-center mb-2">
              <div className={`w-4 h-4 rounded-full mr-2 ${webGLInfo.isThreeJsCompatible ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {webGLInfo.isThreeJsCompatible ? 'Compatible with Three.js' : 'Issues detected'}
              </span>
            </div>
            {webGLInfo.hasPotentialIssues && (
              <div className="mt-2 p-2 bg-yellow-800/30 rounded">
                <p className="text-yellow-300">
                  ⚠️ Software rendering detected. 3D performance may be slow.
                </p>
              </div>
            )}
          </div>
          
          {/* Basic information */}
          <div className="p-6 rounded-lg bg-gray-800/30">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <ul className="space-y-2">
              <li><strong>WebGL Version:</strong> {webGLInfo.version}</li>
              <li><strong>Vendor:</strong> {webGLInfo.vendor}</li>
              <li><strong>Renderer:</strong> {webGLInfo.renderer}</li>
              <li><strong>Max Texture Size:</strong> {webGLInfo.maxTextureSize}px</li>
              <li>
                <strong>Color Depth:</strong> RGBA {webGLInfo.colorBits.r}/{webGLInfo.colorBits.g}/{webGLInfo.colorBits.b}/{webGLInfo.colorBits.a}
              </li>
              <li><strong>Depth Buffer:</strong> {webGLInfo.depthBits} bits</li>
              <li><strong>Stencil Buffer:</strong> {webGLInfo.stencilBits} bits</li>
            </ul>
          </div>
        </div>
        
        {/* Critical extensions */}
        <div className="p-6 rounded-lg bg-gray-800/30 mb-6">
          <h2 className="text-xl font-semibold mb-4">Critical Extensions</h2>
          {webGLInfo.missingCriticalExtensions.length > 0 ? (
            <div>
              <p className="text-red-400 mb-2">Missing critical extensions:</p>
              <ul className="list-disc pl-6 space-y-1">
                {webGLInfo.missingCriticalExtensions.map(ext => (
                  <li key={ext}>{ext}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-green-400">All critical extensions are supported!</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => window.history.back()}>
            Back to Previous Page
          </Button>
          <Button onClick={() => window.location.href = "/"}>
            Go to Homepage
          </Button>
          <Button onClick={() => window.location.href = "/debug"}>
            Open Debug Page
          </Button>
          <Button onClick={() => window.location.href = "/test-responsive"}>
            Test Responsive Layout
          </Button>
        </div>
      </div>
    </div>
  )
} 