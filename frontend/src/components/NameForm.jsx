import { Dialog, DialogTitle, DialogActions, TextField, Button} from '@mui/material'
import { useState } from 'react'

const NameForm = ({ open, handleSave, handleCancel }) => {
    const [valid, setValid] = useState(false)
    return <Dialog open={open} closeAfterTransition={false}>
        <DialogTitle>Name the normal map</DialogTitle>
        <form onSubmit={handleSave}>
            <TextField id='name' onChange={(e) => setValid(e.target.value.length)}/>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button type='submit' disabled={!valid}>Save</Button>
                </DialogActions>
        </form>
    </Dialog>
}

export default NameForm