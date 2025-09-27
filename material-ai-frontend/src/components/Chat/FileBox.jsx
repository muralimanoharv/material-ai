import { useTheme } from "@emotion/react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';

export default function FileBox(props) {
    const file = props.file;
    const theme = useTheme()
    const name = file.name.split('.')[0]
    const extension = file.name.split('.')[1]

    return <Tooltip title={file.name} key={file.name}>
        <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
                minWidth: '150px',
                width: '210px',
                display: 'flex',
                justifyContent: 'flex-start',
                borderRadius: '16px',
                padding: '16px 16px 16px 16px',
                '&:hover .file-clear-button': {
                    opacity: '1'
                },
                cursor: !props.showClear ? 'pointer' : undefined,
                backgroundColor: theme.palette.background?.card,
                '&:hover' : {
                    backgroundColor: !props.showClear ? theme.palette.background?.cardHover : undefined
                }
            }}
            key={file.name}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '5px',
                    position: 'relative'
                }}>
                    <Typography noWrap color={theme.palette.text.primary} variant='h5'>{name}</Typography>
                    {props.showClear && <IconButton
                        onClick={() => props.onClearFile(file.name)}
                        className='file-clear-button'
                        sx={{
                            backgroundColor: theme.palette.background.default,
                            opacity: '0',
                            position: 'absolute',
                            right: -10,
                            top: -10
                        }}>
                        <ClearIcon fontSize='small' />
                    </IconButton>}
                </Box>
                {
                    extension == 'pdf' && <Box sx={{ display: 'flex', gap: '10px' }}>
                        <img style={{ width: '16px', height: '16px' }} src='/pdf.png' alt='pdf' />
                        <Typography variant='h6' fontWeight={500}>PDF</Typography>
                    </Box>
                }
            </Box>
        </Box>

    </Tooltip>
}