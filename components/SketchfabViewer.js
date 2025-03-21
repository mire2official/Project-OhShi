"use client"

import { useState, useEffect, useRef } from "react"

export default function SketchfabViewer({ modelId = "3b6e78d6a1a74370a6e5af6f312d38f7", className = "" }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const iframeRef = useRef(null)

  // Handle iframe loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.log("Fallback loading mechanism triggered")
        setIsLoaded(true)
      }
    }, 5000) // Fallback if onLoad doesn't trigger

    return () => clearTimeout(timer)
  }, [isLoaded])

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="ml-3 text-white">Loading 3D model...</p>
        </div>
      )}

      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <p className="text-red-400">Failed to load 3D model</p>
          <button
            onClick={() => {
              setIsError(false)
              setIsLoaded(false)
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src
              }
            }}
            className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
          >
            Retry
          </button>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Oversized t-shirt"
        frameBorder="0"
        allowFullScreen
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        xr-spatial-tracking="true"
        execution-while-out-of-viewport="true"
        execution-while-not-rendered="true"
        web-share="true"
        src={`https://sketchfab.com/models/${modelId}/embed?autostart=1&ui_infos=0&ui_controls=1&ui_stop=0&ui_watermark=0&ui_watermark_link=0`}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => {
          console.log("Iframe loaded")
          setIsLoaded(true)
        }}
        onError={() => {
          console.error("Iframe error")
          setIsError(true)
        }}
      />
    </div>
  )
}

