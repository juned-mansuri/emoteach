'use client'

import WebcamFeed from '@/components/WebcamFeed'
import React, { useState } from 'react'
// import LessonScreen from '@/components/LessonScreen'
// import WebcamTest from '@/components/WebcamTest'

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
  const [currentEmotion] = useState<'happy' | 'confused' | 'stressed' | 'focused' | 'excited' | 'neutral'>('neutral')
  const [lessonData, setLessonData] = useState(sampleLesson)

  const handleProgress = (newProgress: number) => {
    setLessonData(prev => ({
      ...prev,
      progress: newProgress
    }))
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🎓 EmoTeach - Your Caring AI Learning Companion 💝
        </h1>
        <p className="text-gray-600 text-lg mb-4">
           Learning that adapts to your emotions, celebrates your progress, and supports you every step of the way!
        </p>
      </header>

      {/* Main Content - Split Screen Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* Left Side - Lesson Content (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* <LessonScreen 
              currentLesson={lessonData}
              emotion={currentEmotion}
              onProgress={handleProgress}
            /> */}
          </div>

          {/* Right Side - Webcam Test */}
          <div className="space-y-6">
            <WebcamFeed/>
                    
          </div>
        </div>
      </div>
    </div>
  )
}
