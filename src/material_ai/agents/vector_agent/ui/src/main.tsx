import React from 'react'
import { type MFEProps } from './types'
import { EmbeddingChart } from './Embeddings'

const VectorAgentUI: React.FC<MFEProps> = ({ChatSection, Greeting}) => {
  return (
    <>
      <Greeting greeting='Ready to understand vectors'/>
      <ChatSection
        build={(data) => {
          return <EmbeddingChart coords={data} />
        }}
      />
    </>
    
  )
}

export default VectorAgentUI
