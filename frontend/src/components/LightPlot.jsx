import Plot from 'react-plotly.js'
import { useEffect } from 'react'

const getPixels = (url, width, height) => {
    var img = new Image()
    img.src = url
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    canvas.width=width
    canvas.height=height
    context.drawImage(img, 0, 0, width, height)
    const raw_data = context.getImageData(0, 0, width, height).data
    const pixels = (new Array(height).fill(null)).map(() => new Array(width))
    
    for (var i = 0; i < raw_data.length; i+=4) {
        const pixel_i = Math.floor(i/4)
        pixels[Math.floor(pixel_i/width)][pixel_i % width] = raw_data[i]
    }
    return pixels
}

const LightPlot = ({ file }) => {
    const aspect_ratio = file.width/file.height
    const plane = new Array(300).fill(null).map(() => new Array(aspect_ratio * 300).fill(0))

    const colors = getPixels(file.image, aspect_ratio * 300, 300)
    console.log(300*300*aspect_ratio*4)

    var data = [{
        type: 'surface',
        //x: plane,
        z: plane.map((row, y) => row.map((_, x) => plane.length-y)),
        y: plane,
        surfacecolor: colors,
        showscale: false,
        colorscale: 'Greys'
    }]
    var layout = {
        title: {
            text: "Pick a light direction."
        },
        scene: {
            aspectmode:"manual",
            aspectratio: {x:aspect_ratio, y:1, z:1},
            camera: {
              eye: {x: 0, y: -2.5, z: 0}
            }
        },
        autosize: false, 
        width: 500,
        height: 500,
        margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90,
        }
    }
    return (
        <Plot 
            data={data}
            layout={layout}
        />
    )
}

export default LightPlot