import { useEffect, useRef, useState } from 'react'
import fragCode from '../shaders/lightingShaderFragment'
import vertCode from '../shaders/lightingShaderVertex'
import { notificationSet } from '../reducers/notificationReducer'
import Sphere from '../utils/Sphere'
import Cube from '../utils/Cube'
import Mat4 from '../utils/Matrix'
import Vector3 from '../utils/Vector3'
import Quaternion from '../utils/Quaternion'
import ColorSelector from './ColorSelector'
import { hexToRGB } from '../utils/tools'
import { TextField, FormControl, InputLabel, Grid, Button, ButtonGroup } from '@mui/material'

const compileShader = (ctx, code, shaderType) => {
    const shader = ctx.createShader(shaderType)
    ctx.shaderSource(shader, code)
    ctx.compileShader(shader)

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        notificationSet({ text: 'Shader failed to compile', type: 'error' })
        console.log(ctx.getShaderInfoLog(shader)) //eslint-disable-line no-console
        ctx.deleteShader(shader)
        return null
    }

    return shader
}

const initShaders = (ctx) => {
    const vertShader = compileShader(ctx, vertCode[0], ctx.VERTEX_SHADER)
    const fragShader = compileShader(ctx, fragCode[0], ctx.FRAGMENT_SHADER)
    const program = ctx.createProgram()
    ctx.attachShader(program, vertShader)
    ctx.attachShader(program, fragShader)
    ctx.linkProgram(program)

    if(!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        notificationSet('Shader failed to initialize.')
        console.log(ctx.getProgramInfoLog(program)) //eslint-disable-line no-console
        return null
    }

    return program
}

const initBuffer = (ctx, data, pointer, length) => {
    const buffer = ctx.createBuffer()
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
    ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW)
    ctx.vertexAttribPointer(pointer, length, ctx.FLOAT, false, 0, 0)
    ctx.enableVertexAttribArray(pointer)
}

const initTexture = (ctx, canvas) => {
    const texture = ctx.createTexture()

    ctx.bindTexture(ctx.TEXTURE_2D, texture)
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, canvas)
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST)
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST)
    if ((canvas.width && (canvas.width - 1)) === 0 && (canvas.height && (canvas.height - 1)) === 0) {
        ctx.generateMipmap(ctx.TEXTURE_2D)
    } else {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE)
    }
    return texture
}

const createProjMat = (fov, zfar, znear) => {
    const focal = 1 / Math.tan((fov * Math.PI/180)/2)
    return new Mat4([
        focal, 0, 0, 0,
        0, focal, 0, 0,
        0, 0, (zfar + znear)/(znear - zfar), -1,
        0, 0, 2 * zfar * znear / (znear - zfar), 0
    ])
}

const createViewMat = (camera, target) => {
    const { pos,right,up } = camera
    const dir = target.sub(pos).normalize()

    return new Mat4([
        right.x, up.x, -dir.x, 0,
        right.y, up.y, -dir.y, 0,
        right.z, up.z, -dir.z, 0,
        -right.dot(pos), -up.dot(pos),    dir.dot(pos),   1
    ])
}

const SPHERE = new Sphere(3, 1)
const CUBE = new Cube(1)

const Viewer3D = ({ image, simple=false, size=500, defaultTexture=null, style={ aspectRatio: '1/1', maxWidth: 1080 } }) => {
    const [visible, setVisible] = useState(false)
    const [shape, setShape] = useState(SPHERE)
    const [texture, setTexture] = useState(defaultTexture)

    const canvas3DRef = useRef(null)
    const canvasMapRef = useRef(null)
    const canvasTexRef = useRef(null)
    const texture1Ref = useRef(null)
    const texture2Ref = useRef(null)
    const webglRef = useRef(null)

    const rotationRef = useRef(null)
    const programRef = useRef(null)
    const renderDataRef = useRef(null)

    const cameraRef = useRef({
        pos: new Vector3(0,3,0),
        right: new Vector3(-1,0,0),
        up: new Vector3(0,0,-1)
    })
    const lightPosRef = useRef(new Vector3(4,0,0))
    const [color, setColor] = useState('#ffffff')
    const [specularStrength, setSpecularStrength] = useState(50)


    useEffect(() => {
        if (!visible) { return }
        canvasMapRef.current = canvasMapRef.current ? canvasMapRef.current : document.createElement('canvas')
        canvasTexRef.current = canvasTexRef.current ? canvasTexRef.current : document.createElement('canvas')

        const aspect = image.width / image.height
        const maxHeight = Math.max(image.width, image.height)
        canvasMapRef.current.width = Math.min(maxHeight, size) * aspect
        canvasMapRef.current.height = Math.min(maxHeight, size)
        canvasTexRef.current.width = Math.min(maxHeight, size) * aspect
        canvasTexRef.current.height = Math.min(maxHeight, size)

        canvasMapRef.current.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0, canvasMapRef.current.width, canvasMapRef.current.height)
        canvasTexRef.current.getContext('2d', { willReadFrequently: true }).drawImage(texture ? texture : image, 0, 0, canvasTexRef.current.width, canvasTexRef.current.height)
    }, [visible, image, size, texture])

    useEffect(() => {
        if (!visible) { return }
        const vertices = shape.getVertexData()
        const [uvs, normals, tangents] = shape.getTextureData()

        renderDataRef.current = { vertices, uvs, normals, tangents, vertexNumber: vertices.length }
    }, [shape, visible])

    useEffect(() => {
        if (!visible) { return }
        let frame
        const canvas = canvas3DRef.current
        const ctx = canvas.getContext('webgl')
        const draw = () => {
            if (!ctx) {
                notificationSet('webgl is not available.')
            } else if (!programRef.current) {
                ctx.enable(ctx.DEPTH_TEST)
                ctx.depthFunc(ctx.LEQUAL)
                ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true)
                programRef.current = initShaders(ctx)
            } else if (!webglRef.current) {
                webglRef.current = {
                    worldMat: new Mat4([
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ]),
                    projMat: createProjMat(45, 10, 0.1),
                    positionPointer: ctx.getAttribLocation(programRef.current, 'attPosition'),
                    uvPointer: ctx.getAttribLocation(programRef.current, 'attUV'),
                    normalPointer: ctx.getAttribLocation(programRef.current, 'attNormal'),
                    tangentPointer: ctx.getAttribLocation(programRef.current, 'attTangent'),

                    worldPointer: ctx.getUniformLocation(programRef.current, 'uWorldMatrix'),
                    viewPointer: ctx.getUniformLocation(programRef.current, 'uViewMatrix'),
                    projPointer: ctx.getUniformLocation(programRef.current, 'uProjectionMatrix'),

                    nmPointer: ctx.getUniformLocation(programRef.current, 'uNormalMap'),
                    texPointer: ctx.getUniformLocation(programRef.current, 'uTexture'),
                    colorPointer: ctx.getUniformLocation(programRef.current, 'uColor'),
                    lightPosPointer: ctx.getUniformLocation(programRef.current, 'uLightPos'),
                    camPosPointer: ctx.getUniformLocation(programRef.current, 'uCamPos'),
                    specularStrengthPointer: ctx.getUniformLocation(programRef.current, 'uSpecularStrength')
                }
            } else {
                if (renderDataRef.current.vertices) {
                    initBuffer(ctx, renderDataRef.current.vertices, webglRef.current.positionPointer, 3)
                }
                if (renderDataRef.current.uvs) {
                    initBuffer(ctx, renderDataRef.current.uvs, webglRef.current.uvPointer, 2)
                }
                if (renderDataRef.current.normals) {
                    initBuffer(ctx, renderDataRef.current.normals, webglRef.current.normalPointer, 3)
                }
                if (renderDataRef.current.tangents) {
                    initBuffer(ctx, renderDataRef.current.tangents, webglRef.current.tangentPointer, 3)
                }
                renderDataRef.current = { vertexNumber: renderDataRef.current.vertexNumber }

                ctx.clearColor(0,0,0,1)
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT)

                const viewMat = createViewMat(cameraRef.current, new Vector3(0,0,0))

                if (canvasMapRef.current && canvasTexRef.current) {
                    texture1Ref.current = initTexture(ctx, canvasMapRef.current)
                    texture2Ref.current = initTexture(ctx, canvasTexRef.current)

                    ctx.activeTexture(ctx.TEXTURE0)
                    ctx.bindTexture(ctx.TEXTURE_2D, texture1Ref.current)

                    ctx.activeTexture(ctx.TEXTURE1)
                    ctx.bindTexture(ctx.TEXTURE_2D, texture2Ref.current)
                    canvasMapRef.current = null
                    canvasTexRef.current = null
                }

                ctx.useProgram(programRef.current)
                ctx.uniform1i(webglRef.current.nmPointer, 0)
                ctx.uniform1i(webglRef.current.texPointer, 1)

                ctx.uniformMatrix4fv(webglRef.current.worldPointer, false, webglRef.current.worldMat.mat)
                ctx.uniformMatrix4fv(webglRef.current.viewPointer, false, viewMat.mat)
                ctx.uniformMatrix4fv(webglRef.current.projPointer, false, webglRef.current.projMat.mat)
                const [red, green, blue] = hexToRGB(color)
                ctx.uniform4f(webglRef.current.colorPointer, red/255, green/255, blue/255, 1)
                ctx.uniform3f(webglRef.current.lightPosPointer, lightPosRef.current.x, lightPosRef.current.y, lightPosRef.current.z)
                ctx.uniform3f(webglRef.current.camPosPointer, cameraRef.current.pos.x, cameraRef.current.pos.y, cameraRef.current.pos.z)
                ctx.uniform1f(webglRef.current.specularStrengthPointer, specularStrength/100)
                ctx.drawArrays(ctx.TRIANGLES, 0, renderDataRef.current.vertexNumber/3)
            }
            const quat = Quaternion.axisAngle(new Vector3(0,1,0), 0.5)
            lightPosRef.current = quat.rotate(lightPosRef.current)
        }

        const animate = () => {
            draw()
            frame = requestAnimationFrame(animate)
        }

        frame = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(frame)
    }, [visible, color, specularStrength])

    window.onmouseup = (event) => { if(event.button === 0) { rotationRef.current = null}}

    const handleTextureUpload = (event) => {
        const file = event.target.files[0]
        const image = new Image()
        image.onload = () => {
            setTexture(image)
        }
        image.src = URL.createObjectURL(file)
    }
    return (
        <div style={style}>
            {
                visible
                    ?   <canvas
                        ref={canvas3DRef}
                        width={size}
                        height={size}
                        onMouseDown={(e) => {
                            const { offsetX:x, offsetY:y } = e.nativeEvent
                            const relX = x/canvas3DRef.current.scrollWidth
                            const relY = y/canvas3DRef.current.scrollHeight
                            if (e.nativeEvent.buttons === 1) {
                                rotationRef.current = { lastRelX: relX, lastRelY: relY }
                            }
                        }}
                        onMouseUp={(e) => rotationRef.current = null }
                        onMouseMove={(e) => {
                            const { offsetX:x, offsetY:y } = e.nativeEvent
                            if (rotationRef.current) {
                                const relX = x/canvas3DRef.current.scrollWidth
                                const relY = y/canvas3DRef.current.scrollHeight
                                const quatX = Quaternion.axisAngle(cameraRef.current.up, (relX - rotationRef.current.lastRelX)*100)
                                const quatY = Quaternion.axisAngle(cameraRef.current.right, (relY - rotationRef.current.lastRelY)*100)
                                const quat = quatX.mult(quatY)
                                cameraRef.current = {
                                    pos: quat.rotate(cameraRef.current.pos),
                                    right: quat.rotate(cameraRef.current.right),
                                    up: quat.rotate(cameraRef.current.up)
                                }
                                rotationRef.current = { lastRelX:relX, lastRelY:relY }
                            }
                        }}
                        style={{ border: '1px solid #2196f3', borderRadius: 5, cursor: rotationRef.current ? 'grabbing' : 'grab', width:'100%', height: '100%' }}
                    />
                    :   <Button variant='outlined' sx={{ width:'100%', height: '100%' }} onClick={() => setVisible(true) }>View 3D preview</Button>
            }
            {
                simple
                    ? null
                    : <Grid container>
                        <ColorSelector leftColor={color} setLeftColor={setColor} disabled={!visible} />
                        <FormControl>
                            <InputLabel htmlFor='strength' shrink>Specular strength (%)</InputLabel>
                            <TextField
                                id='strength'
                                type='number'
                                value={specularStrength}
                                slotProps= {{ htmlInput: { min: 0, max: 100 } }}
                                onChange={(e) => setSpecularStrength(e.target.value)}
                                disabled={!visible}
                            />
                        </FormControl>
                        <Button component='label' variant="outlined" disabled={!visible}>
                            Apply texture
                            <input
                                style={{ display: 'none' }}
                                type="file"
                                onChange={handleTextureUpload}
                                disabled={!visible}
                            />
                        </Button>
                        <ButtonGroup>
                            <Button variant={shape.type === SPHERE.type ? 'contained' : 'outlined'} onClick={() => setShape(SPHERE)} disabled={!visible}>Sphere</Button>
                            <Button variant={shape.type === CUBE.type ? 'contained' : 'outlined'} onClick={() => setShape(CUBE)} disabled={!visible}>Cube</Button>
                        </ButtonGroup>
                    </Grid>
            }
        </div>
    )
}

export default Viewer3D