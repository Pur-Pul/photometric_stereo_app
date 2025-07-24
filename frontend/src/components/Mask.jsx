import { useRef, useEffect, useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import MaskEditor from "./MaskEditor"

const SIZE_LIMIT = 300

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

    useEffect(() => {
        if (images.length > 0) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            const canvasAspect = images[0].width/images[0].height
            if (Math.max(images[0].width, images[0].height) > SIZE_LIMIT) {
                canvas.width = canvasAspect >= 1 ? SIZE_LIMIT : canvasAspect * SIZE_LIMIT
                canvas.height = canvasAspect >= 1 ? SIZE_LIMIT / canvasAspect : SIZE_LIMIT
            } else {
                canvas.width = images[0].width
                canvas.height = images[0].height
            }
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
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

    const handleDiscard = () => {
        setOpen(false)
    }

    return (
        images.length > 0 
            ? <div>
                <canvas style={img} ref={canvasRef} />
                {   
                    canvasRef.current 
                        ? <div>
                            <Button onClick={ () => { setOpen(true) } }>Edit mask</Button>
                            <Dialog 
                                id='maskEditor'
                                open={ open }
                                closeAfterTransition={false}
                                fullWidth
                                maxWidth = 'lg'
                                slotProps={{ paper: { sx: { height: '80%' }}}}
                                >
                                <DialogTitle>Edit the mask</DialogTitle>
                                <MaskEditor 
                                    size = { [canvasRef.current.width, canvasRef.current.height] }
                                    image= { images[0].image }
                                    handleSave={ handleSave }
                                    handleDiscard={handleDiscard}/>
                            </Dialog>
                        </div>
                        : "loading"
                }
            </div> 
            : null
    )
}

export default Mask