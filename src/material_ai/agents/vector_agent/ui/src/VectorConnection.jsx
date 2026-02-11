import { useState } from 'react'
import MAI from '@mui/material'

const {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
} = MAI
import MaterialIcons from '@mui/icons-material'
const { DeviceHub: ConnectionIcon } = MaterialIcons

export const VectorConnection = ({ nodes, onDrawConnection }) => {
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')

  const sourceNodes = nodes
  const targetNodes = nodes

  const handleDrawConnection = () => {
    onDrawConnection(source, target)
  }

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  width: '100%',
                  overflowX: 'auto',
                  py: 2,
                }}
              >
                <Grid container spacing={3}>
                  {/* Source Selection */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id="source-select-label">
                        Source Node
                      </InputLabel>
                      <Select
                        labelId="source-select-label"
                        id="source-select"
                        value={source}
                        label="Source Node"
                        onChange={(e) => setSource(e.target.value)}
                      >
                        {sourceNodes.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Target Selection */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id="target-select-label">
                        Target Node
                      </InputLabel>
                      <Select
                        labelId="target-select-label"
                        id="target-select"
                        value={target}
                        label="Target Node"
                        onChange={(e) => setTarget(e.target.value)}
                      >
                        {targetNodes.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  {/* Action Button */}
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<ConnectionIcon />}
                      onClick={handleDrawConnection}
                      sx={{
                        py: 1.5,
                        fontWeight: 'bold',
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      Draw Connections
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
