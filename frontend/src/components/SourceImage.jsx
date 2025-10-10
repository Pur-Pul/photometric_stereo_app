import LightDirSelector from './LightDirSelector'

const SourceImage = ({ files, file, setFiles }) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }

    return (
        <div style={{ width:'500px', height: '100%' }}>
            <h3>{file.src.name}</h3>
            <img style={img} src={file.image} alt="Uploaded preview" />
            <LightDirSelector
                files={files}
                file={file}
                id={file.id}
                setFiles={setFiles}
            />
            <p>Light direction: x={file.light[0]} y={file.light[1]} z={file.light[2]}</p>
            <p>Width: {file.width} Height: {file.height}</p>
        </div>
    )
}

export default SourceImage