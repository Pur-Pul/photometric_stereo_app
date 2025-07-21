import Plot from 'react-plotly.js'
import { useEffect, useState } from 'react'
import React from 'react';

class PersistPlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: [], layout: props.layout, frames: props.frames, config: props.config};
  }
 
  render() {
    return (
      <Plot
        data={this.props.data}
        layout={this.state.layout}
        frames={this.state.frames}
        config={this.state.config}
        onInitialized={(figure) => {this.setState(figure)}}
        onUpdate={(figure) => {this.setState(figure)}}
        /*
        onClick={(e) => {
          if (this.props.setPoint) {
            this.props.setPoint(new Vector3(e.points[0].x, e.points[0].y, e.points[0].z))
            this.props.setSelection(-1)
          }
        }}
          */
      />
    );
  }
}

const generateLightLines = (lightDir, width, height) => {
    const roots = [
        [-width/3,  0,          0],
        [-width/3,  0,  -height/3],
        [0,         0,  -height/3],
        [width/3,   0,  -height/3],
        [width/3,   0,  0],
        [width/3,   0,  height/3],
        [0,         0,  height/3],
        [-width/3,  0,  height/3],
    ]
    return roots.map((root) => {
        const length = Math.max(width, height)
        return {
            type: 'scatter3d',
            mode: 'lines',
            x: [root[0]-length*lightDir[0], root[0]],
            y: [root[1]-length*lightDir[2], root[1]],
            z: [root[2]-length*lightDir[1], root[2]],
            line: {
                width: 6,
                color: 'rgba(255, 255, 0, 0.5)'
            }
        }
    })
    
}

const getPixels = (url, width, height, canvas, context) => {
    var img = new Image()
    img.src = url
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

const LightPlot = ({ file, lightX, lightY, lightZ }) => {
    const [lightPos, setLightPos] = useState([0,0,0])
    const [colors, setColors] = useState([])
    const [radius, setRadius] = useState(0)

    const size = 100

    const aspect_ratio = file.width/file.height
    const plane = new Array(size).fill(null).map(() => new Array(aspect_ratio * size).fill(0))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })

    useEffect(() => {
        setColors(getPixels(file.image, aspect_ratio * size, size, canvas, context))
    }, [file])

    useEffect(() => {
        const radius = Math.max(0.5 * size * aspect_ratio, 0.5 * size)
        setLightPos([-lightX*radius, -lightY*radius, -lightZ*radius])
        setRadius(radius)
    }, [lightX, lightY, lightZ])

    var data = [
        {
            type: 'surface',
            x: plane.map((row, y) => row.map((_, x) => x - row.length/2)),
            y: plane,
            z: plane.map((row, y) => row.map((_, x) => plane.length/2-y)),
            
            surfacecolor: colors,
            showscale: false,
            colorscale: 'Greys'
        },
        {
            type: 'scatter3d',
            mode: 'markers',
            x: [lightPos[0]],
            y: [lightPos[2]],
            z: [lightPos[1]],
            marker: {
                size: 12,
                color: 'rgba(255, 200, 0, 1)',
                opacity: 0.8
            },
            hovertemplate: `light direction<br>(${lightX}, ${lightY}, ${lightZ})<br>`
        },
        ...generateLightLines([lightX, lightY, lightZ], size * aspect_ratio, size)
    ]

    var layout = {
        title: { text: "Pick a light direction." },
        scene: {
            aspectmode:"manual",
            aspectratio: { x:1, y:1, z:1 },
            camera: { eye: { x: 0, y: -3, z: 0 } },
            yaxis: {
                title: { text: 'z' },
                showticklabels: false
            },
            zaxis: {
                title: { text: 'y' },
                showticklabels: false,
                autorange: false,
                range: [-radius, radius]
            },
            xaxis: { showticklabels: false, 
                autorange: false,
                range: [-radius, radius]
            },
            dragmode: "turntable"
        },
        autosize: false, 
        width: 500,
        height: 500,
        margin: { l: 65, r: 50, b: 65, t: 90 },
    }
    return (
        <PersistPlot 
            data={data}
            layout={layout}
        />
    )
}

export default LightPlot