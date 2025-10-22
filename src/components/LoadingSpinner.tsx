import React from 'react'

interface LoadingSpinnerProps {
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${className}`} />
  )
}

export default LoadingSpinner
