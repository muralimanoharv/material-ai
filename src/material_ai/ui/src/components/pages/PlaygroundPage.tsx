import { useState } from 'react'
import BabelReactRenderer from '../BabelReactRenderer'

export default function PlaygroundPage() {
  const [code, setCode] = useState('')

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Editor Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <label
          htmlFor="code-editor"
          style={{
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#64748b',
            textTransform: 'uppercase',
          }}
        >
          Editor
        </label>
        <textarea
          id="code-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Type your React code here..."
          style={{
            flex: 1,
            width: '100%',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        />
      </div>

      {/* Vertical Divider */}
      <div
        style={{
          width: '1px',
          backgroundColor: '#e2e8f0',
          marginTop: '24px',
          marginBottom: '24px',
        }}
      />

      {/* Right Column: Preview Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxSizing: 'border-box',
          overflow: 'auto',
        }}
      >
        <span
          style={{
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#64748b',
            textTransform: 'uppercase',
          }}
        >
          Preview
        </span>
        <div
          style={{
            flex: 1,
            padding: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'auto',
          }}
        >
          <BabelReactRenderer code={code} />
        </div>
      </div>
    </div>
  )
}
