import { RefObject, useEffect, useState } from 'react'

interface PlayerProps {
  videoRef: RefObject<HTMLVideoElement>
  onTimeUpdate?: (currentTime: number) => void
  onDurationChange?: (duration: number) => void
  onEnded?: () => void
}

const Player = ({ 
  videoRef,
  onTimeUpdate,
  onDurationChange,
  onEnded
}: PlayerProps) => {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime)
    }

    const handleDurationChange = () => {
      onDurationChange?.(video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('ended', onEnded || (() => {}))

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('ended', onEnded || (() => {}))
    }
  }, [videoRef, onTimeUpdate, onDurationChange, onEnded])

  return null // This is a controller component, no UI needed
}

export default Player