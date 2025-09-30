
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';



export const MODELS = [
    {
        model: '2.5 Flash',
        tagline: 'Fast all-round help'
    },
    {
        model: '2.5 Pro',
        tagline: 'Reasoning, math & code'
    }
]

export const FILE_OPTIONS = [
    {
        title: 'Upload files',
        icon: AttachFileOutlinedIcon
    },
]

export const ERROR_MESSAGE = 'Some error has occured, Please try again later'

export const FEEDBACK = {
    positive: {
        value: 'GOOD',
    },
    negative: {
        value: 'BAD',
        categories: [
            "Not / poorly personalized",
            "Problem with saving information",
            "Not factually correct",
            "Didn't follow instructions",
            "Offensive / Unsafe",
            "Wrong language"
        ]
    }
}