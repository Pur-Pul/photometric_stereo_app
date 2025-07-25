import { useState, useEffect } from "react"
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import LightPlot from './LightPlot'
import Vector3 from "../utils/Vector3"

const LightDirSelector = ({ index, files, handleChange }) => {
    const [open, setOpen] = useState(false)
    const [lightDir, setLightDir] = useState(new Vector3(0,0,0))

    const handleSubmit = (event) => {
        event.preventDefault()
        setOpen(false)
        
        const new_files = [...files]
        new_files[index].light = [lightDir.x, lightDir.y, lightDir.z]
        handleChange(new_files)
    }

    useEffect(() => {
        setLightDir(new Vector3(
            files[index].light[0],
            files[index].light[1],
            files[index].light[2]
        ))
    }, [files, index])

    const handleLightChange = (event) => {
        let tempLight = lightDir.clone()
        switch(event.target.id) {
            case "lightX":
                tempLight.x = Number(event.target.value)
                break;
            case "lightY":
                tempLight.y = Number(event.target.value)
                break;
            case "lightZ":
                tempLight.z = Number(event.target.value)
                break;
            default:
                console.log(`invalid input component ${event.target.id}`)
        }
        tempLight = tempLight.normalize()
        setLightDir(tempLight)
        
    }

    useEffect(()=> {
        if (document.getElementById("lightX")) { document.getElementById("lightX").value = lightDir.x }
        if (document.getElementById("lightY")) { document.getElementById("lightY").value = lightDir.y }
        if (document.getElementById("lightZ")) { document.getElementById("lightZ").value = lightDir.z }
        
    }, [lightDir])

    return (
        <div>
            <Button variant="outlined" onClick={() => { setOpen(true) }}>Edit light direction</Button>
            <Dialog open={ open } onClose={() => { setOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>Select light direction</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <input id="lightX" type="number" max={1} min={-1} step={'any'}
                        onBlur={handleLightChange}
                        defaultValue={lightDir.x}
                    />
                    <input id="lightY" type="number" max={1} min={-1} step={'any'}
                        onBlur={handleLightChange}
                        defaultValue={lightDir.y}
                    />
                    <input id="lightZ" type="number" max={1} min={-1} step={'any'}
                        onBlur={handleLightChange}
                        defaultValue={lightDir.z}
                    />
                    
                    <DialogActions>
                        <Button onClick={ () => { setOpen(false) } }>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogActions>
                </form>
                <LightPlot 
                    file = { files[index] }
                    lightDir = { lightDir }
                    setLightDir = { setLightDir }
                />
            </Dialog>
        </div>
    )
    /*
    
    */
}

export default LightDirSelector