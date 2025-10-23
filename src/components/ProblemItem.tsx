import React from 'react'

export interface ProblemItemProps {
  index: number
  title: string
  passRate: string
  submits: string
}

const ProblemItem: React.FC<ProblemItemProps> = ({ index, title, passRate, submits }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div className="flex items-center gap-3">
        <span className="text-gray-500">#{index}</span>
        <a href="#" className="font-medium hover:text-brand">{title}</a>
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div>通过率 {passRate}</div>
        <div>{submits}</div>
      </div>
    </div>
  )
}

export default ProblemItem