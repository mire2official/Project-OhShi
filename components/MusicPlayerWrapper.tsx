"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

// Dynamic import inside a client component is allowed
const MusicPlayer = dynamic(() => import("./MusicPlayer"), { ssr: false })

export default function MusicPlayerWrapper() {
  const [isMounted, setIsMounted] = useState(false)
  const [hasMusicState, setHasMusicState] = useState(false)
  const pathname = usePathname()
  
  // Only mount component after client-side hydration
  useEffect(() => {
    setIsMounted(true)
    
    // Check for existing music state
    if (typeof window !== 'undefined') {
      const hasState = localStorage.getItem('currentSongIndex') !== null;
      setHasMusicState(hasState);
      
      // Debug all localStorage values on mount
      console.log('MusicPlayerWrapper: localStorage values on mount');
      console.log('- musicPosition:', localStorage.getItem('musicPosition'));
      console.log('- musicPlaying:', localStorage.getItem('musicPlaying'));
      console.log('- musicMuted:', localStorage.getItem('musicMuted'));
      console.log('- currentSongIndex:', localStorage.getItem('currentSongIndex'));
      console.log('- Has music state:', hasState);
      console.log('- Current pathname:', pathname);
    }
  }, [pathname]) // Re-check when pathname changes
  
  // Don't render until client-side hydration
  if (!isMounted) return null
  
  // Skip rendering on homepage only on first visit (no existing state)
  // This allows ThreeScene to handle music on first entry to the site
  if (pathname === "/" && !hasMusicState) {
    console.log("MusicPlayerWrapper: Skipping on homepage with no existing state");
    return null;
  }
  
  // For all other pages, or return visits to homepage
  console.log(`MusicPlayerWrapper: Rendering MusicPlayer on ${pathname}`);
  return <MusicPlayer />
} 