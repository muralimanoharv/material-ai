import { useContext } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { AppContext } from '../context'
import { useAgentId, useSessionId } from '../hooks'

export const DynamicForm = ({
  defaultValues,
  children,
  submissionContext,
}: any) => {
  const context = useContext(AppContext)
  const methods = useForm({ defaultValues })

  const agentId = useAgentId()
  const sessionId = useSessionId()

  const onSubmit = (formData: any) => {
    context?.chatService.send_message(
      `
        ${submissionContext}
        ${JSON.stringify(formData)}
        Please evaluate and provide results
    `,
      { agent: agentId, session_id: sessionId },
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  )
}
