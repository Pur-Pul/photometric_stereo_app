import { createSlice } from '@reduxjs/toolkit'
import imageService from '../services/images'
import { notificationSet } from './notificationReducer'

const normalMapSlice = createSlice({
	name: 'normalMap',
	initialState: [],
	reducers: {
		appendNormalMap(state, action) {
			return [...state, ...action.payload]
		},
		setNormalMaps(state, action) {
			return action.payload
		},
		deleteNormalMap(state, action) {
			const normalMap_index = state.findIndex((normalMap) => normalMap.id === action.payload)
			const stateClone = [...state]
			stateClone.splice(normalMap_index, 1)
			return stateClone
		},
		updateNormalMap(state, action) {
			const normalMap_index = state.findIndex(
				(normalMap) => normalMap.id === action.payload.id
			)
			state[normalMap_index] = action.payload
		},
	},
})

export const { appendNormalMap, setNormalMaps, deleteNormalMap, updateNormalMap } =
	normalMapSlice.actions

export const initializeNormalMaps = () => {
	return async (dispatch) => {
		let normalMaps = await imageService.getAll()
		dispatch(setNormalMaps(normalMaps))
	}
}

export const generateNormalMap = (sourceNormalMaps, mask) => {
	return async (dispatch) => {
		const data = new FormData()
		sourceNormalMaps.forEach((normalMap, index) => {
			data.append('files', normalMap.src, index.toString() + '.' + normalMap.src.name.split('.').pop())
			data.append('lights', normalMap.light)
		})
		data.append('files', mask, mask.name)
		data.set('format', sourceNormalMaps[0].src.name.split('.').pop())

		const newNormalMap = await imageService.postPhotostereo(data)
		dispatch(appendNormalMap([newNormalMap]))
	}
}

export const createNormalMap = (normalMap) => {
	return async (dispatch) => {
		const data = new FormData()
		data.append('files', normalMap.src, normalMap.src.name)
		data.set('format', normalMap.src.name.split('.').pop())

		const newNormalMap = await imageService.post(data)
		dispatch(appendNormalMaps([newNormalMap]))
	}
}

export const performRemove = (id) => {
	return async (dispatch) => {
		try {
			await imageService.remove(id)
			dispatch(deleteNormalMap(id))
		} catch (err) {
			notificationSet({ text: err, type: 'error'}, 5)
		}
	}
}

export default normalMapSlice.reducer