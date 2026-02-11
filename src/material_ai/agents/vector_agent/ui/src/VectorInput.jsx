import MUI from '@mui/material'
import RHF from 'react-hook-form'

const { useForm, Controller } = RHF

const { Box, Grid, Card, CardContent, TextField, Button, Typography } = MUI

export const VectorInput = ({ onClick }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      userInput: '',
    },
  })

  const onSubmit = async (data) => {
    if (data.userInput.trim()) {
      await onClick(data.userInput)
      reset()
    } else {
      alert('Please enter some text before submitting.')
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3} justifyContent="center">
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
              <Typography
                variant="h5"
                component="div"
                gutterBottom
                color="text.primary"
              >
                Add Embedding
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter a word and submit to generate an embedding.
              </Typography>

              {/* Safety container for form elements */}
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  width: '100%',
                  gap: 2,
                }}
              >
                <Controller
                  name="userInput"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Word"
                      variant="outlined"
                      fullWidth
                      placeholder="Type something here..."
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Submit
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
