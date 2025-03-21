import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detect WebGL support in the browser
 * @returns boolean indicating whether WebGL is supported
 */
export function detectWebGL(): boolean {
  // Make sure we're in a browser environment
  if (typeof window === 'undefined') {
    return false
  }
  
  try {
    // Try to create a WebGL context
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    console.error('Error detecting WebGL:', e)
    return false
  }
}
