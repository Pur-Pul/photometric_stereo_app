import { createSlice } from '@reduxjs/toolkit'
import imageService from '../services/images'

const imageSlice = createSlice({
	name: 'image',
	initialState: [],
	reducers: {
		appendImages(state, action) {
			state.push(...action.payload)
		},
		setImages(state, action) {
			return action.payload
		},
		deleteImage(state, action) {
			const image_index = state.findIndex(
				(image) => image.id === action.payload
			)
			state.splice(image_index, 1)
		},
		updateImage(state, action) {
			const image_index = state.findIndex(
				(image) => image.id === action.payload.id
			)
			state[image_index] = action.payload
		},
	},
})

export const { appendImages, setImages, deleteImage, updateImage } =
	imageSlice.actions

export const initializeImages = () => {
	return async (dispatch) => {
		let images = await imageService.getAll()
		dispatch(setImages(images))
	}
}

export const createImages = (images, mask) => {
	return async (dispatch) => {
		const data = new FormData()
		images.forEach((image, index) => {
			data.append('files', image.src, index.toString() + '.' + image.src.name.split('.').pop())
			data.append('lights', image.light)
		})
		data.append('files', mask, mask.name)
		data.set('format', images[0].src.name.split('.').pop())

		const new_image = await imageService.post(data)
		dispatch(appendImages([new_image]))
	}
}

export const performRemove = (id) => {
	return async (dispatch) => {
		await imageService.remove(id)
		dispatch(deleteImage(id))
	}
}

export default imageSlice.reducer