'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'

export default function  WebcamFeed() {
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
      } else {
        setEmotion(null)
        setEmotionConfidence(0)
      }
    } catch (err) {
      addLog('Emotion analysis error: ' + (err as Error).message)
    }
  }, [modelsLoaded, isActive])

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
    <div className="w-80 bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">Webcam Test</h2>
        <p className="text-xs text-gray-500 mt-1">Testing webcam before emotion detection</p>
      </div>

      {/* Camera Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Camera:</label>
        <div className="flex gap-1">
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={isActive}
            className="flex-1 text-xs border rounded px-2 py-1 bg-gray-600 disabled:bg-gray-100"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
          <button
            onClick={getDevices}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border hover:bg-blue-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-xs bg-red-50 text-red-600 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Emotion Detection Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700">Emotion Detection:</span>
          <span className={`px-2 py-1 rounded text-xs ${modelsLoaded ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
            {modelsLoaded ? 'Ready' : 'Loading models...'}
          </span>
        </div>
        {emotion && (
          <div className="bg-blue-50 text-blue-700 p-2 rounded border border-blue-200">
            <div className="text-sm font-medium">Detected: {emotion}</div>
            <div className="text-xs">Confidence: {emotionConfidence}%</div>
          </div>
        )}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <div className="text-2xl mb-2">📹</div>
            <div className="text-xs">Click Start to test webcam</div>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-xs">Loading...</div>
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
            className="flex-1 py-2 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Starting...' : 'Start Webcam'}
          </button>
        ) : (
          <button
            onClick={stopWebcam}
            className="flex-1 py-2 px-3 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop Webcam
          </button>
        )}

        <button
          onClick={checkPermissions}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check
        </button>
      </div>

      {/* Debug Log */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Debug Log</h3>
          <button
            onClick={() => setDebugLog([])}
            className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        <div className="bg-gray-50 rounded border p-2 h-20 overflow-y-auto">
          {debugLog.length === 0 ? (
            <div className="text-xs text-gray-400">Debug messages will appear here...</div>
          ) : (
            debugLog.map((log, i) => (
              <div key={i} className="text-xs text-gray-600 font-mono">{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="text-xs text-gray-400 space-y-1 border-t pt-2">
        <div>Browser: {navigator.userAgent}</div>
        <div>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
}
