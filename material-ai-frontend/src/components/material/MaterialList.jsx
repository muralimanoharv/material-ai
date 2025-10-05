import { List } from '@mui/material'

export default function MaterialList(props) {
  return (
    <List
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        '& .MuiListItem-root:first-of-type .MuiListItemButton-root': {
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        },
        '& .MuiListItem-root:last-of-type .MuiListItemButton-root': {
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
        },
      }}
    >
      {props.children}
    </List>
  )
}
