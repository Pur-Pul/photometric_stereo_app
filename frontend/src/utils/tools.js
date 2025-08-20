const hexNumber = (hex) => {
    switch(hex.toUpperCase()) {
        case 'A':
            return 10
        case 'B':
            return 11
        case 'C':
            return 12
        case 'D':
            return 13
        case 'E':
            return 14
        case 'F':
            return 15
        default:
            return Number(hex)
    }
}

const hexToDecimal = (hex) => {
    let sum = 0
    hex.split('').forEach((char, index) => {
        sum += hexNumber(char) * (index === hex.length - 1
            ? 1
            : 16 * (hex.length - index - 1))
    })
    return sum
}

export const hexToRGB = (hexColor) => {
    if (hexColor.length !== 7 || hexColor[0] !== '#') {throw Error(`Invalid hexadecimal color: ${hexColor}`)}
    try {
        const red = hexToDecimal(hexColor.substring(1, 3))
        const green = hexToDecimal(hexColor.substring(3, 5))
        const blue = hexToDecimal(hexColor.substring(5, 7))
        return [red, green, blue]
    } catch (e) {
        console.log(e)
        throw Error(`Invalid hexadecimal color: ${hexColor}`)
    }
}