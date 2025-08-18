import { useEffect, useRef } from 'react'
import fragCode from '../shaders/lightingShaderFragment'
import vertCode from '../shaders/lightingShaderVertex'
import { notificationSet } from '../reducers/notificationReducer'
import Sphere from '../utils/Sphere'

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

const createBuffer = (ctx, data) => {
    const buffer = ctx.createBuffer()
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
	ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW)
	return buffer
}

const Viewer3D = () => {
    const canvasRef = useRef(null)
    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = 500
        canvas.height = 500
        const ctx = canvas.getContext('webgl')
        if (!ctx) { 
            notificationSet('webgl is not avaliable.')
        } else {
            ctx.clearColor(0,0,0,1)
            ctx.clear(ctx.COLOR_BUFFER_BIT)
            const sphere = new Sphere(3, 1)
            const program = initShaders(ctx)

            const matrix = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);

            const positionPointer = ctx.getAttribLocation(program, 'attPosition')
            const uvPointer = ctx.getAttribLocation(program, 'attUV')
            const colorPointer = ctx.getUniformLocation(program, 'uColor')
            const matrixPointer = ctx.getUniformLocation(program, 'uMatrix')
            const vertexData = sphere.getVertexData()
            ctx.bindBuffer(ctx.ARRAY_BUFFER, createBuffer(ctx, vertexData))
            ctx.vertexAttribPointer(positionPointer, 3, ctx.FLOAT, false, 0, 0)
            ctx.enableVertexAttribArray(positionPointer)

            ctx.bindBuffer(ctx.ARRAY_BUFFER, createBuffer(ctx, sphere.getUVData()))
            ctx.vertexAttribPointer(uvPointer, 2, ctx.FLOAT, false, 0, 0)
            ctx.enableVertexAttribArray(uvPointer)

            ctx.useProgram(program)
            ctx.uniformMatrix4fv(matrixPointer, false, matrix)
            ctx.uniform4f(colorPointer, 1, 1, 1, 1)
            ctx.drawArrays(ctx.TRIANGLES, 0, vertexData.length)
        }
    }, [])

    return <canvas ref={canvasRef} />
}

export default Viewer3D