import { EmbeddingChart } from './Embeddings'

const VectorAgentUI = (props) => {
  const { ChatSection, Greeting } = props
  return (
    <>
      <Greeting greeting="Ready to understand vectors" />
        
        
        <ChatSection
        mfeMarkdownJsonRenderer={(data) => {
          return <EmbeddingChart coords={data} />
        }}
      />
    </>
  )
}

export default VectorAgentUI
