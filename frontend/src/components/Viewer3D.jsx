import { useEffect, useRef, useState } from 'react'
import fragCode from '../shaders/lightingShaderFragment'
import vertCode from '../shaders/lightingShaderVertex'
import { notificationSet } from '../reducers/notificationReducer'
import Sphere from '../utils/Sphere'
import Mat4 from '../utils/Matrix'
import Vector3 from '../utils/Vector3'
import Quaternion from '../utils/Quaternion'

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
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
    ctx.vertexAttribPointer(pointer, length, ctx.FLOAT, false, 0, 0)
    ctx.enableVertexAttribArray(pointer)
}

const Viewer3D = () => {
    const canvasRef = useRef(null)
    const tiltQuat = Quaternion.axisAngle(new Vector3(0,0,1), 45)
    const [cameraPos, setCameraPos] = useState(tiltQuat.rotate(new Vector3(0,3,0)))
    const [cameraUp, setCameraUp] = useState(tiltQuat.rotate(new Vector3(0,0,1)))
    const [sphere, setSphere] = useState(new Sphere(3, 1))
    const [program, setProgram] = useState(null)
    const [vertexData, setVertexData] = useState(null)
    const [uvData, setUVData] = useState(null)

    useEffect(() => {
        setVertexData(sphere.getVertexData())
        setUVData(sphere.getUVData())
    }, [sphere])

    useEffect(() => {
        const canvas = canvasRef.current
        
        const ctx = canvas.getContext('webgl')
        if (!ctx) { 
            notificationSet('webgl is not avaliable.')
        } else if (!program) {
            ctx.clearColor(0,0,0,1)
            ctx.enable(ctx.DEPTH_TEST)
            ctx.depthFunc(ctx.LEQUAL)
            ctx.clear(ctx.COLOR_BUFFER_BIT)
            
            setProgram(initShaders(ctx))
        } else if (vertexData && uvData) {
            const target = new Vector3(0,0,0)
            const dir = target.sub(cameraPos).normalize()
            
            const right = cameraUp.cross(dir).normalize()

            const viewMat = new Mat4([
                right.x, right.y, right.z, 0,
                cameraUp.x, cameraUp.y, cameraUp.z, 0,
                dir.x, dir.y, dir.z, 0,
                right.dot(cameraPos), cameraUp.dot(cameraPos), dir.dot(cameraPos), 1
            ])
            
            const worldMat = new Mat4([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ])

            const zfar = 10
            const znear = 0.1
            const fov = 45 * Math.PI/180
            const focal = 1 / Math.tan(fov/2)

            const projMat = new Mat4([
                focal, 0, 0, 0,
                0, focal, 0, 0,
                0, 0, (zfar + znear)/(znear - zfar), -1,
                0, 0, 2 * zfar * znear / (znear - zfar), 0
            ])

            const positionPointer = ctx.getAttribLocation(program, 'attPosition')
            const uvPointer = ctx.getAttribLocation(program, 'attUV')
            const colorPointer = ctx.getUniformLocation(program, 'uColor')
            const worldPointer = ctx.getUniformLocation(program, 'uWorldMatrix')
            const viewPointer = ctx.getUniformLocation(program, 'uViewMatrix')
            const projPointer = ctx.getUniformLocation(program, 'uProjectionMatrix')

            initBuffer(ctx, vertexData, positionPointer, 3)
            initBuffer(ctx, uvData, uvPointer, 2)

            ctx.useProgram(program)
            ctx.uniformMatrix4fv(worldPointer, false, worldMat.mat)
            ctx.uniformMatrix4fv(viewPointer, false, viewMat.mat)
            ctx.uniformMatrix4fv(projPointer, false, projMat.mat)
            ctx.uniform4f(colorPointer, 1, 1, 1, 1)
            ctx.drawArrays(ctx.TRIANGLES, 0, vertexData.length)
            setTimeout(() => {
                const quat = Quaternion.axisAngle(new Vector3(0,1,0), 1)
                setCameraPos(quat.rotate(cameraPos))
                setCameraUp(quat.rotate(cameraUp))
            }, 10)

        }
    }, [cameraPos, program, vertexData, uvData])

    
    return <canvas ref={canvasRef} width={500} height={500}/>
}

export default Viewer3D