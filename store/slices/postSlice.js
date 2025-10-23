import { createSlice } from "@reduxjs/toolkit"
import { dummyPosts } from "@/data/dummyPostData"

const initialState = {
  posts: dummyPosts,
  savedPosts: [],
  userPosts: [],
}

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    toggleLike: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload.postId)
      if (post) {
        const userId = action.payload.userId
        const index = post.likes.indexOf(userId)
        if (index > -1) {
          post.likes.splice(index, 1)
        } else {
          post.likes.push(userId)
        }
      }
    },
    toggleSave: (state, action) => {
      const postId = action.payload
      const index = state.savedPosts.indexOf(postId)
      if (index > -1) {
        state.savedPosts.splice(index, 1)
      } else {
        state.savedPosts.push(postId)
      }
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload)
    },
    addComment: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload.postId)
      if (post) {
        post.comments.push(action.payload.comment)
      }
    },
  },
})

export const { toggleLike, toggleSave, addPost, addComment } = postSlice.actions
export default postSlice.reducer
