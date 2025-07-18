import { useState } from "react"
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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

    return (
        <div>
            <Button variant="outlined" onClick={() => { setOpen(true) }}>Edit light direction</Button>
            <Dialog open={ open } onClose={() => { setOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>Select light direction</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <input type="number" step={0.05} max={1} min={-1} onChange={(event) => {setLightX(event.target.value)}} value={lightX}/>
                    <input type="number" step={0.05} max={1} min={-1} onChange={(event) => {setLightY(event.target.value)}} value={lightY}/>
                    <input type="number" step={0.05} max={1} min={-1} onChange={(event) => {setLightZ(event.target.value)}} value={lightZ}/>
                    
                    <DialogActions>
                        <Button onClick={ () => { setOpen(false) } }>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
    /*
    
    */
}

export default LightDirSelector