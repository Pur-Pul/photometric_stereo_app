import { useRef, useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import MaskEditor from './MaskEditor'



const Mask = ({ maskOverlay, setMask }) => {
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
        if (maskOverlay) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            canvas.width = maskOverlay.width
            canvas.height = maskOverlay.height
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctxRef.current = ctx
            canvas.toBlob((blob) => { setMask(new File(
                [blob],
                `mask.${ maskOverlay.src.name.split('.').pop() }`,
                { type: maskOverlay.src.type },
                maskOverlay.src.type
            )) })
        } else {
            setMask(null)
        }
    }, [maskOverlay, setMask])

    const handleSave = (editorCanvas) => {
        ctxRef.current.drawImage(editorCanvas, 0, 0, canvasRef.current.width, canvasRef.current.height)
        canvasRef.current.toBlob((blob) => { setMask(new File(
            [blob],
            `mask.${ maskOverlay.src.name.split('.').pop() }`,
            { type: maskOverlay.src.type },
            maskOverlay.src.type
        )) })
        setOpen(false)
    }

    const handleDiscard = () => {
        setOpen(false)
    }

    return (
        maskOverlay
            ? <div style={{ width:'500px', height: '100%' }}>
                <h3>Mask</h3>
                <canvas style={img} ref={canvasRef} />
                {
                    canvasRef.current
                        ? <div>
                            <Button onClick={ () => { setOpen(true) } } variant="outlined">Edit mask</Button>
                            <Dialog
                                id='maskEditor'
                                open={ open }
                                closeAfterTransition={false}
                                fullWidth
                                maxWidth = 'lg'
                                slotProps={{ paper: { sx: { height: '80%' } } }}
                            >
                                <DialogTitle>Edit the mask</DialogTitle>
                                <MaskEditor
                                    size = { [canvasRef.current.width, canvasRef.current.height] }
                                    maskCanvas = { canvasRef.current }
                                    image= { maskOverlay.image }
                                    handleSave={ handleSave }
                                    handleDiscard={ handleDiscard }/>
                            </Dialog>
                        </div>
                        : 'loading'
                }
            </div>
            : null
    )
}

export default Mask