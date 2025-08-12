'use client'

import WebcamFeed from '@/components/WebcamFeed'
import LessonScreen from '@/components/LessonScreen'
import React, { useState } from 'react'

// Sample lesson data with enhanced content for adaptive learning
const sampleLesson = {
  id: '1',
  title: 'Introduction to Fractions',
  content: `Let's explore fractions together! A fraction represents a part of a whole. Think of it like sharing a pizza 🍕 with your friends. 
  
  If you have a pizza cut into 4 equal slices and you eat 1 slice, you've eaten 1/4 (one-fourth) of the pizza. The number on top (1) is called the numerator - it tells us how many parts we have. The number on the bottom (4) is called the denominator - it tells us how many equal parts the whole is divided into.
  
  Fractions are everywhere in real life! When you're halfway through a movie, you've watched 1/2 of it. When you complete 3 out of 4 homework problems, you've done 3/4 of your work. Pretty cool, right?`,
  
  simplifiedContent: `Let's learn about fractions with something fun - pizza! 🍕
  
  Imagine you have a pizza cut into 4 pieces. If you eat 1 piece, you ate 1/4 of the pizza!
  
  The number on top (1) = how many pieces you have
  The number on bottom (4) = how many pieces total
  
  That's it! Fractions just show parts of something whole. Like eating half an apple (1/2) or drinking a quarter of your juice (1/4)!`,
  
  hints: [
    "Remember: The top number (numerator) shows how many parts you have 📊",
    "The bottom number (denominator) shows how many parts make up the whole 🎯",
    "Try thinking of fractions like pieces of your favorite snack or toy! 🍫",
    "Practice with real objects around you - books, toys, or even cookies! 🍪"
  ],
  progress: 0
}

export default function Page() {
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null)
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0)
  const [lessonData, setLessonData] = useState(sampleLesson)

  const handleProgress = (newProgress: number) => {
    setLessonData(prev => ({
      ...prev,
      progress: newProgress
    }))
  }

  const handleEmotionChange = (emotion: string | null, confidence: number) => {
    setCurrentEmotion(emotion)
    setEmotionConfidence(confidence)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          EmoTeach
        </h1>
        <p className="text-gray-600 text-lg">
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 auto-rows-min">
          
          {/* Main Lesson Content - Large Card */}
          <div className="col-span-12 lg:col-span-8 row-span-3">
            <LessonScreen 
              currentLesson={lessonData}
              emotion={currentEmotion}
              emotionConfidence={emotionConfidence}
              onProgress={handleProgress}
            />
          </div>

          {/* Webcam Feed - Medium Card */}
          <div className="col-span-12 lg:col-span-4 row-span-2">
            <WebcamFeed onEmotionChange={handleEmotionChange} />
          </div>

          {/* Progress Stats - Small Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <div className="text-2xl">📊</div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Current Lesson</span>
                    <span className="font-medium text-gray-900">{lessonData.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${lessonData.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-xs text-gray-600">Lessons</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Small Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <div className="text-2xl">⚡</div>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Take Quiz
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Review Notes
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Get Help
                </button>
              </div>
            </div>
          </div>

          {/* Emotion Insights - Medium Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Emotion Insights</h3>
                <div className="text-2xl">🧠</div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Focus Level</span>
                  <span className="text-sm font-medium text-green-600">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="text-sm font-medium text-blue-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Learning State</span>
                  <span className="text-sm font-medium text-purple-600">Optimal</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 You&apos;re in a great learning state! Keep up the momentum.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
