import React from 'react'
import AgentHireCard from '../../components/community/AgentHireCard'

const AgentHire: React.FC = () => {
  // Mock data - in real app this would come from API
  const agents = [
    {
      id: '1',
      full_name: 'John Smith',
      email: 'john@example.com',
      phone: '+234-123-4567',
      rating: 4.8,
      completed_jobs: 25
    },
    {
      id: '2',
      full_name: 'Mary Johnson',
      email: 'mary@example.com',
      phone: '+234-987-6543',
      rating: 4.9,
      completed_jobs: 32
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Hire Cleanup Agents</h1>
        <p className="text-gray-600 mt-1">Connect with certified CleanCal agents for professional waste management services</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => (
          <AgentHireCard
            key={agent.id}
            agent={agent}
            onHire={(agent) => console.log('Hire agent:', agent)}
          />
        ))}
      </div>
    </div>
  )
}

export default AgentHire
