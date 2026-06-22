import type { ReactComponentImplementation } from '@a2ui/react/v0_9'
import { Catalog } from '@a2ui/web_core/v0_9'
import { BASIC_FUNCTIONS } from '@a2ui/web_core/v0_9/basic_catalog'
import { Image, Text, Video } from '@a2ui/react/v0_9'
import { Card } from './components/Card'
import { Button } from './components/Button'
import { TextField } from './components/TextField'
import { DateTimeInput } from './components/DateTimeInput'
import { Slider } from './components/Slider'
import { CheckBox } from './components/CheckBox'
import { ChoicePicker } from './components/ChoicePicker'
import { Row } from './components/Row'
import { Tabs } from './components/Tabs'
import { Divider } from './components/Divider'
import { Modal } from './components/Modal'
import { List } from './components/List'
import { Column } from './components/Column'
import { Icon } from './components/Icon'
import { AudioPlayer } from './components/AudioPlayer'

const basicComponents: ReactComponentImplementation[] = [
  Text,
  Image,
  Icon,
  Video,
  AudioPlayer,
  Row,
  Column,
  List,
  Card,
  Tabs,
  Divider,
  Modal,
  Button,
  TextField,
  CheckBox,
  ChoicePicker,
  Slider,
  DateTimeInput,
]

export const muiCatalog = new Catalog<ReactComponentImplementation>(
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
  basicComponents,
  BASIC_FUNCTIONS,
)
