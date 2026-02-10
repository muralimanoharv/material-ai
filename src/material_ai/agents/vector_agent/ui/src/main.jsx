const VectorAgentUI = (props) => {
  const { ChatSection, Greeting } = props
  return (
    <>
      <Greeting greeting="Ready to understand vectors" />
      <ChatSection />
    </>
  )
}

export default VectorAgentUI
