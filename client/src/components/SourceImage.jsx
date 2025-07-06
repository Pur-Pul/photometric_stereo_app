const SourceImage = ({ files, setFiles, index }) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover'
    }
    return (
        <div>
            <img style={img} src={files[index].image} alt="Uploaded preview" />
            <p>Light direction: x={files[index].light[0]} y={files[index].light[1]} z={files[index].light[2]}</p>
        </div>
    )
}

export default SourceImage