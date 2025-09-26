import Box from '@mui/material/Box';
import { useContext, useState } from 'react';
import { AppContext } from '../../context';
import { InputBase, IconButton, Typography, useTheme, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined';
import { CHAT_SECTION_WIDTH } from '../../assets/themes';
import ModelSelectMenu from './ModelSelectMenu';
import FileSelectMenu from './FileSelectMenu';
import FileBox from '../FileBox';


export default function PromptInput() {

    const { prompt, setPrompt, send, loading, 
        files, setFiles, cancelApi } = useContext(AppContext)
    const theme = useTheme()
    const [fullScreen, setFullScreen] = useState(false)
    

    const handleSubmit = (event) => {
        event.preventDefault();
        send(prompt, { submittedFiles: [...files] })
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event?.preventDefault();
            handleSubmit(event);
        }
    };

    const onClearFile = (name) => {
        setFiles(prevFiles => {
            return [...prevFiles.filter(file => file.name !== name)]
        })
    }

    let boxShadow = '0 -25px 15px -5px rgba(255, 255, 255, 0.5)'
    if (theme.palette.mode == 'dark') {
        boxShadow = '0 -25px 15px -5px rgba(19, 19, 20, 0.5)'
    }

    let border = '1px solid #c4c7c5'
    if (theme.palette.mode == 'dark') {
        border = '1px solid #4a5050'
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const currentPrompt = prompt;
        const newPrompt = currentPrompt + text;
        setPrompt(newPrompt);
    };

    return (
        <Box sx={{
            width: '100%', maxWidth: CHAT_SECTION_WIDTH,
            margin: '0 16px',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            boxShadow,
        }}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    p: '8px', flexDirection: 'column', display: 'flex',
                    border,
                    borderRadius: '24px',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 0.3s ease, border-radius .1s cubic-bezier(.2,0,0,1), height .15s cubic-bezier(.2,0,0,1)'
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {files.map(file => <FileBox key={file.name} file={file} showClear onClearFile={onClearFile} />)}
                </Box>


                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InputBase
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        autoFocus
                        multiline
                        fullWidth
                        autoComplete='off'
                        sx={{
                            padding: '2px 12px', flex: 1,
                            '& .MuiInputBase-inputMultiline': {
                                transition: 'height 0.3s ease',
                                maxHeight: '500px',
                                minHeight: '25px',
                                height: '25px',
                                padding: '10px 0px',
                                overflowY: 'auto !important',
                                '&::placeholder': {
                                    opacity: 0.8,
                                },
                            }
                        }}
                        placeholder="Ask Gemini"

                        inputProps={{
                            'aria-label': 'Ask Gemini', style: {
                                height: fullScreen ? '500px' : undefined,
                            }
                        }}
                    />
                    {prompt?.length > 164 || fullScreen ? <Box sx={{ position: 'relative', width: '15px', height: '15px' }}>
                        <Tooltip title="Fullscreen">
                            <IconButton sx={{ position: 'absolute', left: '-20px', top: '-5px' }} onClick={() => setFullScreen(!fullScreen)}>
                                {fullScreen ? <FullscreenExitOutlinedIcon /> : <FullscreenOutlinedIcon />}
                            </IconButton>
                        </Tooltip>

                    </Box> : null}

                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        <FileSelectMenu setFiles={setFiles} files={files} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                        <ModelSelectMenu />
                        {
                            loading ? (
                                <Tooltip title="Stop response">
                                    <IconButton
                                        onClick={cancelApi}
                                        sx={{ backgroundColor: theme.palette.background.paper }}
                                        color="primary" aria-label="directions">
                                        <StopRoundedIcon fontSize='medium' />
                                    </IconButton>
                                </Tooltip>

                            ) : (
                                <Tooltip title="Submit">
                                    <IconButton
                                        onClick={handleSubmit}
                                        sx={{ backgroundColor: theme.palette.background.paper }}
                                        color="default" aria-label="directions">
                                        <SendIcon fontSize='medium' />
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    </Box>

                </Box>
            </Box>
            <Box sx={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
                <Typography variant='h6'>
                    Gemini can make mistakes, so double-check it
                </Typography>
            </Box>
        </Box>

    );
}

