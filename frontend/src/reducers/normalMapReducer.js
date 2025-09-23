import { createSlice } from '@reduxjs/toolkit'
import imageService from '../services/images'
import { notificationSet } from './notificationReducer'
import { useNavigate } from 'react-router-dom'
import notFound from '../static/normal_sphere.png'
import { AxiosError } from 'axios'

const reformatNormalMaps = async (uninitalizedNormalMaps) => {
	const normalMaps = [...uninitalizedNormalMaps]
	for (var i = 0; i < normalMaps.length; i++) {
		const normalMap = normalMaps[i]
		normalMap.layers = normalMap.layers.map((id) => { return {id} })
		if (normalMaps[i].icon) { normalMaps[i].icon = { id: normalMaps[i].icon } }
		if (normalMaps[i].flatImage) { normalMaps[i].flatImage = { id: normalMaps[i].flatImage } }
		
		if (!normalMaps[i].icon) { continue }

		try {
			const blob = await imageService.getFile(normalMaps[i].id, normalMaps[i].icon.id)
			normalMaps[i].icon.src = URL.createObjectURL(blob)
			
		} catch (exception) {
			if (exception instanceof AxiosError && exception.response.status === 404) {
				const response = await fetch(notFound)
				const blob = await response.blob()
				normalMaps[i].icon.src = URL.createObjectURL(blob)
			} else {
				throw exception
			}
		}
		
	}
	return normalMaps
}

const normalMapSlice = createSlice({
	name: 'normalMap',
	initialState: [],
	reducers: {
		appendNormalMap(state, action) {
			const newState = [...state]
			action.payload.forEach(newNormalMap => {
				if (state.some(normalMap => normalMap.id === newNormalMap.id)) { return }
				newState.push(newNormalMap)
			})
			return newState
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

export const reFetchNormalMap = (normalMap) => {
	return async (dispatch) => {
		const rawNormalMap = await imageService.get(normalMap.id)
		if (normalMap.updatedAt && normalMap.updatedAt === rawNormalMap.updatedAt) { return }
		const [updatedNormalMap] = await reformatNormalMaps([rawNormalMap])
		dispatch(updateNormalMap(updatedNormalMap))
	}
}

export const initializeNormalMaps = () => {
	return async (dispatch) => {
		let normalMaps = await imageService.getAll()
		normalMaps = await reformatNormalMaps(normalMaps)
		dispatch(setNormalMaps(normalMaps))
	}
}

export const fetchFlatImage = (normalMap) => {
	return async (dispatch) => {
		let blob
		try {
			blob = await imageService.getFile(normalMap.id, normalMap.flatImage.id)
		} catch (exception) {
			if (exception instanceof AxiosError && exception.response.status === 404) {
				console.log(exception)
				const response = await fetch(notFound)
				blob = await response.blob()
			} else {
				throw exception
			}
		}
		dispatch(updateNormalMap({ ...normalMap, flatImage: {...normalMap.flatImage, src: URL.createObjectURL(blob)} }))
	}
}

export const fetchLayers = (normalMap) => {
	return async (dispatch) => {
		const updatedLayers = Array(normalMap.layers.length)
		for (var i = 0; i < updatedLayers.length; i++) {
			let blob
			try {
				blob = await imageService.getFile(normalMap.id, normalMap.layers[i].id)
			} catch (exception) {
				if (exception instanceof AxiosError && exception.response.status === 404) {
					console.log(exception)
					const response = await fetch(notFound)
					blob = await response.blob()
				} else {
					throw exception
				}
			}
			updatedLayers[i] = {...normalMap.layers[i], src: URL.createObjectURL(blob)}
		}
		dispatch(updateNormalMap({ ...normalMap, layers: updatedLayers }))
	}
}

export const fetchPage = (page, category) => {
	return async (dispatch) => {
		try {
			let normalMaps = await imageService.getPage(page, category)
			normalMaps = await reformatNormalMaps(normalMaps)
			dispatch(appendNormalMap(normalMaps))
		} catch (exception) {
			if (exception instanceof AxiosError) {
				console.log(exception)
				dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
			} else {
				throw exception
			}
		}
	}
}

export const generateNormalMap = (sourceFiles, mask, name) => {
	return async (dispatch) => {
		try {
			const data = new FormData()
			sourceFiles.forEach((file, index) => {
				data.append('files', file.src, index.toString() + '.' + file.src.name.split('.').pop())
				data.append('lights', file.light)
			})
			data.append('files', mask, mask.name)
			data.set('format', sourceFiles[0].src.name.split('.').pop())
			data.set('name', name)

			const newNormalMap = await imageService.postPhotostereo(data)
			console.log(newNormalMap)
			const iconBlob = await imageService.getFile(newNormalMap.id, newNormalMap.icon)
			newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
			newNormalMap.flatImage = { id:newNormalMap.flatImage }
			dispatch(appendNormalMap([newNormalMap]))
		} catch (exception) {
			if (exception instanceof AxiosError) {
				console.log(exception)
				dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
			} else {
				throw exception
			}
		}
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
			dispatch(notificationSet({ text: 'Normal map created.', type: 'success' }, 5))
			navigate(`/normal_map/${newNormalMap.id}`)
		} catch (exception) {
			if (exception instanceof AxiosError) {
				console.log(exception)
				dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
			} else {
				throw exception
			}
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
		} catch (exception) {
			console.log(exception)
			if (exception instanceof AxiosError) {
				dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
			} else {
				throw exception
			}
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
		} catch (exception) {
			console.log(exception)
			if (exception instanceof AxiosError) {
				dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
			} else {
				throw exception
			}
		}
	} 
}

export const performRemove = (id) => {
	return async (dispatch) => {
		try {
			await imageService.remove(id)
			dispatch(deleteNormalMap(id))
		} catch (exception) {
			console.log(exception)
			if (exception instanceof AxiosError) {
				dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
			} else {
				throw exception
			}
		}
	}
}

export default normalMapSlice.reducer