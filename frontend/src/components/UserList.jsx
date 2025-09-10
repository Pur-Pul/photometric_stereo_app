import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState} from 'react'
import { Link, useNavigate} from 'react-router-dom'
import { initializeUsers } from '../reducers/userReducer'
import { 
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	TableSortLabel
} from '@mui/material'

const UserList = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const users = useSelector(state => state.users)
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	console.log(users)

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value)
		setPage(0)
	}

	return (
		<div>
			<h1>users</h1>
			<TableContainer>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell>Username</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Number of maps</TableCell>
							<TableCell>User created</TableCell>
							<TableCell>Last online</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => {
							const createdDate = new Date(user.createdAt)
							const lastOnlineDate = new Date(user.updatedAt)
							return (
								<TableRow key={user.id}>
									<TableCell><Button onClick={() => navigate(`/users/${user.id}`)}>{user.username}</Button></TableCell>
									<TableCell>{user.role}</TableCell>
									<TableCell>{user.normalMaps.length}</TableCell>
									<TableCell>{createdDate.toLocaleTimeString('en-GB')} | {createdDate.toLocaleDateString('fi')}</TableCell>
									<TableCell>{lastOnlineDate.toLocaleTimeString('en-GB')} | {lastOnlineDate.toLocaleDateString('fi')}</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component="div"
				count={users.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
			
			
		</div>
	)
}

export default UserList