import { createSlice } from '@reduxjs/toolkit'
import imageService from '../services/images'
import { notificationSet } from './notificationReducer'
import { useNavigate } from 'react-router-dom'


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
			state[normalMap_index] = { ...normalMap, layers: action.payload.layers, icon: action.payload.icon }
		}
	},
})

export const { appendNormalMap, setNormalMaps, deleteNormalMap, updateNormalMap, updateLayers } =
	normalMapSlice.actions

export const initializeNormalMaps = () => {
	return async (dispatch) => {
		let normalMaps = await imageService.getAll()
		
		for (var i = 0; i < normalMaps.length; i++) {
			const normalMap = normalMaps[i]
			normalMap.layers = normalMap.layers.map((id) => { return {id} })

			if (!normalMaps[i].icon) { continue }
			const blob = await imageService.getFile(normalMaps[i].id, normalMaps[i].icon)
			normalMaps[i].icon = { id: normalMaps[i].icon, src: URL.createObjectURL(blob)}
			normalMaps[i].flatImage = { id:normalMaps[i].flatImage }
		}

		dispatch(setNormalMaps(normalMaps))
	}
}

export const generateNormalMap = (sourceNormalMaps, mask, name) => {
	return async (dispatch) => {
		const data = new FormData()
		sourceNormalMaps.forEach((normalMap, index) => {
			data.append('files', normalMap.src, index.toString() + '.' + normalMap.src.name.split('.').pop())
			data.append('lights', normalMap.light)
		})
		data.append('files', mask, mask.name)
		data.set('format', sourceNormalMaps[0].src.name.split('.').pop())
		data.set('name', name)

		const newNormalMap = await imageService.postPhotostereo(data)
		const iconBlob = await imageService.getFile(newNormalMap.id, newNormalMap.icon)
		newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
		newNormalMap.flatImage = { id:newNormalMap.flatImage }
		dispatch(appendNormalMap([newNormalMap]))
	}
}

export const performCreate = (blobs, name, navigate) => {
	return async (dispatch) => {
		try {
			const data = new FormData()
			blobs.forEach((blob, index) => {
				const file = new File([blob], `layer-${index}.png`, { type: 'image/png' })
				data.append('files', file, `layer-${index}.png`)
			})
			data.set('name', name)
			const newNormalMap = await imageService.post(data)
			newNormalMap.layers = newNormalMap.layers.map((id) => { return { id } })

			const iconBlob = await imageService.getFile(newNormalMap.id, newNormalMap.icon)
			newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
			newNormalMap.flatImage = { id: newNormalMap.flatImage }
			dispatch(appendNormalMap([newNormalMap]))
			dispatch(notificationSet({text: 'Normal map created.', type: 'success'}, 5))
			navigate(`/normal_map/${newNormalMap.id}`)
		} catch (error) {
			console.log(error)
			dispatch(notificationSet({ text: error.response.data.error ? error.response.data.error : 'An error occurred', type:'error' }, 5))
		}
	}
}

export const performUpdate = (normalMap) => {
	return async (dispatch) => {
		try {
			const data = new FormData()
			data.set('name', normalMap.name)
			data.set('visibility', normalMap.visibility)
			const newNormalMap = await imageService.put(data, normalMap.id)
			const iconBlob = await imageService.getFile(newNormalMap.id, newNormalMap.icon)
			newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
			newNormalMap.flatImage = { id: newNormalMap.flatImage }

			dispatch(updateNormalMap(newNormalMap))
		} catch (error) {
			console.log(error)
			dispatch(notificationSet({ text: error.response.data.error ? error.response.data.error : 'An error occurred', type:'error' }, 5))
		}
	}
}

export const performLayerUpdate = (blobs, layers, id) => {
	return async (dispatch) => {
		try {
			const data = new FormData()
			blobs.forEach((blob, index) => {
				const file = new File([blob], `layer-${index}.png`, { type: 'image/png' })
				data.append('files', file, `layer-${index}.png`)
			})
			const newNormalMap = await imageService.put(data, id)

			let updatedLayers = layers.filter(layer => layer.id)
			for (var i = 0; i < newNormalMap.layers.length; i++) {
				const layer = { id: newNormalMap.layers[i] }
				if (updatedLayers.find(newLayer => newLayer.id === layer.id )) { continue }
				updatedLayers.push(layer)
			}

			const iconBlob = await imageService.getFile(newNormalMap.id, newNormalMap.icon)
			newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
			newNormalMap.flatImage = { id: newNormalMap.flatImage }

			dispatch(updateLayers({id, layers: updatedLayers, icon: { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }}))
			dispatch(notificationSet({text: 'Normal map saved.', type: 'success'}, 5))
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