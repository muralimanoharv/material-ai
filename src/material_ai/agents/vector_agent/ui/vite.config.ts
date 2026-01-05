import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'VectorAgentUI',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // These will NOT be bundled into your file
      external: [
        'react', 
        'react-dom', 
        '@mui/material', 
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled'
      ],
      output: {
        // This ensures that when your code says 'import React from "react"',
        // it maps to the version already loaded by the main app.
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled'
        }
      }
    },
  }
});