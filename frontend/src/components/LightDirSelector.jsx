import { useState, useEffect } from "react"
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import LightPlot from './LightPlot'

const LightDirSelector = ({ index, files, handleChange}) => {
    const [open, setOpen] = useState(false)
    const [lightX, setLightX] = useState(0)
    const [lightY, setLightY] = useState(0)
    const [lightZ, setLightZ] = useState(0)

    const handleSubmit = (event) => {
        event.preventDefault()
        setOpen(false)
        
        const new_files = [...files]
        new_files[index].light = [lightX, lightY, lightZ]
        handleChange(new_files)
    }

    useEffect(() => {
        setLightX(files[index].light[0])
        setLightY(files[index].light[1])
        setLightZ(files[index].light[2])
    }, [files, index])

    const handleLightChange = (event) => {
        let tempLight = [lightX, lightY, lightZ]
        switch(event.target.id) {
            case "lightX":
                tempLight[0] = Number(event.target.value)
                setLightX(tempLight[0])
                break;
            case "lightY":
                tempLight[1] = Number(event.target.value)
                setLightY(tempLight[1])
                break;
            case "lightZ":
                tempLight[2] = Number(event.target.value)
                setLightZ(tempLight[2])
                break;
            default:
                console.log(`invalid input component ${event.target.id}`)
        }
    }

    useEffect(()=> {
        let tempLight = [lightX, lightY, lightZ]
        const magnitude = Math.sqrt(tempLight.reduce((sum, component) => sum + Math.pow(component, 2), 0))
        if (magnitude != 1) {
            tempLight = tempLight.map(component => component/magnitude)
            setLightX(tempLight[0])
            setLightY(tempLight[1])
            setLightZ(tempLight[2])
        }
        console.log(magnitude)
        if (document.getElementById("lightX")) { document.getElementById("lightX").value = tempLight[0] }
        if (document.getElementById("lightY")) { document.getElementById("lightY").value = tempLight[1] }
        if (document.getElementById("lightZ")) { document.getElementById("lightZ").value = tempLight[2] }
    }, [lightX, lightY, lightZ])

    return (
        <div>
            <Button variant="outlined" onClick={() => { setOpen(true) }}>Edit light direction</Button>
            <Dialog open={ open } onClose={() => { setOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>Select light direction</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <input id="lightX" type="number" step={0.05} max={1} min={-1} 
                        onBlur={handleLightChange}
                        defaultValue={lightX}
                    />
                    <input id="lightY" type="number" step={0.05} max={1} min={-1}
                        onBlur={handleLightChange}
                        defaultValue={lightY}
                    />
                    <input id="lightZ" type="number" step={0.05} max={1} min={-1}
                        onBlur={handleLightChange}
                        defaultValue={lightZ}
                    />
                    
                    <DialogActions>
                        <Button onClick={ () => { setOpen(false) } }>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogActions>
                </form>
                <LightPlot 
                    file = { files[index] }
                    lightX = { lightX }
                    lightY = { lightY }
                    lightZ = { lightZ }
                    setLightX = { setLightX }
                    setLightY = { setLightY }
                    setLightZ = { setLightZ }
                />
            </Dialog>
        </div>
    )
    /*
    
    */
}

export default LightDirSelector