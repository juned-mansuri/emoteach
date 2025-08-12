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

  // Detect negative emotions and adapt content
  useEffect(() => {
    if (!emotion || emotionConfidence < 60) return // Only react to confident detections

    const negativeEmotions = ['sad', 'angry', 'fearful', 'disgusted', 'confused']
    const confusedEmotions = ['confused', 'fearful', 'sad']
    const frustratedEmotions = ['angry', 'disgusted']

    if (negativeEmotions.includes(emotion.toLowerCase())) {
      if (confusedEmotions.includes(emotion.toLowerCase())) {
        setAdaptationMode('simplified')
        setAdaptationReason('I noticed you might be feeling confused. Let me explain this more simply!')
        setEncouragementMessage("Don&apos;t worry! Learning new things can be tricky. Let&apos;s break it down step by step. 🌟")
      } else if (frustratedEmotions.includes(emotion.toLowerCase())) {
        setAdaptationMode('quiz')
        setAdaptationReason('I see you might be frustrated. How about a fun interactive quiz to re-engage?')
        setEncouragementMessage("Let&apos;s try something interactive! Sometimes a quick quiz helps us feel more confident. 🎯")
        setShowQuiz(true)
      }
    } else if (['happy', 'excited', 'surprised'].includes(emotion.toLowerCase())) {
      setAdaptationMode('encouraging')
      setAdaptationReason('Great! You seem engaged. Keep up the excellent work!')
      setEncouragementMessage("You&apos;re doing amazing! Your positive energy is wonderful to see. 🎉")
    } else {
      setAdaptationMode('normal')
      setAdaptationReason('')
      setEncouragementMessage('')
    }
  }, [emotion, emotionConfidence])

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
      // Quiz completed
      setShowQuiz(false)
      setAdaptationMode('encouraging')
      setEncouragementMessage(`Quiz completed! You got ${quizScore + (selectedAnswer === fractionQuiz[currentQuizIndex].correct ? 1 : 0)} out of ${fractionQuiz.length} correct! 🏆`)
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

  const getEmotionColor = (emotion: string | null) => {
    if (!emotion) return 'gray'
    switch (emotion.toLowerCase()) {
      case 'happy': return 'green'
      case 'sad': return 'blue'
      case 'angry': return 'red'
      case 'fearful': return 'purple'
      case 'disgusted': return 'orange'
      case 'surprised': return 'yellow'
      case 'neutral': return 'gray'
      default: return 'gray'
    }
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Emotion Status Bar */}
      {emotion && emotionConfidence > 50 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-lg">{getEmotionEmoji(emotion)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Detected emotion: {emotion}
              </h3>
              <p className="text-xs text-gray-600">
                Confidence: {emotionConfidence}%
              </p>
            </div>
            {adaptationReason && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Adapting content
              </div>
            )}
          </div>
          
          {adaptationReason && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                {adaptationReason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Encouragement Message */}
      {encouragementMessage && (
        <div className="bg-green-50 border-b border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-sm">💡</span>
            </div>
            <p className="text-sm text-green-800 font-medium">{encouragementMessage}</p>
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {showQuiz && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Practice Quiz</h3>
              <p className="text-sm text-gray-600">Test your understanding</p>
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
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
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
              Exit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Main Lesson Content */}
      {!showQuiz && (
        <div className="space-y-6">
          {/* Lesson Header */}
          <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl shadow-lg">
            <h1 className="text-4xl font-black text-gray-900 mb-4 bg-white px-6 py-3 rounded-xl shadow-md inline-block">
              {currentLesson.title}
            </h1>
            <div className="w-full bg-gray-300 rounded-full h-6 shadow-inner mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${currentLesson.progress}%` }}
              ></div>
            </div>
            <p className="text-xl text-gray-800 font-bold">
              Progress: {currentLesson.progress}%
            </p>
          </div>

          {/* Adaptive Content */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg border-2 border-gray-200">
            {adaptationMode === 'simplified' ? (
              <div className="space-y-6">
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-black text-yellow-900 mb-4 flex items-center">
                    📚 Simplified Explanation
                  </h3>
                  <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-line font-medium">
                    {currentLesson.simplifiedContent}
                  </div>
                </div>
                
                {/* Extra Examples for Confused Students */}
                <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-6 shadow-md">
                  <h4 className="text-xl font-black text-blue-900 mb-4 flex items-center">
                    🍎 More Examples to Help
                  </h4>
                  <div className="space-y-3 text-lg text-blue-800 font-semibold">
                    <p>• If you have 8 crayons and use 3, you used 3/8 of them</p>
                    <p>• If you read 5 pages out of a 10-page book, you read 5/10 = 1/2</p>
                    <p>• If you eat 1 out of 3 cookies, you ate 1/3 of the cookies</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-line font-medium bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
                {currentLesson.content}
              </div>
            )}

            {/* Helpful Hints */}
            {(adaptationMode === 'simplified' || adaptationMode === 'encouraging') && (
              <div className="mt-8 bg-green-100 border-2 border-green-400 rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-black text-green-900 mb-4 flex items-center">
                  💡 Helpful Hints
                </h4>
                <div className="space-y-3">
                  {currentLesson.hints.map((hint, index) => (
                    <p key={index} className="text-lg text-green-800 font-semibold">
                      {hint}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 justify-center flex-wrap">
            <button
              onClick={() => {
                setShowQuiz(true)
                setAdaptationMode('quiz')
              }}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all"
            >
              🧠 Take Practice Quiz
            </button>
            
            <button
              onClick={() => onProgress(Math.min(currentLesson.progress + 10, 100))}
              className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all"
            >
              ✅ Mark as Understood
            </button>
            
            <button
              onClick={() => {
                setAdaptationMode('simplified')
                setAdaptationReason('You requested a simpler explanation')
                setEncouragementMessage('No problem! Here\'s a simpler way to understand this. 📖')
              }}
              className="px-8 py-4 bg-yellow-600 text-white text-lg font-bold rounded-xl hover:bg-yellow-700 shadow-lg transform hover:scale-105 transition-all"
            >
              🔄 Need Simpler Explanation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
