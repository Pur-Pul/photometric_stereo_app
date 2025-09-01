import { Dialog, DialogTitle, DialogActions, TextField, Button} from '@mui/material'
import { useState } from 'react'

const NameForm = ({ open, handleSave, handleCancel }) => {
    const [valid, setValid] = useState(false)
    return <Dialog open={open} closeAfterTransition={false}>
        <DialogTitle data-testid='name-form-title'>Name the normal map</DialogTitle>
        <form onSubmit={handleSave}>
            <TextField id='name' onChange={(e) => setValid(e.target.value.length)} slotProps={{ htmlInput: { 'data-testid' : 'name-form-input' } }}/>
                <DialogActions>
                    <Button onClick={handleCancel} data-testid='name-form-cancel' >Cancel</Button>
                    <Button type='submit' disabled={!valid} data-testid='name-form-save' >Save</Button>
                </DialogActions>
        </form>
    </Dialog>
}

export default NameForm