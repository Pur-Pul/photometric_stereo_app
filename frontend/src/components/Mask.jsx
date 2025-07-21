import { useRef, useEffect } from "react"

const Mask = ({ images, setMask }) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }

    const canvasRef = useRef(null)

    useEffect(() => {
        if (images.length > 0) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            ctx.canvas.width = images[0].width
            ctx.canvas.height = images[0].height

            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            canvas.toBlob((blob) => { setMask(new File([blob], `mask.${images[0].src.name.split('.').pop()}`, { type: images[0].src.type }, images[0].src.type)) })
        } else {
            setMask(null)
        }
    }, [images])
    

    return images.length > 0 ? <canvas style={img} ref={canvasRef} /> : null
}

export default Mask