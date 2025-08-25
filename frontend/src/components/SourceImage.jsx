import LightDirSelector from "./LightDirSelector"

const SourceImage = ({ files, index, handleChange, style}) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }

    const handleLoad = (event) => {
        const { naturalHeight, naturalWidth } = event.target
        const new_files = [...files]
        new_files[index].width = naturalWidth
        new_files[index].height = naturalHeight
        handleChange(new_files)
    }

    return (
        <div style={{width:'500px', height: '100%'}}>
            <h3>{files[index].src.name}</h3>
            <img style={img} src={files[index].image} alt="Uploaded preview" onLoad={handleLoad}/>
            <LightDirSelector files={files} index={index} handleChange={handleChange}/>
            <p>Light direction: x={files[index].light[0]} y={files[index].light[1]} z={files[index].light[2]}</p>
            <p>Width: {files[index].width} Height: {files[index].height}</p>
        </div>
    )
}

export default SourceImage