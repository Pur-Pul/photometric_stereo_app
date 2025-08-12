import { createSlice } from '@reduxjs/toolkit'
import imageService from '../services/images'
import { notificationSet } from './notificationReducer'
import axios from 'axios'

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
		updateNormalMap(state, action) {
			const normalMap_index = state.findIndex(
				(normalMap) => normalMap.id === action.payload.id
			)

			state[normalMap_index] = action.payload
		},
		updateLayers(state, action) {
			const normalMap_index = state.findIndex(
				(normalMap) => normalMap.id === action.payload.id
			)

			const normalMap = state[normalMap_index]
			state[normalMap_index] = { ...normalMap, layers: action.payload.layers }
		}
	},
})

export const { appendNormalMap, setNormalMaps, deleteNormalMap, updateNormalMap, updateLayers } =
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

export const performCreate = (blobs, iconBlob) => {
	return async (dispatch) => {
		try {
			const data = new FormData()
			blobs.forEach((blob, index) => {
				const file = new File([blob], `layer-${index}.png`, { type: 'image/png' })
				data.append('files', file, `layer-${index}.png`)
			})
			data.append('files', iconBlob, `layer-icon.png`)
			const newNormalMap = await imageService.post(data)
			dispatch(appendNormalMap([newNormalMap]))
		} catch (error) {
			dispatch(notificationSet({text: error.response.data.error ? error.response.data.error : 'An error occurred', type:'error'}, 5))
		}
	}
}

export const performLayerUpdate = (blobs, iconBlob, layers, id) => {
	return async (dispatch) => {
		try {
			const data = new FormData()
			blobs.forEach((blob, index) => {
				const file = new File([blob], `layer-${index}.png`, { type: 'image/png' })
				data.append('files', file, `layer-${index}.png`)
			})
			data.append('files', iconBlob, `layer-icon.png`)
			await imageService.put(data, id)
			dispatch(updateLayers({id, layers}))
		} catch (error) {
			console.log(error)
			dispatch(notificationSet({text: error.response.data.error ? error.response.data.error : 'An error occurred', type: 'error'}, 5))
		}
	} 
}

export const performRemove = (id) => {
	return async (dispatch) => {
	
		await imageService.remove(id)
		dispatch(deleteNormalMap(id))
		
	}
}

export default normalMapSlice.reducer