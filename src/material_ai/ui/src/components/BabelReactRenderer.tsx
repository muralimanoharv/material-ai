/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import * as Babel from '@babel/standalone'
import ShowReactCode from './ShowReactCode'
import { AppContext } from '../context'
import { useAgentId, useSessionId } from '../hooks'
import { ShowErrorMessage, PreviewErrorBoundary } from './ShowErrorMessage'

const loaders: Record<string, () => Promise<any>> = {
  react: () => import('react'),
  app: async () => {
    return {
      default: AppContext,
      AppContext,
      useAgentId,
      useSessionId,
    }
  },
  'chart.js': () => import('chart.js'),
  'chart.js/auto': () => import('chart.js/auto'),
  '@mui/material': () => import('@mui/material'),
  'react-chartjs-2': () => import('react-chartjs-2'),
  '@mui/icons-material': () => import('@mui/icons-material'),
  'react-hook-form': () => import('react-hook-form'),
  '@xyflow/react': () => import('@xyflow/react'),
  '@xyflow/react/dist/style.css': () => import('@xyflow/react/dist/style.css'),
}

export default function BabelReactRenderer({ code }: { code: string }) {
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [Component, setComponent] = useState<React.FC | null>(null)

  const load = async () => {
    try {
      setSyntaxError(null)

      const transformed = Babel.transform(code, {
        filename: 'preview.tsx',
        presets: ['react', 'typescript'],
        plugins: [
          ({ types: t }) => ({
            visitor: {
              CallExpression(path: any) {
                if (path.node.callee.name === 'require') {
                  path.replaceWith(t.awaitExpression(path.node))
                  path.skip()
                }
              },
            },
          }),
          ['transform-modules-commonjs', { noInterop: true }],
        ],
      }).code

      const executeCode = new Function(
        'React',
        'exports',
        'require',
        `
          return (async () => {
            ${transformed}
          })();
        `,
      )

      const exportsObject: Record<string, any> = {}
      const requireFn = async (module: string) => {
        // 1. Check for an exact match first (e.g., 'react' or 'chart.js')
        if (module in loaders) {
          return await loaders[module]()
        }

        // 2. Resolve subpaths dynamically (e.g., '@mui/icons-material/InfoOutlined')
        const matchedLoaderKey = Object.keys(loaders).find((key) => {
          // Ensure we match whole path segments (e.g., '@mui/material' shouldn't match '@mui/material-next')
          return module.startsWith(key + '/')
        })

        if (matchedLoaderKey) {
          // Load the base/root package (e.g., loads '@mui/icons-material')
          const baseModule = await loaders[matchedLoaderKey]()

          // Extract the subpath segment (e.g., "InfoOutlined")
          const subpath = module.slice(matchedLoaderKey.length + 1)

          // If there is no nested subpath (just a direct export name like InfoOutlined)
          if (!subpath.includes('/')) {
            if (baseModule && subpath in baseModule) {
              // Return it wrapped as a default export to satisfy: import InfoOutlinedIcon from '...'
              return {
                default: baseModule[subpath],
                ...baseModule[subpath], // Spread in case they destructure
              }
            }
          }
        }

        setSyntaxError(`Unknown module: ${module}`)
      }

      await executeCode(React, exportsObject, requireFn)

      if (exportsObject.default) {
        setComponent(() => exportsObject.default)
      } else {
        setSyntaxError('No default export found')
      }
    } catch (err: any) {
      setSyntaxError(err.message)
      return null
    }
  }

  useEffect(() => {
    load()
  }, [code])

  return (
    <Box
      sx={{
        position: 'relative',
        '&:hover .show-code-button': {
          opacity: '1',
        },
      }}
    >
      {syntaxError ? (
        <ShowErrorMessage error={new Error(syntaxError)} code={code} />
      ) : (
        <PreviewErrorBoundary code={code}>
          <ShowReactCode code={code} />
          {Component && <Component />}
        </PreviewErrorBoundary>
      )}
    </Box>
  )
}
