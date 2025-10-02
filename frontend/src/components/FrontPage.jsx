import { 
    Typography,
    Grid,
    List,
    ListItem,
    Card,
    CardContent,
    CardHeader,
    Collapse,
    CardActions,
    CardMedia,
    Button
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import normalLeaves from '../static/normal_leaves_1500x1000.png'
import leaves from '../static/leaves_black_bg_1500x1000.png'
import Viewer3D from './Viewer3D'

const PhotometricStereoDescription = () => {
    const [expanded, setExpanded] = useState(false)
    return (
        <Card sx={{ maxWidth: 1080 }}>
            <CardHeader 
                title='Photometric stereo'
                subheader='originally by Robert J. Woodham in 1980'
                />
            <CardContent>
                <Typography>
                    This application utilizes a photometric stereo algorithm that allows generation of normal maps from a list of images. 
                    The images are to be taken of the same of the same subject with the same angle, but with varying light directions.
                    By specifying the direction of the light in each image the alogrithm calculates the surface normals for each pixel in the resulting image.
                </Typography>
                <Typography>
                    The photometric stereo script used in this application was created by visiont3lab and taken from: <Link to='https://github.com/visiont3lab/photometric_stereo'>https://github.com/visiont3lab/photometric_stereo</Link>
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Hide instructions' : 'View instructions'}
                </Button>
            </CardActions>
            <Collapse in={expanded}>
                <CardContent>
                    <Typography variant='h6'>Taking the pictures</Typography>
                    <Typography>
                        To generate a normal map two or more pictures of the subject will be required, but the more pictures the better the result.
                        Keep in mind that there is a default limit of 15 pictures per upload and also a certain file size limit.
                        For best results the camera and the subject need to pe perfectly still between the pictures, otherwise the normal map will end up blurry.
                    </Typography>
                    <br />
                    <Typography>
                        When taking the pictures move a light source around the subject making sure it stays at about the same distance.
                        For each picture take note of what direction the light source is in relation to the subject.
                        The light source could for example be moved in a circle around the subject to make it easier to remember.
                        While the pictures can be sorted by creation date, I recommend numbering them in the order they were taken.
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography variant='h6'>Light directions</Typography>
                    <Typography>
                        The light direction are selected in an interactive 3D view.
                        The yellow lines represent the direction of the light.
                        To change the direction click somewhere on the blue sphere.
                        To rotate the view click and hold outside the blue sphere and drag.
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography variant='h6'>Drawing a mask</Typography>
                    <Typography>
                        Drawing a mask is optional, but allows masking out unneccessary content from the background of the source images.
                        The default mask keeps everyhing, but it can be edited.
                        Draw out black on the parts of the image that are to masked out and white on the ones to keep.
                        In the mask editor one of the images can be overlayed to make it easier to align the mask.
                    </Typography>
                </CardContent>
            </Collapse>
        </Card>
    )
}

const NormalMapDescription = () => {
    const [expanded, setExpanded] = useState(false)
    const [normalMap, setNormalMap] = useState(null)
    const [texture, setTexture] = useState(null)

    useEffect(() => {
        const normalMap = new Image()
        normalMap.onload = function () { setNormalMap(this) }
        normalMap.src = normalLeaves

        const texture = new Image()
        texture.onload = function () { setTexture(this) }
        texture.src = leaves
    }, [])

    return (
        <Card sx={{ maxWidth: 1080 }}>
            <CardHeader 
                title='Normal map'
                subheader='What is it?'
                />
            
            <CardContent>
                <Typography>
                    In short a normal map is surface normal data encoded in an image. 
                    A surface normal is a direction that is tangent to a surface, which means that for a flat surface like a table the surface normal would be pointing straight up.

                </Typography>
                <Typography>
                    When applying a lighting shader to a surface the normal is required to calculate how light should be reflected of it.
                    With a specific surface normals for each pixel in a texure, light reflection can be calculated separately for each pixel.
                    In order to provide a shader with per pixel surface normals, they can be encoded into an image, which can then be passed to the shader.
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Read less' : 'Read more'}
                </Button>
            </CardActions>
            <Collapse in={expanded}>
                <CardContent>
                    <Typography>
                        The color channels red, green and blue represent the x, y and z components of the surface normal vectors.
                        The more red a pixel is the more the surface normal points toward the right.
                        If the red is less than half it will instead point towards the left.
                        Same goes for the y and z components with the green and blue channels.
                    </Typography>
                    <Typography>
                        Below is a normalmap of a branch of leaves.
                    </Typography>
                    <CardMedia
                        component='img'
                        image={normalLeaves}
                    />
                    <Typography>
                        The black part of the normal map is what has been masked out and will be transparent when rendered.
                        By clicking the button below you can preview how this normal maps is rendered.
                        The preview can be rotated with a mouse.
                    </Typography>
                    { normalMap && texture ? <Viewer3D image={normalMap} texture={texture} simple/> : null }
                </CardContent>
            </Collapse>
            
        </Card>
    )
}

const EditorDescription = () => {
    const [expanded, setExpanded] = useState(false)
    return (
        <Card sx={{ maxWidth: 1080 }}>
            <CardHeader 
                title='Normal map editor'
                subheader='Designed for easy creation of new normal maps'
                />
            <CardContent>
                <Typography>
                    
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Hide instructions' : 'View instructions'}
                </Button>
            </CardActions>
            <Collapse in={expanded}>
                <CardContent>
                    <Typography>
                        TODO
                    </Typography>
                </CardContent>
            </Collapse>
            
        </Card>
    )
}

const FrontPage = () => {
    return (
        <Grid margin={3}>
            <Grid container spacing={2} sx={{ alignItems: "flex-end" }}>
                <Typography variant='h2'>Welcome</Typography>
                <Typography variant='h5'> to the normal map app</Typography>
            </Grid>
            
            <Card sx={{ maxWidth: 1080 }}>
                <CardHeader title='What is this?' />
                <CardContent>
                    <Typography>
                        This application is intended to help with the creation of normal maps. The app has the following features:
                    </Typography>
                    <List>
                        <ListItem>
                            <Typography>- A function for generating normal maps from a series of images with varying light directions.</Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>- An image editor designed for creation of new normal maps by manual drawing and combining other normal maps.</Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>- Browsing and sharing normal maps with other users.</Typography>
                        </ListItem>
                    </List>
                    <Typography>
                        Want to build this application yourself? The source code can be found at: <Link to='https://github.com/pur-pul/photometric_stereo_app'>https://github.com/pur-pul/photometric_stereo_app</Link>
                    </Typography>
                </CardContent>
            </Card>
            <NormalMapDescription />
            <PhotometricStereoDescription />
            <EditorDescription />
        </Grid>
    )
}

export default FrontPage