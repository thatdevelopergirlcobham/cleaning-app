import React from 'react'
import { Star, Phone, Mail } from 'lucide-react'

interface Agent {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  rating?: number
  completed_jobs?: number
}

interface AgentHireCardProps {
  agent: Agent
  onHire?: (agent: Agent) => void
}

const AgentHireCard: React.FC<AgentHireCardProps> = ({ agent, onHire }) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-accent fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          {agent.avatar_url ? (
            <img
              src={agent.avatar_url}
              alt={agent.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary font-semibold text-lg">
              {agent.full_name.charAt(0)}
            </span>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-lg text-gray-900 mb-1">
            {agent.full_name}
          </h3>

          <div className="flex items-center space-x-4 mb-2">
            {agent.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(agent.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  {agent.rating.toFixed(1)}
                </span>
              </div>
            )}

            {agent.completed_jobs && (
              <span className="text-sm text-gray-600">
                {agent.completed_jobs} jobs completed
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{agent.email}</span>
            </div>

            {agent.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{agent.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hire Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onHire?.(agent)}
            className="btn-primary"
          >
            Hire Agent
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Certified CleanCal agent specializing in waste management and cleanup services.
        </p>
      </div>
    </div>
  )
}

export default AgentHireCard
