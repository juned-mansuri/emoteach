'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import WebcamFeed from '@/components/WebcamFeed'
import LessonScreen from '@/components/LessonScreen'

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  simplifiedContent: string
  hints: string[]
  progress: number
  category: string
}

const sampleLessons: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Fractions",
    description: "Learn the basics of fractions with visual examples",
    content: "A fraction represents a part of a whole. When we write 1/2, we mean one part out of two equal parts.",
    simplifiedContent: "A fraction is like a piece of a pie! If you cut a pie into 2 equal pieces and take 1 piece, you have 1/2 of the pie.",
    hints: ["Think of fractions like pizza slices", "The bottom number shows how many pieces total", "The top number shows how many pieces you have"],
    progress: 0,
    category: "Mathematics"
  },
  {
    id: "2",
    title: "Adding Fractions",
    description: "Master the art of adding fractions together",
    content: "To add fractions with the same denominator, simply add the numerators and keep the denominator the same.",
    simplifiedContent: "When fractions have the same bottom number, just add the top numbers! Like 1/4 + 2/4 = 3/4.",
    hints: ["Only add the top numbers", "Keep the bottom number the same", "Check if your answer can be simplified"],
    progress: 0,
    category: "Mathematics"
  },
  {
    id: "3",
    title: "Equivalent Fractions",
    description: "Understand how different fractions can represent the same value",
    content: "Equivalent fractions are fractions that represent the same value, like 1/2 and 2/4.",
    simplifiedContent: "Some fractions look different but mean the same thing! Like 1/2 is the same as 2/4 - they're both half!",
    hints: ["Multiply or divide top and bottom by the same number", "1/2 = 2/4 = 3/6", "Draw pictures to see they're equal"],
    progress: 0,
    category: "Mathematics"
  }
]

export default function DemoPage() {
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null)
  const [emotionConfidence, setEmotionConfidence] = useState(0)
  const [lessons, setLessons] = useState(sampleLessons)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const handleEmotionChange = useCallback((emotion: string | null, confidence: number) => {
    setCurrentEmotion(emotion)
    setEmotionConfidence(confidence)
  }, [])

  const handleLessonProgress = useCallback((lessonId: string, progress: number) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId ? { ...lesson, progress } : lesson
    ))
  }, [])

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200'
    if (progress < 50) return 'bg-yellow-400'
    if (progress < 100) return 'bg-blue-400'
    return 'bg-green-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/landing" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              EmoTeach
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/landing" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ← Back to Landing
              </Link>
              <span className="text-sm text-gray-500">Demo Mode</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          EmoTeach <span className="text-blue-600">Demo</span>
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          AI-Powered Adaptive Learning Platform
        </p>
        
        {/* Permanent Current Emotion Display */}
        <div className="inline-block bg-white rounded-lg shadow-sm border px-4 py-2 mx-auto mt-4">
          <p className="text-sm text-gray-700">
            Current emotion: <span className="font-semibold text-blue-600">
              {currentEmotion && emotionConfidence > 50 ? currentEmotion : 'Detecting...'}
            </span> ({currentEmotion && emotionConfidence > 50 ? `${emotionConfidence}%` : 'Please look at camera'})
          </p>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Camera Feed - Left Side */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Camera Feed</h2>
              <WebcamFeed onEmotionChange={handleEmotionChange} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-5">
            {selectedLesson ? (
              <LessonScreen 
                currentLesson={selectedLesson}
                emotion={currentEmotion}
                emotionConfidence={emotionConfidence}
                onProgress={(progress) => handleLessonProgress(selectedLesson.id, progress)}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-fit">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Choose a Lesson to Begin</h3>
                  <p className="text-gray-600 mb-6">
                    Select any lesson from the sidebar to start your adaptive learning experience. 
                    The AI will monitor your emotions and adjust the content accordingly.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Real-time Adaptation</h4>
                      <p className="text-sm text-blue-700">Content adjusts based on your emotional state</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Personalized Learning</h4>
                      <p className="text-sm text-green-700">Each lesson tailored to your needs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getProgressColor(lesson.progress)}`}></div>
                    <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                    <span className="text-xs text-gray-500">{lesson.progress}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Lessons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Lessons</h3>
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedLesson?.id === lesson.id
                        ? 'border-blue-300 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{lesson.category}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className={`w-2 h-2 rounded-full ${lesson.progress > 0 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${lesson.progress > 50 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${lesson.progress === 100 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Take Practice Quiz
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  View Progress Report
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Adjust Settings
                </button>
              </div>
            </div>

            {/* Emotion Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Insights</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current State</span>
                  <span className="text-sm font-medium text-blue-600">
                    {currentEmotion || 'Detecting...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className="text-sm font-medium text-green-600">
                    {emotionConfidence > 50 ? `${emotionConfidence}%` : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Adaptation Mode</span>
                  <span className="text-sm font-medium text-purple-600">
                    {currentEmotion ? 'Active' : 'Standby'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            EmoTeach Demo - Built for EduHack 2025
          </p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/landing" className="text-sm text-blue-600 hover:text-blue-700">
              About EmoTeach
            </Link>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Documentation
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
