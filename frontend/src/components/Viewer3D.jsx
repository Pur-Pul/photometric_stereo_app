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

const Viewer3D = ({ image, simple=false, size=500, texture=null, style={ aspectRatio: '1/1', maxWidth: 1080 } }) => {
    const FRAMETIME = 33.333333
    const sphere = new Sphere(3, 1)
    const cube = new Cube(1)

    const [visible, setVisible] = useState(false)
    const [shape, setShape] = useState(sphere)
    const [rotate, setRotate] = useState(null)

    const canvas3DRef = useRef(null)
    const canvasMapRef = useRef(null)
    const canvasTexRef = useRef(null)
    const texture1Ref = useRef(null)
    const texture2Ref = useRef(null)

    const programRef = useRef(null)
    const renderDataRef = useRef(null)
    const specularStrengthRef = useRef(50)
    const cameraRef = useRef({
        pos: new Vector3(0,3,0),
        right: new Vector3(-1,0,0),
        up: new Vector3(0,0,-1)
    })
    const lightPosRef = useRef(new Vector3(4,0,0))
    const colorRef = useRef('#ffffff')


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

        renderDataRef.current = { vertices, uvs, normals, tangents }
    }, [shape, visible])

    useEffect(() => {
        if (!visible) { return }
        let frame
        const canvas = canvas3DRef.current
        const ctx = canvas.getContext('webgl')
        const draw = () => {
            if (!ctx) {
                notificationSet('webgl is not avaliable.')
            } else if (!programRef.current) {
                ctx.enable(ctx.DEPTH_TEST)
                ctx.depthFunc(ctx.LEQUAL)
                ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true)
                programRef.current = initShaders(ctx)
            } else if (renderDataRef.current) {
                ctx.clearColor(0,0,0,1)
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT)
                const viewMat = createViewMat(cameraRef.current, new Vector3(0,0,0))
                const worldMat = new Mat4([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ])
                const projMat = createProjMat(45, 10, 0.1)

                const positionPointer = ctx.getAttribLocation(programRef.current, 'attPosition')
                const uvPointer = ctx.getAttribLocation(programRef.current, 'attUV')
                const normalPointer = ctx.getAttribLocation(programRef.current, 'attNormal')
                const tangentPointer = ctx.getAttribLocation(programRef.current, 'attTangent')

                const worldPointer = ctx.getUniformLocation(programRef.current, 'uWorldMatrix')
                const viewPointer = ctx.getUniformLocation(programRef.current, 'uViewMatrix')
                const projPointer = ctx.getUniformLocation(programRef.current, 'uProjectionMatrix')

                const nmPointer = ctx.getUniformLocation(programRef.current, 'uNormalMap')
                const texPointer = ctx.getUniformLocation(programRef.current, 'uTexture')
                const colorPointer = ctx.getUniformLocation(programRef.current, 'uColor')
                const lightPosPointer = ctx.getUniformLocation(programRef.current, 'uLightPos')
                const camPosPointer = ctx.getUniformLocation(programRef.current, 'uCamPos')
                const specularStrengthPointer = ctx.getUniformLocation(programRef.current, 'uSpecularStrength')

                initBuffer(ctx, renderDataRef.current.vertices, positionPointer, 3)
                initBuffer(ctx, renderDataRef.current.uvs, uvPointer, 2)
                initBuffer(ctx, renderDataRef.current.normals, normalPointer, 3)
                initBuffer(ctx, renderDataRef.current.tangents, tangentPointer, 3)

                ctx.useProgram(programRef.current)
                ctx.uniform1i(nmPointer, 0)
                ctx.uniform1i(texPointer, 1)

                texture1Ref.current = texture1Ref.current ?? initTexture(ctx, canvasMapRef.current)
                texture2Ref.current = texture2Ref.current ?? initTexture(ctx, canvasTexRef.current)

                ctx.activeTexture(ctx.TEXTURE0)
                ctx.bindTexture(ctx.TEXTURE_2D, texture1Ref.current)

                ctx.activeTexture(ctx.TEXTURE1)
                ctx.bindTexture(ctx.TEXTURE_2D, texture2Ref.current)

                ctx.uniformMatrix4fv(worldPointer, false, worldMat.mat)
                ctx.uniformMatrix4fv(viewPointer, false, viewMat.mat)
                ctx.uniformMatrix4fv(projPointer, false, projMat.mat)
                const [red, green, blue] = hexToRGB(colorRef.current)
                ctx.uniform4f(colorPointer, red/255, green/255, blue/255, 1)
                ctx.uniform3f(lightPosPointer, lightPosRef.current.x, lightPosRef.current.y, lightPosRef.current.z)
                ctx.uniform3f(camPosPointer, cameraRef.current.pos.x, cameraRef.current.pos.y, cameraRef.current.pos.z)
                ctx.uniform1f(specularStrengthPointer, specularStrengthRef.current/100)
                ctx.drawArrays(ctx.TRIANGLES, 0, renderDataRef.current.vertices.length/3)
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
    }, [visible])

    window.onmouseup = (event) => { if(event.button === 0) {setRotate(null)}}

    const handleTextureUpload = (event) => {
        const file = event.target.files[0]
        const image = new Image()
        image.onload = () => {
            const canvas = canvasTexRef.current
            const aspect = image.width / image.height
            const maxHeight = Math.max(image.width, image.height)

            canvas.width = Math.min(maxHeight, size) * aspect
            canvas.height = Math.min(maxHeight, size)

            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
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
                                setRotate({ lastRelX: relX, lastRelY: relY })
                            }
                        }}
                        onMouseUp={(e) => setRotate(null)}
                        onMouseMove={(e) => {
                            const { offsetX:x, offsetY:y } = e.nativeEvent
                            if (rotate) {
                                const relX = x/canvas3DRef.current.scrollWidth
                                const relY = y/canvas3DRef.current.scrollHeight
                                const quatX = Quaternion.axisAngle(cameraRef.current.up, (relX - rotate.lastRelX)*100)
                                const quatY = Quaternion.axisAngle(cameraRef.current.right, (relY - rotate.lastRelY)*100)
                                const quat = quatX.mult(quatY)
                                cameraRef.current = {
                                    pos: quat.rotate(cameraRef.current.pos),
                                    right: quat.rotate(cameraRef.current.right),
                                    up: quat.rotate(cameraRef.current.up)
                                }
                                setRotate({ lastRelX:relX, lastRelY:relY })
                            }
                        }}
                        style={{ border: '1px solid #2196f3', borderRadius: 5, cursor: rotate ? 'grabbing' : 'grab', width:'100%', height: '100%' }}
                    />
                    :   <Button variant='outlined' sx={{ width:'100%', height: '100%' }} onClick={() => setVisible(true) }>View 3D preview</Button>
            }
            {
                simple
                    ? null
                    : <Grid container>
                        <ColorSelector leftColor={colorRef.current} setLeftColor={(newColor) => colorRef.current = newColor} disabled={!visible} />
                        <FormControl>
                            <InputLabel htmlFor='strength' shrink>Specular strength (%)</InputLabel>
                            <TextField
                                id='strength'
                                type='number'
                                value={specularStrengthRef.current}
                                slotProps= {{ htmlInput: { min: 0, max: 100 } }}
                                onChange={(e) => specularStrengthRef.current = e.target.value}
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
                            <Button variant={shape.type === sphere.type ? 'contained' : 'outlined'} onClick={() => setShape(sphere)} disabled={!visible}>Sphere</Button>
                            <Button variant={shape.type === cube.type ? 'contained' : 'outlined'} onClick={() => setShape(cube)} disabled={!visible}>Cube</Button>
                        </ButtonGroup>
                    </Grid>
            }
        </div>
    )
}

export default Viewer3D