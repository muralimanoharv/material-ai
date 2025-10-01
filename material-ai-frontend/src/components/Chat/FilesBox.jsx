import { Box } from "@mui/material";
import FileBox from "./FileBox";





export default function FilesBox(props) {
    return <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignSelf: props.alignSelf,
        justifyContent: props.justifyContent,
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginLeft: '60px'
    }}>
        {
            props.files.map(
                (file) =>
                    <FileBox
                        key={file.name}
                        file={file}
                    />
            )
        }
    </Box>
}