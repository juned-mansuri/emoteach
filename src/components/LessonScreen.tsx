'use client'

import React, { useState, useEffect } from 'react'

interface Lesson {
  id: string
  title: string
  content: string
  simplifiedContent: string
  hints: string[]
  progress: number
}

interface LessonScreenProps {
  currentLesson: Lesson
  emotion: string | null
  emotionConfidence: number
  onProgress: (progress: number) => void
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

const fractionQuiz: QuizQuestion[] = [
  {
    question: "If you eat 2 slices out of 8 pizza slices, what fraction did you eat?",
    options: ["1/4", "2/8", "1/2", "3/4"],
    correct: 1,
    explanation: "Great! 2 out of 8 slices is 2/8. You can also say 1/4 since 2/8 = 1/4!"
  },
  {
    question: "Which fraction is bigger: 1/2 or 1/4?",
    options: ["1/4", "1/2", "They're the same", "Can't tell"],
    correct: 1,
    explanation: "Excellent! 1/2 means half, while 1/4 means one quarter. Half is bigger than a quarter!"
  },
  {
    question: "If you drink 3/4 of your juice, how much is left?",
    options: ["1/4", "1/2", "3/4", "Nothing"],
    correct: 0,
    explanation: "Perfect! If you drink 3/4, then 1/4 is left. Together they make the whole: 3/4 + 1/4 = 4/4 = 1 whole!"
  }
]

export default function LessonScreen({ 
  currentLesson, 
  emotion, 
  emotionConfidence, 
  onProgress 
}: LessonScreenProps) {
  const [adaptationMode, setAdaptationMode] = useState<'normal' | 'simplified' | 'encouraging' | 'quiz'>('normal')
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [encouragementMessage, setEncouragementMessage] = useState('')
  const [adaptationReason, setAdaptationReason] = useState('')
  const [lastAdaptationTime, setLastAdaptationTime] = useState(0)
  const [adaptationCooldown] = useState(10000) // 10 seconds cooldown

  // Detect negative emotions and adapt content with time interval
  useEffect(() => {
    if (!emotion || emotionConfidence < 60) return

    const currentTime = Date.now()
    const timeSinceLastAdaptation = currentTime - lastAdaptationTime

    // Only adapt if enough time has passed since last adaptation
    if (timeSinceLastAdaptation < adaptationCooldown) {
      return
    }

    const negativeEmotions = ['sad', 'angry', 'fearful', 'disgusted', 'confused']
    const confusedEmotions = ['confused', 'fearful', 'sad']
    const frustratedEmotions = ['angry', 'disgusted']

    if (negativeEmotions.includes(emotion.toLowerCase())) {
      setLastAdaptationTime(currentTime)
      if (confusedEmotions.includes(emotion.toLowerCase())) {
        setAdaptationMode('simplified')
        setAdaptationReason('I noticed you might be feeling confused. Let me explain this more simply!')
        setEncouragementMessage("Don't worry! Learning new things can be tricky. Let's break it down step by step.")
      } else if (frustratedEmotions.includes(emotion.toLowerCase())) {
        setAdaptationMode('quiz')
        setAdaptationReason('I see you might be frustrated. How about a fun interactive quiz to re-engage?')
        setEncouragementMessage("Let's try something interactive! Sometimes a quick quiz helps us feel more confident.")
        setShowQuiz(true)
      }
    } else if (['happy', 'excited', 'surprised'].includes(emotion.toLowerCase())) {
      // Don't update timestamp for positive emotions to allow frequent positive reinforcement
      setAdaptationMode('encouraging')
      setAdaptationReason('Great! You seem engaged. Keep up the excellent work!')
      setEncouragementMessage("You're doing amazing! Your positive energy is wonderful to see.")
    } else {
      setAdaptationMode('normal')
      setAdaptationReason('')
      setEncouragementMessage('')
    }
  }, [emotion, emotionConfidence, lastAdaptationTime, adaptationCooldown])

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowAnswer(true)
    
    if (answerIndex === fractionQuiz[currentQuizIndex].correct) {
      setQuizScore(prev => prev + 1)
    }
  }

  const nextQuizQuestion = () => {
    if (currentQuizIndex < fractionQuiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
    } else {
      setShowQuiz(false)
      setAdaptationMode('encouraging')
      setEncouragementMessage(`Quiz completed! You got ${quizScore + (selectedAnswer === fractionQuiz[currentQuizIndex].correct ? 1 : 0)} out of ${fractionQuiz.length} correct!`)
      onProgress(Math.min(currentLesson.progress + 25, 100))
    }
  }

  const resetQuiz = () => {
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowAnswer(false)
    setQuizScore(0)
    setShowQuiz(false)
    setAdaptationMode('normal')
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* Permanent Floating Emotion Indicator - Fixed Position */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-lg">{emotion && emotionConfidence > 50 ? getEmotionEmoji(emotion) : '🤔'}</span>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900">
                {emotion && emotionConfidence > 50 ? emotion : 'Detecting...'}
              </div>
              <div className="text-xs text-gray-600">
                {emotion && emotionConfidence > 50 ? `${emotionConfidence}%` : 'Please look at camera'}
              </div>
            </div>
            {adaptationReason && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Adapting
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permanent Encouragement Message */}
      <div className="bg-green-50 border-b border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-sm">💡</span>
          </div>
          <p className="text-sm text-green-800 font-medium">
            {encouragementMessage || "You're doing amazing! Your positive energy is wonderful to see."}
          </p>
        </div>
      </div>

      {/* Quiz Mode */}
      {showQuiz && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Practice Quiz</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Test your understanding</p>
                {adaptationReason && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    • Adapted for you
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {currentQuizIndex + 1} of {fractionQuiz.length}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {fractionQuiz[currentQuizIndex].question}
              </h4>

              <div className="space-y-3">
                {fractionQuiz[currentQuizIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showAnswer && handleQuizAnswer(index)}
                    disabled={showAnswer}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      showAnswer
                        ? index === fractionQuiz[currentQuizIndex].correct
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : selectedAnswer === index
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-900'
                    }`}
                    style={{ 
                      color: showAnswer 
                        ? (index === fractionQuiz[currentQuizIndex].correct ? '#15803d' 
                           : selectedAnswer === index ? '#dc2626' 
                           : '#374151')
                        : '#111827'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-black">{option}</span>
                      {showAnswer && index === fractionQuiz[currentQuizIndex].correct && (
                        <span className="text-green-600">✓</span>
                      )}
                      {showAnswer && selectedAnswer === index && index !== fractionQuiz[currentQuizIndex].correct && (
                        <span className="text-red-600">✗</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showAnswer && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 mb-4">
                    {fractionQuiz[currentQuizIndex].explanation}
                  </p>
                  <button
                    onClick={nextQuizQuestion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {currentQuizIndex < fractionQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Score: {quizScore}/{fractionQuiz.length}
              </div>
              <button
                onClick={resetQuiz}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Lesson Content */}
      {!showQuiz && (
        <div className="p-6">
          {/* Lesson Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentLesson.title}
            </h1>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${currentLesson.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Progress: {currentLesson.progress}%
            </p>
          </div>

          {/* Adaptive Content */}
          <div className="mb-6">
            {adaptationMode === 'simplified' ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <span>📚</span> Simplified Explanation
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentLesson.simplifiedContent}
                  </div>
                </div>
                
                {/* Extra Examples for Confused Students */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <span>🍎</span> More Examples to Help
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>• If you have 8 crayons and use 3, you used 3/8 of them</p>
                    <p>• If you read 5 pages out of a 10-page book, you read 5/10 = 1/2</p>
                    <p>• If you eat 1 out of 3 cookies, you ate 1/3 of the cookies</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                  {currentLesson.content}
                </div>
              </div>
            )}

            {/* Helpful Hints */}
            {(adaptationMode === 'simplified' || adaptationMode === 'encouraging') && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <span>💡</span> Helpful Hints
                </h4>
                <div className="space-y-2">
                  {currentLesson.hints.map((hint, index) => (
                    <p key={index} className="text-sm text-green-700">
                      {hint}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center border-t border-gray-200 pt-6">
            <button
              onClick={() => {
                setShowQuiz(true)
                setAdaptationMode('quiz')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Take Quiz
            </button>
            
            <button
              onClick={() => onProgress(Math.min(currentLesson.progress + 10, 100))}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Mark Complete
            </button>
            
            <button
              onClick={() => {
                setAdaptationMode('simplified')
                setAdaptationReason('You requested a simpler explanation')
                setEncouragementMessage('No problem! Here\'s a simpler way to understand this.')
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Simplify
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
