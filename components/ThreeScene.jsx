"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import { useRouter } from "next/navigation"
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid"
import { motion, AnimatePresence } from "framer-motion"

// Array of available music tracks
const musicTracks = [
  {
    src: "/assets/background-music.mp3",
    title: "Original Background Music"
  },
  {
    src: "/assets/music/All I Want Is U - Sexy Drill x Cash Cobain Type Beat 2024.mp3", 
    title: "All I Want Is U"
  },
  {
    src: "/assets/music/Gunna Type Beat Dior.mp3",
    title: "Dior"
  },
  {
    src: "/assets/music/Kodak Black Meek Mill Type Beat - Time Is Money.mp3",
    title: "Time Is Money"
  }
];

export default function ThreeScene() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicLoaded, setMusicLoaded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showPlayPrompt, setShowPlayPrompt] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0) // Index of current music track
  const [currentTrackTitle, setCurrentTrackTitle] = useState("") // Title of current track
  const [useGlobalPlayer, setUseGlobalPlayer] = useState(false) // Whether to use the global MusicPlayer
  const [showSpiderweb, setShowSpiderweb] = useState(false) // Control state for spiderweb image
  const [spiderwebOpacity, setSpiderwebOpacity] = useState(0) // Opacity for the spiderweb image
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }) // Track mouse position for tilt effect
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const audioRef = useRef(null)
  const fadeIntervalRef = useRef(null)
  const currentVolumeRef = useRef(0.5) // 50% volume for all tracks
  const videoRef = useRef(null) // Reference to video element
  const orvelloTextRef = useRef(null) // Reference to ORVELLO text

  // Track mouse position for tilt effect with higher sensitivity
  useEffect(() => {
    // To prevent too many renders, implement throttling for mouse movement
    let lastUpdateTime = 0;
    const throttleDelay = 16; // Approximately 60fps
    let frameId = null;
    let pendingUpdate = false;
    let latestX = 0;
    let latestY = 0;
    
    const handleMouseMove = (e) => {
      // Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate mouse position as percentage from center with increased sensitivity
      const mouseXPercent = ((e.clientX / windowWidth) * 2 - 1) * 1.5; // Range: -1.5 to 1.5 (increased range)
      const mouseYPercent = ((e.clientY / windowHeight) * 2 - 1) * 1.5; // Range: -1.5 to 1.5 (increased range)
      
      // Store latest values
      latestX = mouseXPercent;
      latestY = mouseYPercent;
      
      // Throttle updates
      const now = Date.now();
      if (now - lastUpdateTime >= throttleDelay) {
        lastUpdateTime = now;
        
        // Cancel any pending updates
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        
        // Update state with latest values
        setMousePosition({ x: latestX, y: latestY });
      } else if (!pendingUpdate) {
        // Schedule update for later if we haven't already
        pendingUpdate = true;
        
        frameId = requestAnimationFrame(() => {
          lastUpdateTime = Date.now();
          pendingUpdate = false;
          frameId = null;
          
          // Update with the most recent values
          setMousePosition({ x: latestX, y: latestY });
        });
      }
    };
    
    // Add event listener with 'passive' option for better performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  // Handle background transition effect with longer, more cinematic fade
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Start the transition after 6 seconds
    const transitionTimer = setTimeout(() => {
      console.log("Starting background transition to spiderweb");
      
      // Start fade in of spiderweb image
      setShowSpiderweb(true);
      
      // Remove CSS transitions to prevent conflicts with our manual fade
      if (videoRef.current) {
        videoRef.current.style.transition = 'none';
      }
      
      // Animate the opacity change more gradually for a cinematic effect
      let opacity = 0;
      const steps = 280; // More steps for smoother fade
      const stepTime = 50; // Shorter interval but more steps
      const totalTime = steps * stepTime; // 14000ms = 14 seconds
      const opacityIncrement = 1 / steps; // Precise increment per step
      
      console.log(`Fade transition: ${steps} steps of ${opacityIncrement.toFixed(5)} every ${stepTime}ms = ${totalTime}ms total`);
      
      const fadeInterval = setInterval(() => {
        opacity += opacityIncrement; // More precise increment
        setSpiderwebOpacity(Math.min(opacity, 1)); // Ensure we don't exceed 1
        
        // When opacity reaches 1, clear the interval
        if (opacity >= 1) {
          clearInterval(fadeInterval);
          console.log("Fade transition complete after", (Date.now() - fadeStartTime), "ms");
          
          // Pause the video when fully faded to save resources
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      }, stepTime);
      
      // Log the exact start time for debugging
      const fadeStartTime = Date.now();
      console.log("Fade start timestamp:", fadeStartTime);
      
      fadeIntervalRef.current = fadeInterval;
      
      return () => {
        clearInterval(fadeInterval);
        clearTimeout(transitionTimer);
      };
    }, 6000); // 6 seconds delay
    
    return () => {
      clearTimeout(transitionTimer);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Handler for song ended event - play the next track automatically
  const handleSongEnded = () => {
    console.log("ThreeScene: Song ended, playing next track");
    playNextTrack();
  };
  
  // Function to play the next track
  const playNextTrack = () => {
    if (!audioRef.current) {
      console.error("ThreeScene: Cannot play next track - audioRef is null");
      return;
    }
    
    try {
      // Calculate next track
      const nextTrack = (currentTrack + 1) % musicTracks.length;
      console.log(`ThreeScene: Switching to next track ${nextTrack}: ${musicTracks[nextTrack].title}`);
      
      // Update state
      setCurrentTrack(nextTrack);
      setCurrentTrackTitle(musicTracks[nextTrack].title);
      
      // Save to localStorage
      localStorage.setItem('currentSongIndex', nextTrack.toString());
      
      // Save current volume level and muted state
      const currentVolume = audioRef.current.volume || 0.5;
      const wasMuted = audioRef.current.muted;
      
      // First pause current track
      audioRef.current.pause();
      
      // Remove all event listeners to prevent duplicates
      const oldAudio = audioRef.current;
      oldAudio.onended = null;
      oldAudio.oncanplaythrough = null;
      oldAudio.onerror = null;
      
      // Create a new audio element for the next track to avoid issues with existing element
      const newAudio = new Audio();
      audioRef.current = newAudio;
      
      // Update the source with cache busting
      const newSrc = `${musicTracks[nextTrack].src}?t=${Date.now()}`;
      newAudio.src = newSrc;
      
      // Configure the new audio element
      newAudio.preload = "auto";
      newAudio.volume = currentVolume;
      newAudio.muted = wasMuted;
      newAudio.loop = false; // Essential: keep loop false so 'ended' event fires
      
      // Set up ended event handler - use local reference instead of the handler defined above
      const handleTrackEnd = () => {
        console.log("ThreeScene: Track ended event fired");
        playNextTrack();
      };
      
      newAudio.addEventListener('ended', handleTrackEnd);
      
      // Set up error handler
      newAudio.onerror = (e) => {
        console.error("ThreeScene: Error loading next track:", e);
        // Try another track after a delay
        setTimeout(playNextTrack, 500);
      };
      
      // Start loading the next track
      newAudio.load();
      
      // Play the track when it's ready
      const playWhenReady = () => {
        if (!audioRef.current) return;
        
        audioRef.current.play()
          .then(() => {
            console.log("ThreeScene: Next track started successfully");
            setMusicPlaying(true);
          })
          .catch(e => {
            console.error("ThreeScene: Error playing next track:", e);
            // Try again after a short delay
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play().catch(err => 
                  console.error("ThreeScene: Retry also failed:", err)
                );
              }
            }, 500);
          });
      };
      
      // Add canplaythrough event handler
      newAudio.addEventListener('canplaythrough', () => {
        playWhenReady();
      }, { once: true });
      
      // Set a timeout in case canplaythrough doesn't fire
      setTimeout(() => {
        if (audioRef.current && audioRef.current.readyState >= 2 && audioRef.current.paused) {
          console.log("ThreeScene: Forcing playback after timeout");
          playWhenReady();
        }
      }, 3000);
    } catch (error) {
      console.error("ThreeScene: Error in playNextTrack:", error);
      // Try simple approach as fallback
      if (audioRef.current) {
        const nextTrack = (currentTrack + 1) % musicTracks.length;
        setCurrentTrack(nextTrack);
        try {
          audioRef.current.src = `${musicTracks[nextTrack].src}?t=${Date.now()}`;
          audioRef.current.load();
          audioRef.current.loop = false;
          audioRef.current.play().catch(e => console.error("ThreeScene: Fallback play failed:", e));
        } catch (e) {
          console.error("ThreeScene: Error in fallback play:", e);
        }
      }
    }
  };

  // Initialize audio on mount with random track selection
  useEffect(() => {
    // Skip if server-side rendering
    if (typeof window === 'undefined') return
    
    // Check if there's an existing music state, which means MusicPlayerWrapper should handle music
    const hasExistingMusicState = localStorage.getItem('currentSongIndex') !== null;
    if (hasExistingMusicState) {
      console.log("ThreeScene: Using global MusicPlayer due to existing state");
      setUseGlobalPlayer(true);
      // Skip the rest of audio initialization since MusicPlayerWrapper will handle it
      return;
    }
    
    // Add beforeunload event listener to save state when navigating directly
    window.addEventListener('beforeunload', saveCurrentMusicState);
    
    // Select a random track
    const randomTrackIndex = Math.floor(Math.random() * musicTracks.length)
    setCurrentTrack(randomTrackIndex)
    setCurrentTrackTitle(musicTracks[randomTrackIndex].title)
    
    // Create audio element
    const audio = new Audio()
    audio.preload = "auto" // Ensure it preloads the audio
    audio.volume = 0 // Start at 0 for fade-in
    
    // IMPORTANT: Don't set loop to true as we want the 'ended' event to trigger
    audio.loop = false
    
    // Add event listener for when the song ends to play next song
    audio.addEventListener('ended', handleSongEnded);
    
    // Add detailed error handling with better logging
    const handleError = (e) => {
      console.error("Audio loading error:", e)
      if (audio.error) {
        console.error("Audio error code:", audio.error.code)
        console.error("Audio error message:", audio.error.message)
      }
      console.error("Audio src attempted:", audio.src)
      
      // Still mark as loaded so user can interact
      setMusicLoaded(true)
      setShowPlayPrompt(true)
    }
    
    // Listen for when audio is ready to play
    audio.addEventListener('canplaythrough', () => {
      console.log("ThreeScene: Audio can play through - ready", audio.src);
      setMusicLoaded(true)
      // Try to autoplay once loaded
      attemptAutoplay()
    }, { once: true })
    
    // Handle errors with the improved handler
    audio.addEventListener('error', handleError)
    
    // Set audio source with cache-busting parameter
    audio.src = `${musicTracks[randomTrackIndex].src}?v=${Date.now()}`
    audioRef.current = audio
    
    // Log which track was selected
    console.log(`Selected music track: ${musicTracks[randomTrackIndex].title}`)
    
    // Try-catch around load to catch synchronous errors
    try {
      // Start loading the audio file
      audio.load()
      console.log("Audio load initiated for:", audio.src)
    } catch (err) {
      console.error("Synchronous error in audio.load():", err)
      setMusicLoaded(true)
      setShowPlayPrompt(true)
    }
    
    // Set up global click handler for the entire document
    const documentClickHandler = (e) => {
      // Don't handle if clicking on a button or link to avoid conflicts
      if (e.target.closest('button') || e.target.closest('a')) {
        return
      }
      
      if (!musicPlaying && musicLoaded && !useGlobalPlayer) {
        startMusic()
        if (showPlayPrompt) {
          setShowPlayPrompt(false)
        }
      }
    }
    
    // Add the document-level click handler
    document.addEventListener('click', documentClickHandler)
    
    // Cleanup
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      if (audioRef.current && !useGlobalPlayer) {
        // Remove the ended event listener
        audioRef.current.removeEventListener('ended', handleSongEnded);
        
        // Save current state before unmounting
        saveCurrentMusicState();
        
        // Clean up properly
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
        } catch (e) {
          console.error("Error cleaning up audio:", e);
        }
        audioRef.current = null;
      }
      
      // Remove beforeunload event listener
      window.removeEventListener('beforeunload', saveCurrentMusicState);
      
      // Remove event listeners from the document
      document.removeEventListener('click', documentClickHandler);
    };
  }, []);
  
  // Try to autoplay audio (will be muted initially to comply with browser policies)
  const attemptAutoplay = async () => {
    if (!audioRef.current || !musicLoaded) return
    
    try {
      console.log("Attempting autoplay...")
      
      // Make sure audio is properly loaded
      if (audioRef.current.readyState < 2) { // HAVE_CURRENT_DATA or higher
        console.log("Audio not fully loaded yet, waiting...")
        
        // Wait for audio to be loaded enough to play
        await new Promise((resolve, reject) => {
          const loadHandler = () => {
            console.log("Audio ready state reached for autoplay")
            resolve()
          }
          
          const errorHandler = (e) => {
            console.error("Error while waiting for audio to load:", e)
            reject(e)
          }
          
          // Set a timeout to avoid hanging indefinitely
          const timeout = setTimeout(() => {
            audioRef.current.removeEventListener('canplaythrough', loadHandler)
            audioRef.current.removeEventListener('error', errorHandler)
            console.log("Timed out waiting for audio to load, proceeding anyway")
            resolve()
          }, 3000)
          
          audioRef.current.addEventListener('canplaythrough', () => {
            clearTimeout(timeout)
            loadHandler()
          }, { once: true })
          
          audioRef.current.addEventListener('error', (e) => {
            clearTimeout(timeout)
            errorHandler(e)
          }, { once: true })
        }).catch(err => {
          console.warn("Audio loading wait failed:", err)
          // Continue anyway as a fallback
        })
      }
      
      // Most music tracks don't need to start at a specific point, so we'll start at the beginning
      // audioRef.current.currentTime = 0;
      
      // Start muted to bypass autoplay restrictions
      audioRef.current.muted = true
      
      // Add a slight delay to ensure browser is ready
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log("Starting muted autoplay...")
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        await playPromise
        
        // Successfully autoplayed (muted)
        console.log("Muted autoplay successful")
        setMusicPlaying(true)
        
        // Unmute and fade in after a short delay
        setTimeout(() => {
          if (!audioRef.current) return
          
          console.log("Unmuting after successful autoplay")
          // Unmute
          audioRef.current.muted = false
          setIsMuted(false)
          
          // Fade in volume
          startMusic()
        }, 500)
      }
    } catch (err) {
      console.warn("Autoplay failed:", err)
      // Show prompt for user interaction
      setShowPlayPrompt(true)
      setMusicPlaying(false)
    }
  }
  
  // Start playing music with a 5-second fade-in to 50% volume
  const startMusic = () => {
    if (!audioRef.current || !musicLoaded) {
      console.warn("Cannot start music: Audio not loaded or ref is null")
      return
    }
    
    try {
      console.log(`Starting music: ${currentTrackTitle}`)
      
      // If we're already fading, clear it
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
      
      // Make sure we have the ended event listener set up
      if (audioRef.current) {
        // Remove any existing listeners to avoid duplicates
        audioRef.current.removeEventListener('ended', handleSongEnded);
        
        // Set loop to false and add the ended listener
        audioRef.current.loop = false;
        audioRef.current.addEventListener('ended', handleSongEnded);
      }
      
      // Play the audio if it's paused
      if (audioRef.current.paused) {
        // First ensure audio src is set
        if (!audioRef.current.src || audioRef.current.error) {
          const sourceTrack = musicTracks[currentTrack] || musicTracks[0];
          audioRef.current.src = `${sourceTrack.src}?t=${Date.now()}`;
          audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Error playing audio:", err)
            if (err.name === 'NotAllowedError') {
              // This error happens when user hasn't interacted with the page yet
              console.log("User interaction required - showing play prompt");
              setShowPlayPrompt(true);
            } else {
              // For other errors, try a different track
              console.log("Trying next track after play error");
              setTimeout(playNextTrack, 500);
            }
          })
        }
      }
      
      // Successfully started
      setMusicPlaying(true)
      setShowPlayPrompt(false)
      
      // Only fade in volume if not muted
      if (!isMuted) {
        // Start from 0 volume
        audioRef.current.volume = 0
        
        // Target 50% volume for background music
        const targetVolume = 0.5
        
        // Calculate steps for a 5-second fade-in
        // If we do steps every 50ms, we need 100 steps to reach 5 seconds
        // So each step should increase volume by targetVolume/100
        const fadeInSteps = 100
        const fadeInInterval = 50 // 50ms between steps
        const volumeStep = targetVolume / fadeInSteps
        
        // Fade in gradually over 5 seconds
        const fadeIn = setInterval(() => {
          if (!audioRef.current) {
            clearInterval(fadeIn)
            return
          }
          
          // Increase in small steps for smoother transition
          const newVolume = Math.min(audioRef.current.volume + volumeStep, targetVolume)
          audioRef.current.volume = newVolume
          
          if (newVolume >= targetVolume) {
            clearInterval(fadeIn)
            currentVolumeRef.current = targetVolume
          }
        }, fadeInInterval)
        
        fadeIntervalRef.current = fadeIn
      }
    } catch (error) {
      console.error("Error starting music:", error)
      setShowPlayPrompt(true)
    }
  }
  
  // Stop music with fade-out
  const stopMusic = () => {
    if (!audioRef.current || !musicPlaying) return
    
    try {
      // If we're already fading, clear it
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
      
      // Current volume
      const startVolume = audioRef.current.volume
      
      // Fade out gradually
      const fadeOut = setInterval(() => {
        if (!audioRef.current) {
          clearInterval(fadeOut)
          return
        }
        
        // Decrease in small steps
        const newVolume = Math.max(audioRef.current.volume - 0.02, 0)
        audioRef.current.volume = newVolume
        
        if (newVolume <= 0) {
          // Once volume is 0, pause and reset
          audioRef.current.pause()
          clearInterval(fadeOut)
          fadeIntervalRef.current = null
          setMusicPlaying(false)
        }
      }, 75) // Faster fade-out (75ms intervals)
      
      fadeIntervalRef.current = fadeOut
    } catch (error) {
      console.error("Error stopping music:", error)
      // Fallback - force stop
      if (audioRef.current) {
        audioRef.current.pause()
        setMusicPlaying(false)
      }
    }
  }
  
  // Toggle mute state without stopping playback
  const toggleMute = () => {
    if (!audioRef.current || !musicPlaying) return
    
    try {
      if (isMuted) {
        // Unmute - restore previous volume with fade
        audioRef.current.muted = false
        
        // Start from 0 volume
        audioRef.current.volume = 0
        
        // If we're already fading, clear it
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
        }
        
        // Fade in to the saved volume
        const fadeIn = setInterval(() => {
          if (!audioRef.current) {
            clearInterval(fadeIn)
            return
          }
          
          const newVolume = Math.min(audioRef.current.volume + 0.01, currentVolumeRef.current)
          audioRef.current.volume = newVolume
          
          if (newVolume >= currentVolumeRef.current) {
            clearInterval(fadeIn)
            fadeIntervalRef.current = null
          }
        }, 50)
        
        fadeIntervalRef.current = fadeIn
        setIsMuted(false)
      } else {
        // Mute - save current volume first
        currentVolumeRef.current = audioRef.current.volume || 0.5
        
        // If we're already fading, clear it
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
        }
        
        // Fade out then mute
        const fadeOut = setInterval(() => {
          if (!audioRef.current) {
            clearInterval(fadeOut)
            return
          }
          
          const newVolume = Math.max(audioRef.current.volume - 0.05, 0)
          audioRef.current.volume = newVolume
          
          if (newVolume <= 0) {
            // Once volume is 0, mute
            audioRef.current.muted = true
            clearInterval(fadeOut)
            fadeIntervalRef.current = null
          }
        }, 50) // Quick fade (50ms intervals)
        
        fadeIntervalRef.current = fadeOut
        setIsMuted(true)
      }
    } catch (error) {
      console.error("Error toggling mute state:", error)
    }
  }
  
  // Toggle music playing state
  const toggleMusic = () => {
    if (!audioRef.current || !musicLoaded) return
    
    if (musicPlaying) {
      // If playing, toggle mute instead of stopping
      toggleMute()
    } else {
      // If not playing, start it
      startMusic()
    }
  }
  
  // Handle any click on the scene to start music
  const handleSceneClick = (e) => {
    // Don't handle if clicking on a button or link
    if (e.target.closest('button') || e.target.closest('a')) {
      return
    }
    
    if (!musicPlaying && musicLoaded && !useGlobalPlayer) {
      startMusic()
      if (showPlayPrompt) {
        setShowPlayPrompt(false)
      }
    }
  }

  // Set up and clean up Three.js scene for background effects only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log("ThreeScene: Setting up Three.js scene");
    let mounted = true;
    let frameId = null;
    let renderer = null;
    let scene = null;
    let camera = null;
    
    // Define handleResize at this scope so it can be referenced in both setup and cleanup
    const handleResize = () => {
      if (!mounted || !renderer || !camera) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    // Safely create and append the renderer
    const setupScene = () => {
      try {
        // Check if component is still mounted and container exists
        if (!mounted || !containerRef.current) {
          console.log("ThreeScene: Abort setup - component unmounted or container missing");
          return;
        }
        
        // Create renderer with a unique ID to help with cleanup
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance" // Request high performance mode
        });
        
        // Add a data attribute for identification
        renderer.domElement.setAttribute('data-threejs-renderer', 'main-scene');
        renderer.domElement.id = 'threejs-canvas-' + Date.now();
        
        // Setup renderer with higher quality settings for better visibility
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
        renderer.setClearColor(0x000000, 0);
        
        // First remove any existing canvas to avoid duplicates
        const existingCanvas = containerRef.current.querySelector('canvas[data-threejs-renderer]');
        if (existingCanvas) {
          console.log("ThreeScene: Removing existing canvas before adding new one");
          existingCanvas.remove();
        }
        
        // Now append the new canvas and ensure proper z-index and visibility
        console.log("ThreeScene: Appending new canvas:", renderer.domElement.id);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.zIndex = '20'; // Increased z-index from 11 to 20 to ensure particles are above background
        renderer.domElement.style.pointerEvents = 'none'; // Don't block clicks
        
        // Target the specific particles container
        const particlesContainer = document.getElementById('particles-container') || containerRef.current;
        particlesContainer.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        
        // Create scene and camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Create circular particle texture
        const createCircleTexture = (size = 256, color = 0xffffff, falloff = 0.3) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          // Draw a radial gradient for a soft, circular particle
          const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,           // Inner circle at center
            size / 2, size / 2, size / 2     // Outer circle at radius
          );
          
          // Brighter white in center with harder edges for better visibility
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     // Pure white center
          gradient.addColorStop(0.2, 'rgba(255, 255, 255, 1.0)');   // Still fully bright
          gradient.addColorStop(falloff, 'rgba(240, 250, 255, 0.9)'); // Slightly blue tint with high opacity
          gradient.addColorStop(0.7, 'rgba(220, 240, 255, 0.6)');   // Light blue with medium visibility
          gradient.addColorStop(0.9, 'rgba(200, 230, 255, 0.3)');   // More blue tint, lower opacity
          gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');       // Fade to transparent
          
          // Fill circle
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, size);
          
          // Create texture from canvas
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          return texture;
        };
        
        // Create shared circular texture for all particles
        const circleTexture = createCircleTexture(256, 0xffffff, 0.5); // Larger texture (256 from 128), slower falloff
        
        // SUPER SIMPLE VERSION - Highly visible particles without complex shaders
        const createBrightParticles = () => {
          // Create three types of particles at different distances and sizes
          // for a better visual effect
          
          // Small particles (more numerous, evenly distributed across screen)
          const smallGeometry = new THREE.BufferGeometry();
          const smallPositions = [];
          
          // Create 3000 small particles well-distributed throughout the scene
          for (let i = 0; i < 3000; i++) {
            // Create a more even distribution across the visible field
            const x = (Math.random() * 2 - 1) * 30; // -30 to 30
            const y = (Math.random() * 2 - 1) * 20; // -20 to 20
            
            // Place particles at various distances but ensure they stay visible
            // Random z position between -20 and -2 (all behind camera)
            const z = -(Math.random() * 18 + 2);
            
            // Skip particles that would be too close to others (simple spacing)
            // This is a naive approach, but helps reduce clumping
            let tooClose = false;
            for (let j = Math.max(0, i-20); j < i; j += 3) { // Check last 20 particles
              const xj = smallPositions[j*3];
              const yj = smallPositions[j*3+1];
              const zj = smallPositions[j*3+2];
              
              if (xj !== undefined) {
                const distance = Math.sqrt(
                  Math.pow(x - xj, 2) + 
                  Math.pow(y - yj, 2) + 
                  Math.pow(z - zj, 2)
                );
                
                if (distance < 1.0) { // Minimum spacing
                  tooClose = true;
                  break;
                }
              }
            }
            
            if (!tooClose) {
              smallPositions.push(x, y, z);
            } else {
              // Try again with a different position
              i--;
            }
          }
          
          smallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(smallPositions, 3));
          
          const smallMaterial = new THREE.PointsMaterial({
            color: 0xF0F8FF, // Light blue/white (AliceBlue)
            size: 0.1, // Increased from 0.06 to 0.1 for better visibility
            transparent: true,
            opacity: 0.9, // Increased from 0.65 to 0.9
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: circleTexture // Apply circular texture
          });
          
          const smallParticles = new THREE.Points(smallGeometry, smallMaterial);
          scene.add(smallParticles);
          
          // Medium particles (fewer, further apart)
          const mediumGeometry = new THREE.BufferGeometry();
          const mediumPositions = [];
          
          // Create 300 medium particles (reduced from 500)
          for (let i = 0; i < 300; i++) {
            const x = (Math.random() * 2 - 1) * 35;
            const y = (Math.random() * 2 - 1) * 25;
            const z = -(Math.random() * 15 + 5); // Further back
            
            // Skip particles that would be too close to others
            let tooClose = false;
            for (let j = Math.max(0, i-10); j < i; j += 3) {
              const xj = mediumPositions[j*3];
              const yj = mediumPositions[j*3+1];
              const zj = mediumPositions[j*3+2];
              
              if (xj !== undefined) {
                const distance = Math.sqrt(
                  Math.pow(x - xj, 2) + 
                  Math.pow(y - yj, 2) + 
                  Math.pow(z - zj, 2)
                );
                
                if (distance < 3.0) { // Larger spacing for medium particles
                  tooClose = true;
                  break;
                }
              }
            }
            
            if (!tooClose) {
              mediumPositions.push(x, y, z);
            } else {
              // Try again
              i--;
            }
          }
          
          mediumGeometry.setAttribute('position', new THREE.Float32BufferAttribute(mediumPositions, 3));
          
          const mediumMaterial = new THREE.PointsMaterial({
            color: 0xE6F0FF, // Slightly more blue tint
            size: 0.2, // Increased from 0.12 to 0.2
            transparent: true,
            opacity: 0.95, // Increased from 0.75 to 0.95
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: circleTexture // Apply circular texture
          });
          
          const mediumParticles = new THREE.Points(mediumGeometry, mediumMaterial);
          scene.add(mediumParticles);
          
          // Large particles (very few, widely spaced)
          const largeGeometry = new THREE.BufferGeometry();
          const largePositions = [];
          
          // Create only 40 large particles (reduced from 100)
          for (let i = 0; i < 40; i++) {
            const x = (Math.random() * 2 - 1) * 35;
            const y = (Math.random() * 2 - 1) * 25;
            const z = -(Math.random() * 10 + 3); // Closer to camera but still behind
            
            // Ensure large particles are well separated
            let tooClose = false;
            for (let j = 0; j < i * 3; j += 3) {
              const xj = largePositions[j];
              const yj = largePositions[j+1];
              const zj = largePositions[j+2];
              
              if (xj !== undefined) {
                const distance = Math.sqrt(
                  Math.pow(x - xj, 2) + 
                  Math.pow(y - yj, 2) + 
                  Math.pow(z - zj, 2)
                );
                
                if (distance < 5.0) { // Much larger spacing
                  tooClose = true;
                  break;
                }
              }
            }
            
            if (!tooClose) {
              largePositions.push(x, y, z);
            } else {
              // Try again
              i--;
            }
          }
          
          largeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(largePositions, 3));
          
          const largeMaterial = new THREE.PointsMaterial({
            color: 0xD6E9FF, // More distinct blue tint
            size: 0.35, // Increased from 0.2 to 0.35
            transparent: true,
            opacity: 1.0, // Increased from 0.8 to 1.0 (fully opaque)
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: circleTexture // Apply circular texture
          });
          
          const largeParticles = new THREE.Points(largeGeometry, largeMaterial);
          scene.add(largeParticles);
          
          return {
            small: smallParticles,
            medium: mediumParticles,
            large: largeParticles
          };
        };
        
        // Create bright, simple particles
        const particles = createBrightParticles();
        
        // Animation function with more gentle, evenly distributed movement
        const animate = () => {
          if (!mounted || !renderer || !scene || !camera) return;
          
          // Get current time for wave effect
          const time = Date.now() * 0.00025; // Slower movement
          
          // Animate small particles - very slow, gentle movement
          if (particles.small) {
            // Use sine functions for more natural oscillation
            particles.small.rotation.y = Math.sin(time * 0.5) * 0.05;
            particles.small.rotation.x = Math.sin(time * 0.3) * 0.03;
            
            // Add subtle position shift to keep particles visible on screen at all times
            particles.small.position.x = Math.sin(time * 0.2) * 1.0;
            particles.small.position.y = Math.cos(time * 0.3) * 0.8;
          }
          
          // Animate medium particles - different direction, gentle wave
          if (particles.medium) {
            particles.medium.rotation.y = Math.sin(time * -0.4) * 0.04;
            particles.medium.rotation.z = Math.cos(time * 0.2) * 0.03;
            
            // Add subtle drift in a different direction
            particles.medium.position.x = Math.cos(time * 0.25) * 0.7;
            particles.medium.position.y = Math.sin(time * 0.35) * 0.5;
          }
          
          // Animate large particles - barely noticeable movement
          if (particles.large) {
            particles.large.rotation.z = Math.sin(time * 0.1) * 0.02;
            particles.large.rotation.x = Math.cos(time * 0.15) * 0.025;
            
            // Large particles should move very little
            particles.large.position.x = Math.sin(time * 0.15) * 0.3;
            particles.large.position.y = Math.cos(time * 0.1) * 0.2;
          }
          
          // Render the scene
          renderer.render(scene, camera);
          
          // Request next frame
          frameId = requestAnimationFrame(animate);
        };
        
        // Add resize event listener
        window.addEventListener('resize', handleResize);
        
        // Start animation loop
        animate();
        
        // Set loading to false when scene is ready
        setLoading(false);
        
      } catch (error) {
        console.error("Error setting up Three.js scene:", error);
        setError("Could not initialize 3D experience. Please try refreshing the page.");
        setLoading(false);
      }
    };
      
    // Setup the scene
    setupScene();
    
    // Clean up function - completely rewritten
    return () => {
      console.log("ThreeScene: Running cleanup");
      mounted = false;
      
      // Cancel any pending animation frame
      if (frameId) {
        console.log("ThreeScene: Cancelling animation frame:", frameId);
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      
      // Safe cleanup for renderer
      if (renderer) {
        console.log("ThreeScene: Disposing renderer");
        
        try {
          // First, try to find our canvas by its ID
          const canvasId = renderer.domElement.id;
          const canvas = document.getElementById(canvasId);
          
          if (canvas) {
            console.log("ThreeScene: Found canvas by ID, removing it");
            canvas.remove();
          } else if (containerRef.current) {
            // Fallback: try to find by attribute
            const canvases = containerRef.current.querySelectorAll('canvas[data-threejs-renderer]');
            console.log("ThreeScene: Found", canvases.length, "canvases with data attribute");
            
            // Remove them all to be safe
            canvases.forEach(canvas => {
              console.log("ThreeScene: Removing canvas:", canvas.id);
              canvas.remove();
            });
          }
        } catch (error) {
          console.warn("ThreeScene: Error during canvas cleanup:", error);
        }
        
        // Always properly dispose the renderer
        try {
          renderer.dispose();
          console.log("ThreeScene: Renderer disposed");
        } catch (error) {
          console.warn("ThreeScene: Error during renderer disposal:", error);
        }
        
        renderer = null;
        rendererRef.current = null;
      }
      
      // Clear references
      scene = null;
      camera = null;
      
      // Remove resize listener
      window.removeEventListener('resize', handleResize);
      console.log("ThreeScene: Cleanup complete");
    };
  }, []);

  // Create a dedicated function to save state to ensure it's consistent
  const saveCurrentMusicState = async () => {
    if (audioRef.current) {
      try {
        // Explicitly store the current track number and position
        const currentTime = audioRef.current.currentTime;
        const trackNumber = currentTrack;
        const mutedState = isMuted;
        
        console.log("ThreeScene: Saving precise audio state:", {
          track: trackNumber,
          position: currentTime,
          muted: mutedState,
          title: musicTracks[trackNumber]?.title
        });
        
        // Save exact current state to ensure continuity
        localStorage.setItem('musicPosition', currentTime.toString());
        localStorage.setItem('musicPlaying', 'true'); // Force playing state to true
        localStorage.setItem('musicMuted', mutedState.toString());
        localStorage.setItem('currentSongIndex', trackNumber.toString());
        
        // Ensure all four values were properly saved by explicitly reading them back
        const savedValues = {
          position: localStorage.getItem('musicPosition'),
          playing: localStorage.getItem('musicPlaying'),
          muted: localStorage.getItem('musicMuted'),
          index: localStorage.getItem('currentSongIndex')
        };
        
        console.log("ThreeScene: Verified localStorage values:", savedValues);
        
        // Force a small delay to ensure localStorage is written before navigation
        return new Promise(resolve => setTimeout(resolve, 50)); // Increased from 10ms to 50ms
      } catch (error) {
        console.error("Error saving music state:", error);
        // Fallback - at least save the current track index
        localStorage.setItem('currentSongIndex', currentTrack.toString());
        localStorage.setItem('musicPlaying', 'true');
        return Promise.resolve();
      }
    } else {
      console.warn("Cannot save music state - audioRef.current is null");
      // Fallback - at least save the current track index
      if (currentTrack !== undefined) {
        localStorage.setItem('currentSongIndex', currentTrack.toString());
        localStorage.setItem('musicPlaying', 'true');
      }
      return Promise.resolve();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onClick={!useGlobalPlayer ? handleSceneClick : undefined}
    >
      {/* Video background with slower fade-out effect */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ 
          opacity: showSpiderweb ? 1 - spiderwebOpacity : 1,
          transition: 'none', // Remove CSS transition - using JS for precise control
        }}
      >
        <source src="/assets/retrotvbackground.mp4" type="video/mp4" />
      </video>
      
      {/* Spiderweb image with slower fade-in effect */}
      {showSpiderweb && (
        <div 
          className="absolute inset-0 w-full h-full bg-black z-0"
          style={{ 
            backgroundImage: 'url(/assets/spiderweb.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: spiderwebOpacity,
            transition: 'none', // Remove CSS transition - using JS for precise control
          }}
        />
      )}
      
      {/* Loading message */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Initializing experience...</p>
        </div>
      )}
      
      {/* THREE.js Particles Container - Increased z-index */}
      <div className="absolute inset-0 opacity-100 z-20" id="particles-container" style={{ zIndex: 15 }}></div>
      
      {/* Static ORVELLO text with 3D glow AND tilt effect based on mouse position */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-15">
        <div 
          ref={orvelloTextRef}
          className="text-white text-8xl font-bold mb-16 text-center orvello-3d-container"
          style={{ 
            transform: `perspective(800px) rotateY(${mousePosition.x * -25}deg) rotateX(${mousePosition.y * 10}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <span className="orvello-letter" style={{ '--index': 0 }}>O</span>
          <span className="orvello-letter" style={{ '--index': 1 }}>R</span>
          <span className="orvello-letter" style={{ '--index': 2 }}>V</span>
          <span className="orvello-letter" style={{ '--index': 3 }}>E</span>
          <span className="orvello-letter" style={{ '--index': 4 }}>L</span>
          <span className="orvello-letter" style={{ '--index': 5 }}>L</span>
          <span className="orvello-letter" style={{ '--index': 6 }}>O</span>
        </div>
      </div>
      
      {/* Enter Store button container - moved further down from logo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 mt-40">
        {/* Error message */}
        {error && (
          <p className="text-red-400 mb-4">
            {error}
          </p>
        )}
        
        {/* Enter Store button - always visible */}
        <div className="mt-48 flex flex-col items-center space-y-4 pointer-events-auto">
          <Link 
            href="/releases" 
            onClick={async (e) => {
              e.preventDefault(); // Prevent default navigation
              
              try {
                // Make sure we save the current state
                await saveCurrentMusicState();
                
                // For extra safety, verify localStorage values were saved
                const savedIndex = localStorage.getItem('currentSongIndex');
                const savedPosition = localStorage.getItem('musicPosition');
                
                console.log("Pre-navigation check - localStorage values:");
                console.log("- Track index saved:", savedIndex);
                console.log("- Position saved:", savedPosition);
                
                // Only force values if they're missing AND we have music playing
                if ((savedIndex === null || savedIndex === undefined) && audioRef.current) {
                  // Force save the values if something went wrong
                  localStorage.setItem('currentSongIndex', currentTrack.toString());
                  localStorage.setItem('musicPlaying', 'true');
                  localStorage.setItem('musicPosition', audioRef.current.currentTime.toString());
                  localStorage.setItem('musicMuted', isMuted.toString());
                  
                  // Extra delay for localStorage
                  await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                // Now navigate programmatically after state is saved
                console.log("Navigation starting to /releases");
                window.location.href = "/releases";
              } catch (error) {
                console.error("Error during navigation:", error);
                // Fallback direct navigation if anything fails
                window.location.href = "/releases";
              }
            }}
          >
            <div className="blue-glow-button-container">
              <Button 
                className="blue-glow-button px-8 py-6 text-lg"
                style={{
                  backgroundColor: 'rgba(19, 78, 140, 0.3)', // Lower opacity from 0.6 to 0.3
                  color: 'white',
                  border: 'none',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 0 20px rgba(70, 170, 255, 0.3), inset 0 0 15px rgba(0, 60, 120, 0.4)', // Adjusted for lower opacity
                  textShadow: '0 0 5px rgba(255, 255, 255, 0.4)',
                  opacity: 0.8 // Add overall opacity
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!musicPlaying && audioRef.current && !useGlobalPlayer) {
                    startMusic();
                  }
                }}
              >
                Enter Store
              </Button>
            </div>
          </Link>
          
          {/* Fallback debug link */}
          <div className="text-xs text-gray-500 mt-4">
            <Link 
              href="/releases" 
              onClick={async (e) => {
                e.preventDefault(); // Prevent default navigation
                
                // Make sure we save the current state
                await saveCurrentMusicState();
                
                // Now navigate programmatically after state is saved
                window.location.href = "/releases";
              }} 
              className="underline hover:text-white"
            >
              Direct link to store if button doesn't work
            </Link>
          </div>
        </div>
      </div>
      
      {/* Music controls - only show if not using global player */}
      {!useGlobalPlayer && (
      <div className="absolute bottom-8 right-8 z-50 flex items-center">
        {/* Click for music text - positioned to the left of the music button */}
        {!musicPlaying && musicLoaded && !showPlayPrompt && (
          <div className="text-white text-sm mr-4 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
            <p className="flex items-center gap-2">
              <SpeakerWaveIcon className="h-4 w-4" />
              Click for music
            </p>
          </div>
        )}
        
          {/* Music control buttons group */}
          <div className="flex space-x-2">
            {/* Play/Pause Button */}
        <motion.button
          onClick={toggleMusic}
          className={`relative w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center
            ${musicPlaying && !isMuted ? 'bg-white text-black' : 'bg-black/70 text-white border border-white/20'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          title={!musicLoaded ? "Loading music..." : musicPlaying && !isMuted ? "Mute" : musicPlaying && isMuted ? "Unmute" : "Play Music"}
          aria-label={musicPlaying ? (isMuted ? "Unmute Music" : "Mute Music") : "Play Music"}
        >
          {/* Icon */}
              {!musicLoaded ? (
                <div className="animate-pulse">
                <SpeakerWaveIcon className="h-5 w-5" />
                </div>
              ) : musicPlaying && !isMuted ? (
                <SpeakerWaveIcon className="h-5 w-5" />
              ) : musicPlaying && isMuted ? (
                <SpeakerXMarkIcon className="h-5 w-5" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5" />
              )}
            </motion.button>
            
            {/* Next Song Button - always visible when music is playing */}
            {musicPlaying && (
              <motion.button
                onClick={playNextTrack}
                className="relative w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center
                  bg-black/70 text-white border border-white/20 hover:bg-black/90"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Next Song"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.555 6.168a.79.79 0 00-1.109 0 .79.79 0 000 1.109L8.893 9.75 6.446 12.223a.79.79 0 000 1.109.79.79 0 001.109 0l3-3a.75.75 0 000-1.06l-3-3zm5.334 0a.79.79 0 00-1.109 0 .79.79 0 000 1.109l2.446 2.447-2.446 2.447a.79.79 0 000 1.109.79.79 0 001.109 0l3-3a.75.75 0 000-1.06l-3-3z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
      </div>
        </div>
      )}
      
      {/* Music interaction prompt - only show if not using global player */}
      {!useGlobalPlayer && (
      <AnimatePresence>
        {showPlayPrompt && (
          <motion.div 
              className="fixed inset-0 flex items-center justify-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              style={{
                background: 'rgba(0, 10, 30, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            onClick={handleSceneClick}
          >
            <motion.div 
                className="relative max-w-md text-center px-8 py-12 rounded-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: 'linear-gradient(145deg, rgba(8, 33, 78, 0.6), rgba(15, 40, 95, 0.4))',
                  boxShadow: '0 8px 32px rgba(0, 60, 170, 0.4), 0 0 0 1px rgba(120, 200, 255, 0.1) inset',
                  backdropFilter: 'blur(25px)',
                  WebkitBackdropFilter: 'blur(25px)',
                  border: '1px solid rgba(120, 200, 255, 0.15)',
                }}
              >
                {/* Blue glow effect behind icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 130, 255, 0.15) 0%, rgba(20, 100, 220, 0.1) 40%, transparent 70%)',
                    filter: 'blur(15px)',
                    opacity: 0.8,
                    zIndex: 0,
                  }}
                />
                
                {/* Icon with blue glow */}
                <div className="relative mb-6">
                  <div className="absolute -inset-6 rounded-full opacity-40"
                    style={{
                      background: 'radial-gradient(circle, rgba(130, 200, 255, 0.4) 0%, rgba(0, 80, 200, 0.2) 50%, transparent 80%)',
                      filter: 'blur(20px)',
                    }}
                  />
                  <SpeakerWaveIcon className="h-16 w-16 mx-auto text-blue-200 drop-shadow-[0_0_8px_rgba(70,170,255,0.8)]" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3 relative z-10 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  <span className="text-blue-200">Audio</span> Experience
                </h2>
                
                <p className="text-blue-100/80 mb-8 text-lg relative z-10 leading-relaxed max-w-sm mx-auto">
                  Click anywhere to enable immersive soundtrack for the full Orvello experience.
                </p>
                
                <div 
                  className="flex flex-col items-center justify-center space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <Button 
                onClick={(e) => {
                      e.stopPropagation();
                      startMusic();
                    }}
                    className="px-8 py-3 text-black font-medium relative transition-all duration-300 z-10 overflow-hidden group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(180, 230, 255, 0.95), rgba(140, 210, 255, 0.9))',
                      boxShadow: '0 0 25px rgba(100, 180, 255, 0.7), 0 0 0 1px rgba(120, 200, 255, 0.3) inset',
                      borderRadius: '12px',
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">Enable Music</span>
              </Button>
                  
                  <p className="text-blue-200/70 text-sm">
                    Or click anywhere on the screen
                  </p>
                </div>
                
                {/* Background Orbs */}
                <div className="absolute -top-20 -right-16 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl z-0"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl z-0"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
      
      {/* CSS styles */}
      <style jsx>{`
        /* ORVELLO text styling with enhanced 3D glow effect */
        .orvello-3d-container {
          display: flex;
          justify-content: center;
          transform-style: preserve-3d;
          perspective: 800px;
          letter-spacing: 0.5rem;
          font-family: 'Arial', sans-serif;
          font-weight: 900;
          backface-visibility: hidden;
          transform-origin: center center;
        }
        
        .orvello-letter {
          display: inline-block;
          text-shadow: 0 0 10px rgba(255,255,255,0.8), 
                       0 0 20px rgba(255,255,255,0.6),
                       0 0 30px rgba(255,255,255,0.4),
                       0 2px 3px rgba(0,0,0,0.9),
                       0 4px 8px rgba(0,0,0,0.7),
                       0 8px 16px rgba(0,0,0,0.4);
          animation: float 8s ease-in-out infinite, pulse 3s ease-in-out infinite;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          text-stroke: 1px rgba(0,0,0,0.5);
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          transition: transform 0.1s ease-out, text-shadow 0.2s ease, color 0.2s ease;
          transform: translateZ(calc(var(--index) * 10px - 35px));
          cursor: pointer;
        }
        
        .orvello-letter:hover {
          transform: translateZ(50px) translateY(-15px) scale(1.1);
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255,255,255,1.0), 
                     0 0 40px rgba(255,255,255,0.9),
                     0 0 60px rgba(255,255,255,0.7),
                     0 2px 5px rgba(0,0,0,0.9),
                     0 8px 15px rgba(0,0,0,0.7),
                     0 15px 25px rgba(0,0,0,0.5);
          z-index: 10;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotateY(0deg) translateZ(calc(var(--index) * 10px - 35px));
          }
          25% {
            transform: translateY(-10px) rotateY(5deg) translateZ(calc(var(--index) * 10px - 30px));
          }
          50% {
            transform: translateY(5px) rotateY(-5deg) translateZ(calc(var(--index) * 10px - 35px));
          }
          75% {
            transform: translateY(-5px) rotateY(3deg) translateZ(calc(var(--index) * 10px - 32px));
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255,255,255,0.8), 
                       0 0 20px rgba(255,255,255,0.6),
                       0 0 30px rgba(255,255,255,0.4),
                       0 2px 3px rgba(0,0,0,0.9),
                       0 4px 8px rgba(0,0,0,0.7),
                       0 8px 16px rgba(0,0,0,0.4);
          }
          50% {
            text-shadow: 0 0 15px rgba(255,255,255,0.9), 
                       0 0 30px rgba(255,255,255,0.7),
                       0 0 40px rgba(255,255,255,0.5),
                       0 2px 3px rgba(0,0,0,0.9),
                       0 4px 8px rgba(0,0,0,0.7),
                       0 8px 16px rgba(0,0,0,0.4);
          }
        }
        
        /* Blue glow button container */
        .blue-glow-button-container {
          position: relative;
          display: inline-block;
        }
        
        .blue-glow-button-container::before {
          content: '';
          position: absolute;
          inset: -15px;
          background: radial-gradient(ellipse at center, 
            rgba(114, 191, 255, 0.2) 0%, 
            rgba(32, 156, 255, 0.3) 30%,
            rgba(23, 64, 139, 0.3) 60%, 
            transparent 75%);
          border-radius: 16px;
          opacity: 0.8;
          filter: blur(15px);
          z-index: -1;
          pointer-events: none;
        }
        
        .blue-glow-button-container::after {
          content: '';
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle at center, 
            rgba(0, 84, 159, 0.5) 0%,
            rgba(32, 109, 180, 0.3) 40%, 
            transparent 75%);
          border-radius: 16px;
          opacity: 0.6;
          filter: blur(12px);
          z-index: -2;
          pointer-events: none;
        }
        
        /* Animation for the blue glow effect around the button */
        @keyframes pulse-blue {
          0% {
            box-shadow: 0 0 15px 5px rgba(70, 170, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(70, 170, 255, 0.6);
          }
          100% {
            box-shadow: 0 0 15px 5px rgba(70, 170, 255, 0.4);
          }
        }
        
        .blue-glow-button {
          position: relative;
          overflow: hidden;
          background: linear-gradient(140deg, rgba(19, 78, 140, 0.6), rgba(32, 156, 255, 0.5), rgba(23, 64, 139, 0.7)) !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.4s ease !important;
        }
        
        .blue-glow-button:hover {
          animation: pulse-blue 2s infinite;
          background: linear-gradient(140deg, rgba(32, 109, 180, 0.7), rgba(70, 170, 255, 0.6), rgba(32, 109, 180, 0.7)) !important;
          color: white !important;
          box-shadow: 0 0 30px rgba(70, 170, 255, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px) scale(1.03) !important;
        }
        
        .blue-glow-button-container:hover::before {
          opacity: 1;
          filter: blur(20px);
        }
        
        .blue-glow-button-container:hover::after {
          opacity: 0.8;
          filter: blur(18px);
          inset: -15px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .transition-opacity {
          transition: opacity 2.5s ease-in-out;
        }
        
        .duration-2000 {
          transition-duration: 2000ms;
        }
      `}</style>
    </div>
  )
} 