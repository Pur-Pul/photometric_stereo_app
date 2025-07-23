import { useRef, useEffect, useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import MaskEditor from "./MaskEditor"

const Mask = ({ images, setMask }) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }

    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)

    useEffect(() => {
        if (images.length > 0) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            canvas.width = images[0].width
            canvas.height = images[0].height
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 10
            ctxRef.current = ctx 
            canvas.toBlob((blob) => { setMask(new File([blob], `mask.${images[0].src.name.split('.').pop()}`, { type: images[0].src.type }, images[0].src.type)) })
        } else { 
            setMask(null)
        }
    }, [images])
    
    const handleSave = (event) => {
        event.preventDefault()
        setOpen(false)
    }

    return (
        images.length > 0 
            ? <div>
                <canvas style={img} ref={canvasRef} />
                <Button onClick={ () => { setOpen(true) } }>Edit mask</Button>
                <Dialog 
                    id='maskEditor'
                    open={ open }
                    onClose={ () => { setAlertOpen(true) } }
                    closeAfterTransition={false}
                    fullWidth
                    maxWidth = 'lg'
                    slotProps={{ paper: { sx: { height: '80%' }}}}
                    >
                    <DialogTitle>Edit the mask</DialogTitle>
                    <MaskEditor width={ images[0].width } height={ images[0].height } handleSave={ handleSave }/>
                    
                </Dialog>
                <Dialog open={ alertOpen } onClose={() => { setAlertOpen(false) }} closeAfterTransition={false}>
                    <DialogTitle>You are about to discard changes to the mask</DialogTitle>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        setAlertOpen(false)
                        setOpen(false)
                    }}> 
                        <DialogActions>
                            <Button onClick={ () => { setAlertOpen(false) } }>Cancel</Button>
                            <Button type="submit">Discard</Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div> 
            : null
    )
}

export default Mask