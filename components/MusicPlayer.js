"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid"

// Define a simpler, more reliable track list with formats known to work well
const musicTracks = [
  {
    src: "/assets/background-music.mp3",
    title: "Original Background Music"
  }
];

// Check if there are additional tracks and add them only if confirmed to exist
try {
  // Dynamically populate tracks at runtime to avoid issues
  if (typeof window !== 'undefined') {
    const additionalTracks = [
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
    
    // Will be added dynamically after checking
    if (additionalTracks?.length) {
      additionalTracks.forEach(track => musicTracks.push(track));
    }
  }
} catch (e) {
  console.warn("Error setting up additional tracks", e);
}

// Simplify to just use the reliable track
const FALLBACK_TRACK = {
  src: "/assets/background-music.mp3",
  title: "Background Music (Fallback)"
};

// Helper function to validate a track exists
const validateTrack = async (trackSrc) => {
  return new Promise((resolve) => {
    const testAudio = new Audio();
    
    // Set timeout to handle non-responsive requests
    const timeout = setTimeout(() => {
      testAudio.onerror = null;
      testAudio.oncanplaythrough = null;
      resolve(false);
    }, 3000);
    
    testAudio.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    testAudio.oncanplaythrough = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    testAudio.src = trackSrc;
    testAudio.load();
  });
};

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false) 
  const [isPulsing, setIsPulsing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [lastPlayedTrack, setLastPlayedTrack] = useState(null)
  const [tracksValidated, setTracksValidated] = useState(false)
  
  const audioRef = useRef(null)
  const fadeIntervalRef = useRef(null)
  const currentVolumeRef = useRef(0.5) // 50% volume
  const animationTimeoutRef = useRef(null)
  const keepAliveRef = useRef(null) // Ref to store keepalive interval
  const retryAttemptsRef = useRef(0)
  
  // Smooth fade in function - MOVED ABOVE playNextTrack to fix reference error
  const fadeInAudio = useCallback(() => {
    if (!audioRef.current) return;
    
    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    // Start from current volume or 0
    let volume = audioRef.current.volume || 0;
    const targetVolume = currentVolumeRef.current || 0.5;
    
    // Create smooth fade in effect
    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeIntervalRef.current);
        return;
      }
      
      // Increase by 5% each interval
      volume = Math.min(volume + 0.05, targetVolume);
      audioRef.current.volume = volume;
      
      // Clear interval when reaching target
      if (volume >= targetVolume) {
        clearInterval(fadeIntervalRef.current);
      }
    }, 100); // 10 updates per second for smooth fade
  }, []);
  
  // Function to play the next track in the playlist
  const playNextTrack = useCallback(() => {
    if (!audioRef.current) {
      console.error("Cannot play next track: audio element is null");
      return;
    }
    
    console.log("playNextTrack: Playing next song in sequence");
    
    try {
      // Get current track index
      const currentIndex = currentTrack;
      
      // Increment retry counter - we'll reset on success
      retryAttemptsRef.current += 1;
      
      // If we've tried too many times, use fallback track
      if (retryAttemptsRef.current > 3) {
        console.warn("Too many retry attempts, using fallback track");
        
        // First pause the current track to avoid AbortError
        audioRef.current.pause();
        
        // Save current state
        const wasMuted = audioRef.current.muted;
        const volume = audioRef.current.volume || currentVolumeRef.current;
        
        // Set simple fallback track
        audioRef.current.src = `${FALLBACK_TRACK.src}?t=${Date.now()}`;
        audioRef.current.load();
        audioRef.current.volume = volume;
        audioRef.current.muted = wasMuted;
        audioRef.current.loop = false;
        
        // Play fallback
        audioRef.current.play()
          .then(() => {
            console.log("Fallback track started successfully");
            retryAttemptsRef.current = 0;
            setCurrentTrack(0); // Update state to match fallback track
          })
          .catch(e => console.error("Error playing fallback track:", e));
        
        return;
      }
      
      // Find next track, ensuring we don't play the same track twice in a row if we have more than one track
      let nextTrack = (currentIndex + 1) % musicTracks.length;
      
      // If we have more than one track and we're about to repeat the same track,
      // skip to the next one instead
      if (musicTracks.length > 1 && nextTrack === lastPlayedTrack) {
        nextTrack = (nextTrack + 1) % musicTracks.length;
        console.log(`Avoiding repeat of the same track, skipping to ${nextTrack}`);
      }
      
      console.log(`Moving to next track: ${nextTrack} - ${musicTracks[nextTrack].title}`);
      
      // Remember this track to avoid immediate repeats
      setLastPlayedTrack(currentIndex);
      
      // First pause the current track to avoid AbortError
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
      
      // Save current state
      const wasMuted = audioRef.current.muted;
      const wasPlaying = isPlaying;
      const volume = audioRef.current.volume || currentVolumeRef.current;
      
      // Update state
      setCurrentTrack(nextTrack);
      
      localStorage.setItem('currentSongIndex', nextTrack.toString());
      
      // Set up the new track with a simple approach
      try {
        // Remove ALL event listeners to prevent duplicates and memory leaks
        const oldAudio = audioRef.current;
        oldAudio.oncanplaythrough = null;
        oldAudio.onerror = null;
        oldAudio.onended = null;
        oldAudio.onpause = null;
        oldAudio.onsuspended = null;
        
        // Create a fresh audio element to avoid any state issues with the existing one
        const newAudio = new Audio();
        newAudio.preload = "auto";
        newAudio.crossOrigin = "anonymous";
        audioRef.current = newAudio;
        
        // Add timestamp to URL to avoid browser caching issues
        const trackSrc = `${musicTracks[nextTrack].src}?t=${Date.now()}`;
        console.log(`Setting source to track ${nextTrack}: ${trackSrc}`);
        
        // Set new source and properties
        newAudio.src = trackSrc;
        newAudio.volume = volume;
        newAudio.muted = wasMuted;
        newAudio.loop = false;
        
        // Add ended event to handle continuous playback
        const handleEnded = () => {
          console.log("Track ended naturally, playing next track");
          playNextTrack();
        };
        
        newAudio.addEventListener('ended', handleEnded);
        
        // Add error handler
        newAudio.onerror = (e) => {
          console.error("Error loading track:", e);
          setTimeout(() => playNextTrack(), 500);
        };
        
        // Start loading
        newAudio.load();
        
        // Play when ready
        if (wasPlaying) {
          const playWhenReady = () => {
            if (!audioRef.current) return;
            
            audioRef.current.play()
              .then(() => {
                console.log("Next track started successfully");
                setIsPlaying(true);
                retryAttemptsRef.current = 0; // Reset retry counter on success
                
                // If volume is zero, fade in properly
                if (audioRef.current.volume < 0.1) {
                  fadeInAudio();
                }
              })
              .catch(e => {
                console.error("Error playing next track:", e);
                
                // Try again after a short delay
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.play()
                      .then(() => retryAttemptsRef.current = 0)
                      .catch(err => {
                        console.error("Second attempt also failed:", err);
                        // If still failing, try next track
                        setTimeout(() => playNextTrack(), 1000);
                      });
                  }
                }, 1000);
              });
          };
          
          // Set up the canplaythrough handler for the new audio element
          newAudio.addEventListener('canplaythrough', playWhenReady, { once: true });
          
          // Set a timeout in case canplaythrough doesn't fire
          setTimeout(() => {
            if (audioRef.current && audioRef.current.readyState >= 2 && audioRef.current.paused) {
              console.log("Timeout - forcing playback");
              playWhenReady();
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error setting up next track:", error);
        
        // Use fallback on any error after short delay
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = `${FALLBACK_TRACK.src}?t=${Date.now()}`;
            audioRef.current.load();
            
            if (wasPlaying) {
              audioRef.current.play().catch(e => console.error("Error playing fallback:", e));
            }
          }
        }, 1000);
      }
      
      // Trigger animation
      setIsPulsing(true);
      
      // Reset pulsing after 4 seconds
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      animationTimeoutRef.current = setTimeout(() => {
        setIsPulsing(false);
      }, 4000);
      
    } catch (error) {
      console.error("Error in playNextTrack:", error);
    }
  }, [currentTrack, isPlaying, lastPlayedTrack, fadeInAudio]);
  
  // Validate all tracks on initial load
  useEffect(() => {
    if (typeof window === 'undefined' || tracksValidated) return;
    
    const validateTracks = async () => {
      console.log("Validating music tracks...");
      
      // Create validated track list
      const validatedTracks = [];
      
      // Always add fallback as first valid track
      validatedTracks.push(FALLBACK_TRACK);
      
      // Check each track
      for (const track of musicTracks) {
        try {
          const isValid = await validateTrack(track.src);
          if (isValid) {
            validatedTracks.push(track);
            console.log(`Validated track: ${track.title}`);
          } else {
            console.warn(`Track failed validation: ${track.title}`);
          }
        } catch (e) {
          console.error(`Error validating track ${track.title}:`, e);
        }
      }
      
      // Replace tracks array if we have valid tracks
      if (validatedTracks.length > 1) {
        musicTracks.length = 0;
        validatedTracks.forEach(track => musicTracks.push(track));
      }
      
      setTracksValidated(true);
      console.log(`${musicTracks.length} valid tracks available`);
    };
    
    validateTracks();
  }, [tracksValidated]);
  
  // Initialize player with saved track and position
  useEffect(() => {
    // Skip this during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Create audio element to handle music playback
    const audio = new Audio();
    audio.id = 'musicPlayer';
    audio.preload = "auto";
    audio.crossOrigin = "anonymous"; // Help with cross-origin issues
    
    // Set extended buffer to prevent glitching
    if ('mozAutoplayEnabled' in audio || audio.mozAutoplayEnabled !== undefined) {
      // Firefox specific
      audio.mozPreservesPitch = false;
    }
    
    if ('webkitPreservesPitch' in audio || audio.webkitPreservesPitch !== undefined) {
      // Safari specific
      audio.webkitPreservesPitch = false;
    }
    
    console.log("Music player: Initializing audio"); 
    
    // Set up a keepalive ping to prevent browser from suspending audio context
    // This helps prevent glitching and pausing in the middle of playback
    const setupKeepAlive = () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
      }
      
      keepAliveRef.current = setInterval(() => {
        if (!audioRef.current) return;
        
        if (!audioRef.current.paused) {
          try {
            // Small ping function to keep audio context active
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 0;
            
            // Save current position to localStorage
            localStorage.setItem('musicPosition', currentTime.toString());
            
            // Prevent weird stopping near the end by triggering next track earlier
            if (duration > 0 && (duration - currentTime) < 3) {
              console.log("Near end of track, preemptively playing next track");
              
              // Remove the ended event since we're handling it manually
              audioRef.current.removeEventListener('ended', playNextTrack);
              playNextTrack();
              return; // Skip the rest of the checks
            }
            
            // Log to console every 30 seconds for debugging
            if (Math.floor(currentTime) % 30 === 0 && Math.floor(currentTime) > 0) {
              console.log(`Music keepalive: ${currentTime.toFixed(1)}/${duration.toFixed(1)}s`);
            }
            
            // Check if somehow audio is stuck (duration is valid but not advancing)
            if (audioRef.current.stuckAt === currentTime && audioRef.current.stuckAt !== undefined) {
              audioRef.current.stuckCount = (audioRef.current.stuckCount || 0) + 1;
              
              // If stuck for 3 consecutive checks, try to unstick
              if (audioRef.current.stuckCount > 3) {
                console.warn("Audio appears stuck, trying to recover");
                
                // Try to unstick by seeking slightly forward
                audioRef.current.currentTime = currentTime + 0.5;
                audioRef.current.stuckCount = 0;
              }
            } else {
              audioRef.current.stuckAt = currentTime;
              audioRef.current.stuckCount = 0;
            }
          } catch (e) {
            console.error("Error in keep-alive:", e);
          }
        }
      }, 1000); // Check every second
    };
    
    setupKeepAlive();
    
    // Load the last played track from localStorage
    let trackIndex = 0;
    let startPosition = 0;
    let startMuted = false;
    
    try {
      const savedTrackIndex = localStorage.getItem('currentSongIndex');
      const savedPosition = localStorage.getItem('musicPosition');
      const savedMuted = localStorage.getItem('musicMuted');
      
      if (savedTrackIndex !== null) {
        trackIndex = parseInt(savedTrackIndex, 10);
        if (isNaN(trackIndex) || trackIndex < 0 || trackIndex >= musicTracks.length) {
          console.warn("Invalid saved track index, resetting to 0");
          trackIndex = 0;
        }
      }
      
      if (savedPosition !== null) {
        startPosition = parseFloat(savedPosition);
        if (isNaN(startPosition) || startPosition < 0) {
          startPosition = 0;
        }
      }
      
      if (savedMuted === 'true') {
        startMuted = true;
      }
      
      console.log(`Music player: Restoring track ${trackIndex} at position ${startPosition}s, muted: ${startMuted}`);
      // Store the initial track index in a ref so we don't need to update state here
      const initialTrackRef = useRef(trackIndex);
      initialTrackRef.current = trackIndex;
    } catch (error) {
      console.warn("Music player: Error restoring track state", error);
      trackIndex = 0;
      startPosition = 0;
    }
    
    // Function to save current audio state before page unload
    const saveAudioState = () => {
      if (!audioRef.current) return;
      
      try {
        localStorage.setItem('currentSongIndex', currentTrack.toString());
        localStorage.setItem('musicPosition', audioRef.current.currentTime.toString());
        localStorage.setItem('musicPlaying', (!audioRef.current.paused).toString());
        localStorage.setItem('musicMuted', audioRef.current.muted.toString());
        
        console.log(`Music player: Saved state at position ${audioRef.current.currentTime}s`);
      } catch (error) {
        console.warn("Music player: Error saving audio state", error);
      }
    };
    
    // Add unload handler to save state on navigation
    window.addEventListener('beforeunload', saveAudioState);
    
    // Set up audio element with simplified approach
    const setupAudio = async () => {
      try {
        audioRef.current = audio;
        
        // Set up source
        try {
          // Safety check - make sure track exists
          const safeTrackIndex = trackIndex >= 0 && trackIndex < musicTracks.length ? trackIndex : 0;
          
          console.log(`Setting up track ${safeTrackIndex}: ${musicTracks[safeTrackIndex]?.title}`);
          
          // After audio is fully set up, update state once to match the current track
          // This avoids the state update during initialization
          setTimeout(() => {
            setCurrentTrack(safeTrackIndex);
          }, 0);
          
          // Create a versioned URL to avoid browser caching issues
          const trackSrc = `${musicTracks[safeTrackIndex]?.src || FALLBACK_TRACK.src}?v=${Date.now()}`;
          audio.src = trackSrc;
          
          // Apply initial settings
          audio.muted = startMuted;
          audio.volume = 0.5; // 50% volume
          audio.loop = false; // Make sure loop is OFF so 'ended' event fires
          
          // Only set currentTime if we're reasonably sure it's valid
          if (startPosition > 0 && startPosition < 1000) {
            // Set position in a try/catch because it can throw if track isn't loaded
            try {
              audio.currentTime = startPosition;
            } catch (e) {
              console.warn("Couldn't set start position, will retry later", e);
              
              // Try again after a short delay
              setTimeout(() => {
                if (audioRef.current) {
                  try {
                    audioRef.current.currentTime = startPosition;
                  } catch (err) {
                    console.warn("Failed to set position on retry");
                  }
                }
              }, 1000);
            }
          }
          
          // Handle errors properly
          audio.onerror = (e) => {
            console.warn("Audio error during initialization, trying fallback", e);
            
            // Try fallback and reset error handler
            audio.onerror = null;
            audio.src = `${FALLBACK_TRACK.src}?v=${Date.now()}`;
            audio.load();
            
            // Mark loading as completed even with error
            setIsLoading(false);
            setLoadError(true);
          };
          
          // CRITICAL - add ended event listener to ensure next track plays
          audio.addEventListener('ended', () => {
            console.log("Track ended in initial setup");
            playNextTrack();
          });
          
        } catch (srcError) {
          console.error("Music player: Error setting src", srcError);
          audio.src = `${FALLBACK_TRACK.src}?v=${Date.now()}`;
        }
        
        // Set up event handlers
        const handleCanPlay = () => {
          console.log(`Music player: Audio ready at ${audio.currentTime}s`);
          setIsLoading(false);
          
          // Auto play if it was playing before
          const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
          if (wasPlaying) {
            // Start with very low volume and fade in to avoid clicks
            audio.volume = 0.1;
            
            audio.play().then(() => {
              setIsPlaying(true);
              setIsMuted(audio.muted);
              console.log("Music player: Autoplay successful");
              
              // Fade in volume
              fadeInAudio();
            }).catch(error => {
              console.warn("Music player: Autoplay rejected, waiting for user interaction", error);
              // Auto-mute to allow quick play on next user interaction
              setIsPlaying(false);
              setIsMuted(true);
            });
          } else {
            setIsPlaying(false);
            setIsMuted(true);
          }
        };
        
        // Setup canplaythrough handler - make sure it only fires once
        audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
        
        // Add suspended state detection
        audio.addEventListener('suspended', () => {
          console.warn("Audio context suspended - attempting to resume");
          
          // Try to resume after a short delay
          setTimeout(() => {
            if (audioRef.current && !audioRef.current.paused) {
              // Try to trigger resume by seeking slightly forward
              try {
                const currentTime = audioRef.current.currentTime;
                audioRef.current.currentTime = currentTime + 0.1;
              } catch (e) {
                console.error("Failed to resume from suspended state", e);
              }
            }
          }, 500);
        });
        
        // Load the audio
        audio.load();
        
        // Set a timeout in case loading takes too long
        const loadTimeout = setTimeout(() => {
          // If we're still loading after timeout, try the fallback
          if (isLoading && audioRef.current) {
            console.warn("Audio loading timed out, using fallback");
            audio.src = `${FALLBACK_TRACK.src}?v=${Date.now()}`;
            audio.load();
          }
        }, 5000);
        
        // At the end of the setupAudio function, add a listener to detect audio suspension:
        audio.addEventListener('pause', (e) => {
          // Only log for unexpected pauses (not user-initiated)
          if (isPlaying && !isMuted) {
            console.log("Unexpected pause detected - attempting to resume playback");
            // Try to resume playback after a short delay
            setTimeout(() => {
              if (audioRef.current && isPlaying && !audioRef.current.ended) {
                audioRef.current.play().catch(e => 
                  console.error("Failed to resume after unexpected pause", e)
                );
              }
            }, 500);
          }
        });
        
        return () => {
          clearTimeout(loadTimeout);
          audio.removeEventListener('canplaythrough', handleCanPlay);
        };
      } catch (error) {
        console.error("Music player: Error initializing audio:", error);
        setLoadError(true);
        setIsLoading(false);
      }
    };
    
    setupAudio();
    
    // Cleanup
    return () => {
      // Save state before unmounting
      saveAudioState();
      
      // Then clean up resources
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      
      // Clean up audio
      if (audioRef.current) {
        // Remove all event listeners
        audioRef.current.oncanplaythrough = null;
        audioRef.current.onerror = null;
        audioRef.current.onended = null;
        audioRef.current.onsuspended = null;
        audioRef.current.onpause = null;
        
        // Stop and clear
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
          audioRef.current = null;
        } catch (e) {
          console.warn("Error cleaning up audio element", e);
        }
      }
      
      window.removeEventListener('beforeunload', saveAudioState);
    };
  // Use an empty dependency array to ensure this effect only runs once on mount
  }, []);
  
  // Handle time updates to sync visual effects with music beats
  useEffect(() => {
    if (!audioRef.current || !isPlaying || isMuted) return;
    
    // Simulate detecting beat by pulsing every ~2 seconds
    const beatInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 500);
    }, 4000);
    
    return () => clearInterval(beatInterval);
  }, [isPlaying, isMuted]);
  
  // Toggle play/pause functionality
  const togglePlayback = useCallback(() => {
    // Deactivated during loading
    if (isLoading) {
      console.log("Toggle attempted while loading - ignoring");
      return;
    }
    
    if (!audioRef.current) {
      console.error("Cannot toggle playback: audio element is null");
      return;
    }
    
    try {
      if (isPlaying && !isMuted) {
        // Currently playing unmuted - set to muted
        audioRef.current.muted = true;
        setIsMuted(true);
        console.log("Music player: Audio muted");
        
        // Save to localStorage
        localStorage.setItem('musicMuted', 'true');
      } else if (isPlaying && isMuted) {
        // Currently muted - unmute
        audioRef.current.muted = false;
        setIsMuted(false);
        console.log("Music player: Audio unmuted");
        
        // Save to localStorage
        localStorage.setItem('musicMuted', 'false');
        
        // If volume is too low, fade in
        if (audioRef.current.volume < 0.1) {
          fadeInAudio();
        }
      } else {
        // Not playing - start playback
        // First ensure we have a valid src
        if (!audioRef.current.src || audioRef.current.src === 'undefined' || audioRef.current.error) {
          // Set a valid source if current one is bad
          const safeIndex = currentTrack >= 0 && currentTrack < musicTracks.length ? 
            currentTrack : 0;
          
          console.log(`Fixing bad source before play - setting to track ${safeIndex}`);
          
          // Set src and reload
          audioRef.current.src = `${musicTracks[safeIndex].src}?t=${Date.now()}`;
          audioRef.current.load();
          
          // Make sure the ended event is attached
          audioRef.current.addEventListener('ended', () => {
            console.log("Track ended event from togglePlayback listener");
            playNextTrack();
          });
        }
        
        // Reset retry counter when user manually plays
        retryAttemptsRef.current = 0;
        
        // Start with low volume for smoother start
        audioRef.current.volume = 0.1;
        audioRef.current.muted = false;
        audioRef.current.loop = false; // Ensure loop is off so ended event fires
        
        // Try to play with better error handling
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          
          // Save state to localStorage
          localStorage.setItem('musicPlaying', 'true');
          localStorage.setItem('musicMuted', 'false');
          
          // Fade in the volume
          fadeInAudio();
          
          // Trigger the pulse animation
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 4000);
          
          console.log("Music player: Playback started successfully");
        }).catch(error => {
          console.error("Music player: Error playing audio", error);
          
          // If we get a specific error about user interaction required:
          if (error.name === 'NotAllowedError') {
            console.warn("User interaction required before playback can start");
            
            // Mark as playing but muted to make the next click unmute
            setIsPlaying(true);
            setIsMuted(true);
            
            // Make sure the audio is actually muted
            audioRef.current.muted = true;
          } else {
            // For other errors, try to use the fallback track
            setTimeout(() => {
              if (audioRef.current) {
                console.log("Trying fallback track after error");
                audioRef.current.src = `${FALLBACK_TRACK.src}?t=${Date.now()}`;
                audioRef.current.load();
                
                // Add ended handler
                audioRef.current.addEventListener('ended', () => {
                  console.log("Fallback track ended");
                  playNextTrack();
                });
                
                // Retry play with the fallback
                audioRef.current.play()
                  .then(() => {
                    setIsPlaying(true);
                    setIsMuted(false);
                    
                    // If success, fade in and save state
                    fadeInAudio();
                    localStorage.setItem('musicPlaying', 'true'); 
                    localStorage.setItem('musicMuted', 'false');
                  })
                  .catch(err => {
                    console.error("Fallback also failed:", err);
                    
                    // Last-ditch effort - mute and try once more
                    audioRef.current.muted = true;
                    audioRef.current.play().catch(() => {
                      // Give up gracefully
                      console.error("All playback attempts failed");
                    });
                    
                    // Set state to match reality
                    setIsPlaying(false);
                    setIsMuted(true);
                  });
              }
            }, 500);
          }
        });
      }
    } catch (err) {
      console.error("Unexpected error in togglePlayback:", err);
      
      // Try to recover to a known state
      if (audioRef.current) {
        try {
          // Mute to be safe
          audioRef.current.muted = true;
          setIsMuted(true);
          
          // Reset src to fallback
          audioRef.current.src = `${FALLBACK_TRACK.src}?t=${Date.now()}`;
          audioRef.current.load();
          
          // Update state to match reality
          setIsPlaying(false);
        } catch (e) {
          // At this point, there's not much more we can do
          console.error("Failed to recover from error:", e);
        }
      }
    }
  }, [isPlaying, isMuted, isLoading, currentTrack, fadeInAudio, playNextTrack]);
  
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-2">
        {/* Main play/pause/mute button */}
      <motion.button
        onClick={togglePlayback}
        disabled={isLoading}
        className={`relative w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg
                   ${isLoading ? 'bg-black/40 cursor-wait' : 'bg-black/80 hover:bg-black'}`}
        whileHover={{ scale: isLoading ? 1 : 1.1 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        title={isLoading ? "Loading music..." : isPlaying && !isMuted ? "Mute" : isPlaying && isMuted ? "Unmute" : "Play Music"}
      >
          {/* Simple pulse effect */}
        {isPlaying && !isMuted && !loadError && !isLoading && (
          <>
            <motion.div 
                className="absolute w-full h-full rounded-full border border-blue-400/30"
                animate={{ 
                  scale: isPulsing ? [1, 1.6, 1] : 1, 
                  opacity: isPulsing ? [0.7, 0, 0.7] : 0.7 
                }}
                transition={{ 
                  duration: isPulsing ? 4 : 0.3,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute w-full h-full rounded-full border border-blue-400/20"
              animate={{ 
                  scale: isPulsing ? [1, 1.4, 1] : 1, 
                  opacity: isPulsing ? [0.5, 0, 0.5] : 0.5
              }}
              transition={{ 
                  duration: isPulsing ? 4 : 0.3,
                  delay: 0.1,
                  ease: "easeInOut"
              }}
            />
            <motion.div 
                className="absolute w-full h-full rounded-full border border-blue-400/10"
              animate={{ 
                  scale: isPulsing ? [1, 1.2, 1] : 1, 
                  opacity: isPulsing ? [0.3, 0, 0.3] : 0.3
              }}
              transition={{ 
                  duration: isPulsing ? 4 : 0.3,
                  delay: 0.2,
                  ease: "easeInOut"
              }}
            />
          </>
        )}
        
        {/* Icon */}
        <div className="relative text-white">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPlaying && !isMuted ? (
            <SpeakerWaveIcon className="h-5 w-5" />
          ) : isPlaying && isMuted ? (
            <SpeakerXMarkIcon className="h-5 w-5" />
          ) : (
            <SpeakerXMarkIcon className="h-5 w-5" />
          )}
        </div>
        
        {/* Baby blue glow effect */}
          <motion.div 
          className="absolute inset-0 rounded-full opacity-70"
            animate={{
            boxShadow: isPlaying && !isMuted && !isLoading
                ? isPulsing 
                  ? '0 0 20px 8px rgba(120, 210, 255, 0.8)' 
                  : '0 0 10px 3px rgba(120, 210, 255, 0.5)'
                : '0 0 8px 2px rgba(120, 210, 255, 0.2)',
            }}
            transition={{ duration: 1 }}
          />
        </motion.button>
        
        {/* Next track button - show whenever audio is playing (even if muted) */}
        {isPlaying && (
          <motion.button
            onClick={playNextTrack}
            className="relative w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg
                     bg-black/80 hover:bg-black text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Next Song"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.555 6.168a.79.79 0 00-1.109 0 .79.79 0 000 1.109L8.893 9.75 6.446 12.223a.79.79 0 000 1.109.79.79 0 001.109 0l3-3a.75.75 0 000-1.06l-3-3zm5.334 0a.79.79 0 00-1.109 0 .79.79 0 000 1.109l2.446 2.447-2.446 2.447a.79.79 0 000 1.109.79.79 0 001.109 0l3-3a.75.75 0 000-1.06l-3-3z" clipRule="evenodd" />
            </svg>
            
            {/* Glow effect for next button */}
            <motion.div 
              className="absolute inset-0 rounded-full opacity-50"
              animate={{
                boxShadow: isPulsing 
                  ? '0 0 15px 4px rgba(120, 210, 255, 0.6)' 
              : '0 0 10px 2px rgba(120, 210, 255, 0.3)',
          }}
              transition={{ duration: 1 }}
        />
      </motion.button>
        )}
      </div>
    </motion.div>
  )
} 