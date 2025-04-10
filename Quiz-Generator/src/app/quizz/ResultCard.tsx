import React from 'react'

type Props = {
    isCorrect: boolean | null,
    correctAnswer: string
}

const ResultCard = (props: Props) => {
  const { isCorrect } = props;

  if(isCorrect === null) {
    return null
  }

  
  return (
    <div>ResultCard</div>
  )
}

export default ResultCard