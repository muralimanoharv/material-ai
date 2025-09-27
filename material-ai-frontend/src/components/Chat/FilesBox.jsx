import { Box } from "@mui/material";
import FileBox from "./FileBox";





export default function FilesBox(props) {
    return <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap'
    }}>
        {
            props.fileNames.map(fileName => <FileBox key={fileName} file={{ name: fileName }} />)
        }
    </Box>
}