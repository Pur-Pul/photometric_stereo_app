import { useState } from "react";
import SourceImage from "./SourceImage";

const ImageUploadForm = () => {
    const [files, setFiles] = useState([])
    function handleChange(e) {
        console.log(e.target.files)
        setFiles(Array.from(e.target.files).map((file) => {
            return { 
                image : URL.createObjectURL(file),
                light : [0,0,1]
            }
        }))
    }
    return (
        <div>
            <h2>Select images:</h2>
            <input type="file" onChange={handleChange} multiple/>
            <ul>
                { files.map((file, index) => <li key={index}><SourceImage files={files} setFiles={setFiles} index={index}/></li>) }
            </ul>
    
        </div>
    )
}

export default ImageUploadForm