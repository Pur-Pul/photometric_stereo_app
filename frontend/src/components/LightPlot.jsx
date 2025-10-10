import Plot from 'react-plotly.js'
import { useEffect, useState } from 'react'
import React from 'react'
import Sphere from '../utils/Sphere'
import Vector3 from '../utils/Vector3'

class PersistPlot extends React.Component {
    constructor(props) {
        super(props)
        this.state = { data: [], layout: props.layout, frames: props.frames, config: props.config }
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
                style={{ cursor: 'cell' }}

                onClick={(e) => {
                    if (this.props.setLightDir) {
                        const dir = new Vector3(
                            e.points[0].x,
                            e.points[0].z,
                            e.points[0].y
                        ).normalize(-1)
                        if (dir.norm() !== 0) {
                            this.props.setLightDir(dir)
                        }
                    }
                }}

            />
        )
    }
}

const generateLightLines = (lightDir, width, height) => {
    const roots = [
        new Vector3(-width/3,  0,          0),
        new Vector3(-width/3,  0,  -height/3),
        new Vector3(0,         0,  -height/3),
        new Vector3(width/3,   0,  -height/3),
        new Vector3(width/3,   0,  0),
        new Vector3(width/3,   0,  height/3),
        new Vector3(0,         0,  height/3),
        new Vector3(-width/3,  0,  height/3),
    ]
    return roots.map((root) => {
        const length = Math.max(width, height)
        const lightDirFlipped = new Vector3(lightDir.x, lightDir.z, lightDir.y)
        const light_start = root.sub(lightDirFlipped.scalar(length))
        return {
            type: 'scatter3d',
            mode: 'lines',
            x: [light_start.x, root.x],
            y: [light_start.y, root.y],
            z: [light_start.z, root.z],
            line: {
                width: 6,
                color: 'rgba(255, 255, 0, 0.5)'
            },
            hoverinfo: 'none'
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

const LightPlot = ({ file, lightDir, setLightDir }) => {
    const [lightPos, setLightPos] = useState(new Vector3(0,0,0))
    const [colors, setColors] = useState([])

    const size = 100
    const aspect_ratio = file.width/file.height
    const width = Math.round(aspect_ratio*size)
    const height = size
    const radius = Math.max(0.5 * size * aspect_ratio, 0.5 * size)
    const plane = new Array(height).fill(null).map(() => new Array(width).fill(0))
    const sphere = new Sphere(3, radius)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })

    useEffect(() => {
        setColors(getPixels(file.image, width, height, canvas, context))
    }, [file])

    useEffect(() => {
        setLightPos(lightDir.scalar(-radius))
    }, [lightDir])

    var data = [
        {
            type: 'mesh3d',
            x: sphere.sphere_vertices.map((vertex) => vertex.x),
            y: sphere.sphere_vertices.map((vertex) => vertex.y),
            z: sphere.sphere_vertices.map((vertex) => vertex.z),
            i: sphere.sphere_i,
            j: sphere.sphere_j,
            k: sphere.sphere_k,
            color: 'rgb(0,0,255)',
            opacity: 0.2,
            flatshading: true,
            hoverinfo: 'none',
            hoverongaps: true
        },
        {
            type: 'surface',
            x: plane.map((row, y) => row.map((_, x) => row.length/2-x)),
            y: plane,
            z: plane.map((row, y) => row.map((_, x) => y - plane.length/2)),

            surfacecolor: colors,
            showscale: false,
            hoverinfo: 'none',
            colorscale: 'Greys'
        },
        {
            type: 'scatter3d',
            mode: 'markers',
            x: [lightPos.x],
            y: [lightPos.z],
            z: [lightPos.y],
            marker: {
                size: 12,
                color: 'rgba(255, 200, 0, 1)',
                opacity: 0.8
            },
            hovertemplate: `light direction<br>(${lightDir.x.toFixed(2)}, ${lightDir.y.toFixed(2)}, ${lightDir.z.toFixed(2)})<br>`
        },
        ...generateLightLines(lightDir, size * aspect_ratio, size)
    ]

    var layout = {
        title: { text: 'Pick a light direction.' },
        xaxis: { autorange: 'reversed' },
        zaxis: { autorange: 'reversed' },
        scene: {
            aspectmode:'manual',
            aspectratio: { x:1, y:1, z:1 },
            camera: { eye: { x: 0, y: -2, z: 0 } },
            yaxis: {
                title: { text: 'z' },
                showticklabels: false,
                range: [-radius, radius]
            },
            zaxis: {
                title: { text: 'y' },
                showticklabels: false,
                range: [radius, -radius]

            },
            xaxis: {
                showticklabels: false,
                range: [radius, -radius]
            },
        },
        showlegend: false,
        autosize: false,
        width: 500,
        height: 500,
        margin: { l: 35, r: 0, b: 25, t: 25 },
    }
    return (
        <PersistPlot
            data = { data }
            layout = { layout }
            setLightDir = { setLightDir }
        />
    )
}

export default LightPlot