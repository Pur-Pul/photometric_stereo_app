import Vector3 from './Vector3'

function dsin(angle) {
    const radian = angle * (Math.PI / 180)
    return Math.sin(radian)
}

function dcos(angle) {
    const radian = angle * (Math.PI / 180)
    return Math.cos(radian)
}

class Quaternion extends Vector3 {
    constructor(w=1, x=0, y=0, z=0) {
        super(x, y, z)
        this.w = w
    }
    static axisAngle(axis, angle) {
        const quat = new Quaternion()
        if (angle === 0) {
            quat.x = 0
            quat.y = 0
            quat.z = 0
            quat.w = 1
        } else {
            const scaled_axis = axis.scalar(dsin(angle/2))
            quat.w = dcos(angle/2)
            quat.x = scaled_axis.x
            quat.y = scaled_axis.y
            quat.z = scaled_axis.z
        }
        return quat
    }
    scalar(scale) {
        return new Quaternion(this.w * scale, this.x * scale, this.y * scale, this.z * scale)
    }
    add(quat) {
        return new Quaternion(this.w + quat.w, this.x + quat.x, this.y + quat.y, this.z + quat.z)
    }
    dot(quat) {
        return this.x*quat.x + this.y*quat.y + this.z*quat.z + this.w*quat.w
    }
    rotate(vector) {
        const matrix = [
            new Vector3(1-2*(this.y**2)-2*(this.z**2),	2*this.x*this.y-2*this.w*this.z,			    2*this.x*this.z+2*this.w*this.y),
            new Vector3(2*this.x*this.y+2*this.w*this.z,			    1-2*(this.x**2)-2*(this.z**2),	2*this.y*this.z-2*this.w*this.x),
            new Vector3(2*this.x*this.z-2*this.w*this.y,			    2*this.y*this.z+2*this.w*this.x,			    1-2*(this.x**2)-2*(this.y**2))
        ]
        return new Vector3(matrix[0].dot(vector), matrix[1].dot(vector), matrix[2].dot(vector))
    }
    slerp(quat, t) {
        const ohm = Math.acos(this.dot(quat))
        const sinohm = Math.sin(ohm)
        return this.scalar(Math.sin((1 - t) * ohm) / sinohm).add(quat.scalar(Math.sin(t * ohm) / sinohm))
    }
    mult(quat) {
        return new Quaternion(
            this.w*quat.w - this.x*quat.x - this.y*quat.y - this.z*quat.z,
            this.x*quat.w + this.w*quat.x - this.z*quat.y + this.y*quat.z,
            this.y*quat.w + this.z*quat.x + this.w*quat.y - this.x*quat.z,
            this.z*quat.w - this.y*quat.x + this.x*quat.y + this.w*quat.z
        )
    }
    getAngle(rad=false) {
        return Math.acos(this.w) * 2 * (rad ? 1 : 180/Math.PI)
    }
    getAxis() {
        const rad = Math.acos(this.w)
        if (rad) {
            return new Vector3(this.x,this.y,this.z).scalar(1/Math.sin(rad))
        }
        else {
            return new Vector3(0,0,0)
        }
    }
}

export default Quaternion