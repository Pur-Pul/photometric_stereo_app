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
    Button
} from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const PhotometricStereoDescription = () => {
    const [expanded, setExpanded] = useState(false)
    return (
        <Card>
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
                    <Typography>
                        TODO
                    </Typography>
                </CardContent>
            </Collapse>
            
        </Card>
    )
}

const NormalMapDescription = () => {
    const [expanded, setExpanded] = useState(false)
    return (
        <Card>
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
                        TODO
                    </Typography>
                </CardContent>
            </Collapse>
            
        </Card>
    )
}

const EditorDescription = () => {
    const [expanded, setExpanded] = useState(false)
    return (
        <Card>
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
        <Grid>
            <Grid container spacing={2} sx={{ alignItems: "flex-end" }} margin={3}>
                <Typography variant='h2'>Welcome</Typography>
                <Typography variant='h5'> to the normal map app</Typography>
            </Grid>
            
            <Card>
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