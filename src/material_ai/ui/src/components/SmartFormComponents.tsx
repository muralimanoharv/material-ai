import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
} from '@mui/material'
import { SmartCheckbox } from './smart/SmartCheckbox'
import { SmartRadioGroup } from './smart/SmartRadioGroupProps'
import { SmartRating } from './smart/SmartRating'
import { SmartSelect } from './smart/SmartSelect'
import { SmartSlider } from './smart/SmartSlider'
import { SmartSwitch } from './smart/SmartSwitch'
import { SmartTextField } from './smart/SmartTextField'

export const FormComponents = {
  TextField: SmartTextField,
  RadioGroup: SmartRadioGroup,
  Select: SmartSelect,
  Checkbox: SmartCheckbox,
  Switch: SmartSwitch,
  Slider: SmartSlider,
  Rating: SmartRating,
  Radio: Radio,
  FormControlLabel: FormControlLabel,
  MenuItem: MenuItem,
  FormControl: FormControl,
  InputLabel: InputLabel,
}
