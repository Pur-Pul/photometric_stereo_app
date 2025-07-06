const SourceImage = ({ files, setFiles, index }) => {
    return (
        <div>
            <img src={files[index].image} alt="Uploaded preview" />
            <p>Light direction: x={files[index].light[0]} y={files[index].light[1]} z={files[index].light[2]}</p>
        </div>
    )
}

export default SourceImage