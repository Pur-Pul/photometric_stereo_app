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
		sortImages(state, action) {
			state.sort((image1, image2) => image2.likes - image1.likes)
		},
	},
})

export const { appendImages, setImages, deleteImage, updateImage, sortImages } =
	imageSlice.actions

export const initializeImages = () => {
	return async (dispatch) => {
		let images = await imageService.getAll()
		dispatch(setImages(images))
		dispatch(sortImages())
	}
}

export const createImages = (images) => {
	return async (dispatch) => {
		const data = new FormData()
		images.forEach((image, index) => {
			data.append('files', image, index.toString() + '.' + image.name.split('.').pop())
		})
		//data.append('format', images[0].name.split('.').pop())

		const new_images = await imageService.post(data)
		dispatch(appendImages(new_images))
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