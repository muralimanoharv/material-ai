import { SliderApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Slider as MuiSlider, Box, Stack, Typography } from '@mui/material'

export const Slider = createComponentImplementation(SliderApi, ({ props }) => {
  // MUI's Slider onChange passes the new value directly as the second argument
  const onChange = (_: Event, newValue: number | number[]) => {
    props.setValue(newValue as number)
  }

  return (
    <Box sx={{ m: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        {props.label && (
          <Typography variant="body2" fontWeight="bold">
            {props.label}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {props.value}
        </Typography>
      </Stack>
      <MuiSlider
        min={props.min ?? 0}
        max={props.max}
        value={props.value ?? 0}
        onChange={onChange}
        aria-label={props.label}
      />
    </Box>
  )
})
