import { ComponentRegistry } from '@a2ui/react/v0_8'

import { Text } from '@a2ui/react/v0_8'
import { Image } from '@a2ui/react/v0_8'
import { Video } from '@a2ui/react/v0_8'
import { CheckBox } from '@a2ui/react/v0_8'

import Button from './components/Button'
import Card from './components/Card'
import { Column } from '@a2ui/react/v0_8'
import { Row } from '@a2ui/react/v0_8'
import MultipleChoice from './components/MultipleChoice'
import DateTimeInput from './components/DateTimeInput'
import Slider from './components/Slider'
import TextField from './components/TextField'
import Modal from './components/Modal'
import Tabs from './components/Tabs'
import List from './components/List'
import Divider from './components/Divider'
import AudioPlayer from './components/AudioPlayer'
import Icon from './components/Icon'

export function getMuiRegistry(): ComponentRegistry {
  const muiRegistry = ComponentRegistry.getInstance()
  muiRegistry.clear()
  muiRegistry.register('Text', { component: Text })
  muiRegistry.register('Image', { component: Image })
  muiRegistry.register('Video', { component: Video })

  muiRegistry.register('Icon', { component: Icon })
  muiRegistry.register('Divider', { component: Divider })
  muiRegistry.register('AudioPlayer', { component: AudioPlayer })

  // Layout components
  muiRegistry.register('Row', { component: Row })
  muiRegistry.register('Column', { component: Column })
  muiRegistry.register('List', { component: List })
  muiRegistry.register('Card', { component: Card })

  // Additional layout components
  muiRegistry.register('Tabs', { component: Tabs })
  muiRegistry.register('Modal', { component: Modal })

  // // Interactive components
  muiRegistry.register('Button', { component: Button })
  muiRegistry.register('TextField', { component: TextField })
  muiRegistry.register('CheckBox', { component: CheckBox })
  muiRegistry.register('Slider', { component: Slider })
  muiRegistry.register('DateTimeInput', { component: DateTimeInput })
  muiRegistry.register('MultipleChoice', { component: MultipleChoice })
  return muiRegistry
}
