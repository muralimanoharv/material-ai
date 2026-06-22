/* eslint-disable */
import React, { lazy, useMemo, Suspense, useContext } from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactRouter from 'react-router'
import * as MaterialUI from '@mui/material'
import * as MaterialUIIcons from '@mui/icons-material'
import * as ReactHookForm from 'react-hook-form'
import { AppContext, type AppContextType } from '../../context'
import RemoteErrorBoundary from './RemoteErrorBoundary'

declare global {
  interface Window {
    React: typeof React
    ReactDOM: typeof ReactDOM
    ReactRouter: typeof ReactRouter
    MaterialUI: typeof MaterialUI
    MaterialUIIcons: typeof MaterialUIIcons
    ReactHookForm: typeof ReactHookForm
  }
}

window.React = React
window.ReactDOM = ReactDOM
window.ReactRouter = ReactRouter
window.MaterialUI = MaterialUI
window.MaterialUIIcons = MaterialUIIcons
window.ReactHookForm = ReactHookForm

export default function Microfrontend({
  url,
  children,
  props,
}: {
  url: string
  children: React.ReactNode
  props?: unknown
}) {
  const context = useContext(AppContext) as AppContextType
  const REMOTE_URL = url

  const MicroFrontendAgentComponent = useMemo(() => {
    return lazy(
      () => import(/* @vite-ignore */ REMOTE_URL),
    ) as React.ComponentType<any>
  }, [REMOTE_URL])

  let microfrontendProps = {}

  if (props) {
    microfrontendProps = props
  }

  return (
    <RemoteErrorBoundary key={REMOTE_URL} fallback={<>{children}</>}>
      <Suspense fallback={<div />}>
        <MicroFrontendAgentComponent {...context} {...microfrontendProps} />
      </Suspense>
    </RemoteErrorBoundary>
  )
}
