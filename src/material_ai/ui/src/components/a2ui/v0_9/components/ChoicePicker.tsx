/* eslint-disable */
import { useState } from 'react'
import { ChoicePickerApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import {
  Box,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  Chip,
} from '@mui/material'

type _Option = any

export const ChoicePicker = createComponentImplementation(
  ChoicePickerApi,
  ({ props, context }) => {
    const [filter, setFilter] = useState('')

    const values = Array.isArray(props.value) ? props.value : []
    const isMutuallyExclusive = props.variant === 'mutuallyExclusive'

    const onToggle = (val: string) => {
      if (isMutuallyExclusive) {
        props.setValue([val])
      } else {
        const newValues = values.includes(val)
          ? values.filter((v: string) => v !== val)
          : [...values, val]
        props.setValue(newValues)
      }
    }

    const options = (props.options || []).filter(
      (opt: _Option) =>
        !props.filterable ||
        filter === '' ||
        String(opt.label).toLowerCase().includes(filter.toLowerCase()),
    )

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
        {props.label && (
          <Typography variant="subtitle2" fontWeight="bold">
            {props.label}
          </Typography>
        )}

        {props.filterable && (
          <TextField
            size="small"
            placeholder="Filter options..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            variant="outlined"
            fullWidth
          />
        )}

        {props.displayStyle === 'chips' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {options.map((opt: _Option, i: number) => {
              const isSelected = values.includes(opt.value)
              return (
                <Chip
                  key={i}
                  label={opt.label}
                  onClick={() => onToggle(opt.value)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  clickable
                />
              )
            })}
          </Box>
        ) : (
          <FormGroup>
            {options.map((opt: _Option, i: number) => {
              const isSelected = values.includes(opt.value)
              return (
                <FormControlLabel
                  key={i}
                  control={
                    isMutuallyExclusive ? (
                      <Radio
                        checked={isSelected}
                        onChange={() => onToggle(opt.value)}
                        name={`choice-${context.componentModel.id}`}
                      />
                    ) : (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggle(opt.value)}
                      />
                    )
                  }
                  label={opt.label}
                />
              )
            })}
          </FormGroup>
        )}
      </Box>
    )
  },
)
