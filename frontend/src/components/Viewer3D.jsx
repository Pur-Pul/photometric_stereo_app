import { useEffect, useRef, useState } from 'react'
import fragCode from '../shaders/lightingShaderFragment'
import vertCode from '../shaders/lightingShaderVertex'
import { notificationSet } from '../reducers/notificationReducer'
import Sphere from '../utils/Sphere'
import Mat4 from '../utils/Matrix'
import Vector3 from '../utils/Vector3'
import Quaternion from '../utils/Quaternion'
import ColorSelector from './ColorSelector'
import { hexToRGB } from '../utils/tools'
import { TextField, FormControl, InputLabel, Grid } from '@mui/material'

const compileShader = (ctx, code, shaderType) => {
    const shader = ctx.createShader(shaderType)
    ctx.shaderSource(shader, code)
    ctx.compileShader(shader)

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        notificationSet({text: 'Shader failed to compile', type: 'error'})
        console.log(ctx.getShaderInfoLog(shader))
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
        console.log(ctx.getProgramInfoLog(program))
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

const initTexture = (ctx, canvas, pointer) => {
    const texture = ctx.createTexture()

    ctx.bindTexture(ctx.TEXTURE_2D, texture)
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, canvas)
    if ((canvas.width && (canvas.width - 1)) == 0 && (canvas.height && (canvas.height - 1)) == 0) {
        ctx.generateMipmap(ctx.TEXTURE_2D)
    } else {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR)
    }

    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
    ctx.activeTexture(ctx.TEXTURE0)
    ctx.bindTexture(ctx.TEXTURE_2D, texture)
    ctx.uniform1i(pointer, 0)
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
    const {pos,right,up} = camera
    const dir = target.sub(pos).normalize()

    return new Mat4([
        right.x, up.x, -dir.x, 0,
        right.y, up.y, -dir.y, 0,
        right.z, up.z, -dir.z, 0,
        -right.dot(pos), -up.dot(pos),    dir.dot(pos),   1
    ])
}

const Viewer3D = ({image}) => {
    const canvas3DRef = useRef(null)
    const canvasMapRef = useRef(null)
    const FRAMETIME = 33.333333

    const tiltQuat = Quaternion.axisAngle(new Vector3(0,0,1), 45)
    const [camera, setCamera] = useState({
        pos: new Vector3(0,3,0),
        right: new Vector3(1,0,0),
        up: new Vector3(0,0,1)
    })

    const [lightPos, setLightPos] = useState(new Vector3(4,0,0))
    const [color, setColor] = useState('#ffffff')

    const [sphere, setSphere] = useState(new Sphere(3, 1))
    const [program, setProgram] = useState(null)
    const [vertexData, setVertexData] = useState(null)
    const [uvData, setUVData] = useState(null)
    const [normalData, setNormalData] = useState(null)
    const [tangentData, setTangentData] = useState(null)
    const [rotate, setRotate] = useState(null)
    const [specularStrength, setSpecularStrength] = useState(50)
    const [animateStep, setAnimateStep] = useState(Date.now())

    useEffect(() => {
        if (!canvasMapRef.current) {
            canvasMapRef.current = document.createElement('canvas')
        }
        const canvas = canvasMapRef.current
        const aspect = image.width / image.height
        canvas.width = 500 * aspect
        canvas.height = 500

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    }, [])

    useEffect(() => {
        setVertexData(sphere.getVertexData())
        const [uvData, normalData, tangentData] = sphere.getTextureData()
        setUVData(uvData)
        setNormalData(normalData)
        setTangentData(tangentData)
    }, [sphere])

    useEffect(() => {
        const canvas = canvas3DRef.current
        const ctx = canvas.getContext('webgl')
        if (!ctx) { 
            notificationSet('webgl is not avaliable.')
        } else if (!program) {
            ctx.enable(ctx.DEPTH_TEST)
            ctx.depthFunc(ctx.LEQUAL)
            setProgram(initShaders(ctx))
        } else if (vertexData && uvData && normalData && tangentData) {
            ctx.clearColor(0,0,0,1)
            ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT)
            const viewMat = createViewMat(camera, new Vector3(0,0,0))
            const worldMat = new Mat4([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ])
            const projMat = createProjMat(45, 10, 0.1)

            const positionPointer = ctx.getAttribLocation(program, 'attPosition')
            const uvPointer = ctx.getAttribLocation(program, 'attUV')
            const normalPointer = ctx.getAttribLocation(program, 'attNormal')
            const tangentPointer = ctx.getAttribLocation(program, 'attTangent')

            const worldPointer = ctx.getUniformLocation(program, 'uWorldMatrix')
            const viewPointer = ctx.getUniformLocation(program, 'uViewMatrix')
            const projPointer = ctx.getUniformLocation(program, 'uProjectionMatrix')

            const nmPointer = ctx.getUniformLocation(program, 'uNormalMap')
            const colorPointer = ctx.getUniformLocation(program, 'uColor')
            const lightPosPointer = ctx.getUniformLocation(program, 'uLightPos')
            const camPosPointer = ctx.getUniformLocation(program, 'uCamPos')
            const specularStrengthPointer = ctx.getUniformLocation(program, 'uSpecularStrength')
    
            initBuffer(ctx, vertexData, positionPointer, 3)
            initBuffer(ctx, uvData, uvPointer, 2)
            initBuffer(ctx, normalData, normalPointer, 3)
            initBuffer(ctx, tangentData, tangentPointer, 3)

            ctx.useProgram(program)
            initTexture(ctx, canvasMapRef.current, nmPointer)
            ctx.uniformMatrix4fv(worldPointer, false, worldMat.mat)
            ctx.uniformMatrix4fv(viewPointer, false, viewMat.mat)
            ctx.uniformMatrix4fv(projPointer, false, projMat.mat)
            const [red, green, blue] = hexToRGB(color)
            ctx.uniform4f(colorPointer, red/255, green/255, blue/255, 1)
            ctx.uniform3f(lightPosPointer, lightPos.x, lightPos.y, lightPos.z)
            ctx.uniform3f(camPosPointer, camera.pos.x, camera.pos.y, camera.pos.z)
            ctx.uniform1f(specularStrengthPointer, specularStrength/100)
            ctx.drawArrays(ctx.TRIANGLES, 0, vertexData.length/3)
        }
        const deltaTime = Date.now() - animateStep
        const quat = Quaternion.axisAngle(new Vector3(0,1,0), 2)
        setLightPos(quat.rotate(lightPos))
        setTimeout(() => {
            setAnimateStep(Date.now())
        }, FRAMETIME)
    }, [animateStep])
    
    window.onmouseup = (event) => { if(event.button === 0) {setRotate(null)}}

    return <div>
            <canvas 
                ref={canvas3DRef}
                width={500}
                height={500}
                onMouseDown={(e) => setRotate({ lastX: e.nativeEvent.offsetX, lastY: e.nativeEvent.offsetY })}
                onMouseUp={(e) => setRotate(null)}
                onMouseMove={(e) => {
                    const { offsetX:x, offsetY:y } = e.nativeEvent
                    const deltaTime = Date.now() - animateStep
                    if (rotate && deltaTime > FRAMETIME) {
                        const quat = Quaternion.axisAngle(camera.up, (x - rotate.lastX)/3).mult(Quaternion.axisAngle(camera.right, (y - rotate.lastY)/3))
                        setCamera({
                            pos: quat.rotate(camera.pos),
                            right: quat.rotate(camera.right),
                            up: quat.rotate(camera.up)
                        })
                        setRotate({ lastX:x, lastY:y })
                    }
                }}
                style={{cursor: rotate ? 'grabbing' : 'grab'}}
                />
            <Grid container>
                <ColorSelector leftColor={color} setLeftColor={setColor}/>
                <FormControl>
                    <InputLabel htmlFor={'strength'} shrink>Specular strength (%)</InputLabel>
                    <TextField 
                        id='strength'
                        type='number'
                        value={specularStrength}
                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                        onChange={(e) => setSpecularStrength(e.target.value)}
                        />
                </FormControl>
            </Grid>
        </div>
}

export default Viewer3D