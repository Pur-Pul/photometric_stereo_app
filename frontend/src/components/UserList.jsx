import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
} from '@mui/material'

const UserList = () => {
    const navigate = useNavigate()
    const users = useSelector(state => state.users)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [sort, setSort] = useState('asc')
    const [sortBy, setSortBy] = useState('username')
    const [sortedUsers, setSortedUsers] = useState([])

    useEffect(() => {
        let sortedUsers = [...users.map(user => ({ ...user, numberOfMaps: user.normalMaps.length }))]
        sortedUsers.sort((a, b) => {
            return sort === 'asc'
                ? (a[sortBy] < b[sortBy] ? -1 : 1)
                : (a[sortBy] < b[sortBy] ? 1 : -1)
        })
        sortedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        setSortedUsers(sortedUsers)
    }, [users, sort, sortBy, page, rowsPerPage])


    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const handleSetSort = (e) => {
        if (sortBy === e.target.id) {
            setSort(sort === 'asc' ? 'desc' : 'asc')
        }
        setSortBy(e.target.id)
    }
    const headers = {
        username: 'Username',
        role: 'Role',
        numberOfMaps: 'Number of maps',
        createdAt: 'User created',
        updatedAt: 'Last online' }
    return (
        <div>
            <h1>users</h1>
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {Object.keys(headers).map(header => (
                                <TableCell key={header} sortDirection={sortBy === header ? sort : false}>
                                    <TableSortLabel
                                        id={header}
                                        active={sortBy === header}
                                        direction={sortBy === header ? sort : 'asc'}
                                        onClick={handleSetSort}
                                    >
                                        {headers[header]}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers.map(user => {
                            const createdDate = new Date(user.createdAt)
                            const lastOnlineDate = new Date(user.updatedAt)
                            return (
                                <TableRow key={user.id}>
                                    <TableCell><Button onClick={() => navigate(`/users/${user.id}`)}>{user.username}</Button></TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.normalMaps.length}</TableCell>
                                    <TableCell>{createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} | {createdDate.toLocaleDateString('fi')}</TableCell>
                                    <TableCell>{lastOnlineDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} | {lastOnlineDate.toLocaleDateString('fi')}</TableCell>
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