'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'

interface WebcamFeedProps {
  onEmotionChange?: (emotion: string | null, confidence: number) => void
}

export default function WebcamFeed({ onEmotionChange }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [emotion, setEmotion] = useState<string | null>(null)
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  const addLog = (message: string) => {
    console.log(message)
    setDebugLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const getEmotionEmoji = (emotion: string | null) => {
    if (!emotion) return '😐'
    switch (emotion.toLowerCase()) {
      case 'happy': return '😊'
      case 'sad': return '😢'
      case 'angry': return '😠'
      case 'fearful': return '😨'
      case 'disgusted': return '🤢'
      case 'surprised': return '😲'
      case 'neutral': return '😐'
      default: return '🤔'
    }
  }

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      addLog(`Found ${videoDevices.length} camera(s)`)
      videoDevices.forEach((device, index) => {
        addLog(`Camera ${index + 1}: ${device.label || 'Unnamed'} (ID: ${device.deviceId})`)
      })
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId)
      }
    } catch (err) {
      addLog('Failed to enumerate devices: ' + (err as Error).message)
    }
  }, [selectedDeviceId])

  const checkPermissions = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
      addLog(`Permission: ${permissionStatus.state}`)
      return permissionStatus.state
    } catch (err) {
      addLog('Permission check failed: ' + (err as Error).message)
      return 'unknown'
    }
  }

  const startWebcam = async () => {
    setError(null)
    setIsLoading(true)
    addLog('Starting webcam...')

    try {
      await checkPermissions()

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
          ...(selectedDeviceId && { deviceId: { exact: selectedDeviceId } })
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      addLog(`Camera access granted: ${stream.getVideoTracks()[0]?.label || 'Unknown camera'}`)

      streamRef.current = stream
      const video = videoRef.current

      if (video) {
        video.onloadedmetadata = () => addLog('Video metadata loaded')
        video.onplaying = () => addLog('Video is playing')
        video.onerror = () => addLog('Video error occurred')
        video.srcObject = stream

        try {
          await video.play()
          addLog('Playback started successfully')
        } catch (playErr) {
          addLog('Playback error: ' + (playErr as Error).message)
        }
      }

      setIsActive(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to access camera'
      setError(errorMsg)
      addLog('Error: ' + errorMsg)

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') addLog('Permission denied by user')
        else if (err.name === 'NotFoundError') addLog('No camera found')
        else if (err.name === 'NotReadableError') addLog('Camera in use by another app')
        else if (err.name === 'OverconstrainedError') addLog('Unsupported camera config')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const stopWebcam = () => {
    addLog('Stopping webcam...')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setEmotion(null)
    setEmotionConfidence(0)
    addLog('Webcam stopped')
  }

  const loadModels = useCallback(async () => {
    try {
      addLog('Loading face detection models...')
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceExpressionNet.loadFromUri('/models')
      setModelsLoaded(true)
      addLog('Models loaded successfully')
    } catch (err) {
      addLog('Failed to load models: ' + (err as Error).message)
    }
  }, [])

  const analyzeEmotions = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || !isActive) return

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceExpressions()

      if (detections.length > 0) {
        const expressions = detections[0].expressions
        const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a as keyof typeof expressions] > expressions[b as keyof typeof expressions] ? a : b
        )
        const confidence = expressions[dominantEmotion as keyof typeof expressions] as number
        
        setEmotion(dominantEmotion)
        setEmotionConfidence(Math.round(confidence * 100))
        addLog(`Emotion: ${dominantEmotion} (${Math.round(confidence * 100)}%)`)
        
        // Call the callback to notify parent component
        if (onEmotionChange) {
          onEmotionChange(dominantEmotion, Math.round(confidence * 100))
        }
      } else {
        setEmotion(null)
        setEmotionConfidence(0)
        
        // Call the callback with null emotion
        if (onEmotionChange) {
          onEmotionChange(null, 0)
        }
      }
    } catch (err) {
      addLog('Emotion analysis error: ' + (err as Error).message)
    }
  }, [modelsLoaded, isActive, onEmotionChange])

  // Reload device list on mount
  useEffect(() => {
    getDevices()

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('getUserMedia not supported in this browser')
      addLog('getUserMedia not supported')
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [getDevices])

  // If the selected device changes while inactive, prepare it for the next start
  useEffect(() => {
    if (!isActive && selectedDeviceId) {
      addLog(`Selected device changed to ${selectedDeviceId}`)
    }
  }, [selectedDeviceId, isActive])

  // Load face detection models on mount
  useEffect(() => {
    loadModels()
  }, [loadModels])

  // Start emotion analysis when webcam is active and models are loaded
  useEffect(() => {
    if (isActive && modelsLoaded) {
      const interval = setInterval(analyzeEmotions, 1000) // Analyze every second
      return () => clearInterval(interval)
    }
  }, [isActive, modelsLoaded, analyzeEmotions])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600">📹</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Emotion Detection</h2>
            <p className="text-sm text-gray-600">AI-powered facial analysis</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Camera Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Camera Device</label>
          <div className="flex gap-2">
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              disabled={isActive}
              className="flex-1 text-sm text-black bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              style={{ color: 'black', backgroundColor: 'white' }}
            >
              {devices.map(device => (
                <option 
                  key={device.deviceId} 
                  value={device.deviceId}
                  className="text-black bg-white py-2"
                  style={{ color: 'black', backgroundColor: 'white' }}
                >
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <button
              onClick={getDevices}
              className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800">Camera Error</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Detection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Detection Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              modelsLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {modelsLoaded ? 'Ready' : 'Loading...'}
            </span>
          </div>
          
          {/* Permanent Emotion Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{emotion ? getEmotionEmoji(emotion) : '🤔'}</span>
                <div>
                  <p className="text-sm font-medium text-blue-900">{emotion || 'Detecting...'}</p>
                  <p className="text-xs text-blue-600">
                    {emotion ? `${emotionConfidence}% confidence` : 'Please look at camera'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Display */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-4xl mb-3">📹</div>
              <div className="text-sm font-medium">Click start to begin</div>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-4xl mb-3">⏳</div>
              <div className="text-sm font-medium">Starting camera...</div>
            </div>
          )}
          {isActive && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <button
              onClick={startWebcam}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Starting...' : 'Start Camera'}
            </button>
          ) : (
            <button
              onClick={stopWebcam}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Stop Camera
            </button>
          )}

          <button
            onClick={checkPermissions}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Check Permissions
          </button>
        </div>

        {/* Debug Log - Collapsible */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            <span>Debug Information</span>
            <span className="transform transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Debug Log</span>
              <button
                onClick={() => setDebugLog([])}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-50 rounded border p-3 h-20 overflow-y-auto">
              {debugLog.length === 0 ? (
                <div className="text-xs text-gray-400">No debug messages</div>
              ) : (
                debugLog.map((log, i) => (
                  <div key={i} className="text-xs text-gray-600 font-mono leading-relaxed">{log}</div>
                ))
              )}
            </div>
            
            {/* System Info */}
            <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200">
              <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
              <div>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
