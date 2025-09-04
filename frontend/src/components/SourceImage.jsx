import LightDirSelector from "./LightDirSelector"

const SourceImage = ({ files, index, setFiles}) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }

    return (
        <div style={{width:'500px', height: '100%'}}>
            <h3>{files[index].src.name}</h3>
            <img style={img} src={files[index].image} alt="Uploaded preview" />
            <LightDirSelector files={files} index={index} setFiles={setFiles}/>
            <p>Light direction: x={files[index].light[0]} y={files[index].light[1]} z={files[index].light[2]}</p>
            <p>Width: {files[index].width} Height: {files[index].height}</p>
        </div>
    )
}

export default SourceImage