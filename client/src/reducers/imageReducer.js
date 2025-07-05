import { createSlice } from '@reduxjs/toolkit'
import imageService from '../services/images'

const imageSlice = createSlice({
	name: 'image',
	initialState: [],
	reducers: {
		appendImage(state, action) {
			state.push(action.payload)
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
		sortImages(state, action) {
			state.sort((image1, image2) => image2.likes - image1.likes)
		},
	},
})

export const { appendImage, setImages, deleteImage, updateImage, sortImages } =
	imageSlice.actions

export const initializeImages = () => {
	return async (dispatch) => {
		let images = await imageService.getAll()
		dispatch(setImages(images))
		dispatch(sortImages())
	}
}

export const createImage = (image) => {
	return async (dispatch) => {
		const new_image = await imageService.post(image)
		console.log(new_image)
		dispatch(appendImage(new_image))
	}
}

export const performRemove = (id) => {
	return async (dispatch) => {
		await imageService.remove(id)
		dispatch(deleteImage(id))
	}
}

export const performLike = (id) => {
	return async (dispatch) => {
		let image = await imageService.get(id)
		const response = await imageService.update({ likes: image.likes + 1 }, id)
		dispatch(updateImage(response))
		dispatch(sortImages())
	}
}

export default imageSlice.reducer