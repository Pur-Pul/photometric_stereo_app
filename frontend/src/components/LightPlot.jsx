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

const LightPlot = ({ file, lightX, lightY, lightZ }) => {
    const [lightPos, setLightPos] = useState([0,0,0])
    const [colors, setColors] = useState([])
    const aspect_ratio = file.width/file.height
    const plane = new Array(300).fill(null).map(() => new Array(aspect_ratio * 300).fill(0))

    useEffect(() => {
        setColors(getPixels(file.image, aspect_ratio * 300, 300))
    }, [file])

    useEffect(() => {
        const middle = [
            0.5 * 300 * aspect_ratio,
            0.5 * 300,
            0
        ]
        const radius = Math.max(...middle)
        setLightPos([middle[0] - lightX*radius, middle[1] - lightY*radius, middle[2] - lightZ*radius])
    }, [lightX, lightY, lightZ])

    var data = [
        {
            type: 'surface',
            z: plane.map((row, y) => row.map((_, x) => plane.length-y)),
            y: plane,
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
                line: {
                    color: 'rgba(217, 217, 217, 0.14)',
                    width: 0.5
                },
                opacity: 0.8
            },
            hovertemplate: `light direction<br>(${lightX}, ${lightY}, ${lightZ})<br>`
        }
    ]

    var layout = {
        title: { text: "Pick a light direction." },
        scene: {
            aspectmode:"manual",
            aspectratio: { x:aspect_ratio, y:1, z:1 },
            camera: { eye: { x: 0, y: 3, z: 0 } },
            yaxis: {
                title: { text: 'z' },
                showticklabels: false
            },
            zaxis: {
                title: { text: 'y' },
                showticklabels: false
            },
            xaxis: { showticklabels: false },
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