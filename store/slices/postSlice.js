import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { dummyPosts } from "@/data/dummyPostData"
import { toggleLikeService } from "@/services/likeService"

export const toggleLike = createAsyncThunk(
    "posts/toggleLike",
    async ({ postId, userId }, { rejectWithValue }) => {
      try {
        await toggleLikeService(userId, postId)
        return { postId, userId }
      } catch (error) {
        return rejectWithValue(error)
      }
    }
)

const initialState = {
  posts: dummyPosts,
  savedPosts: [],
  userPosts: [],
  loading: false,
  error: null,
}

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
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
        post.commentCount = (post.commentCount || 0) + 1
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
        .addCase(toggleLike.pending, (state, action) => {
          const { postId, userId } = action.meta.arg
          const post = state.posts.find((p) => p.id === postId)

          if (post) {
            if (!post.likes) post.likes = []

            const index = post.likes.findIndex(id => String(id) === String(userId))

            if (index > -1) {
              post.likes.splice(index, 1)
              post.likeCount = Math.max(0, (post.likeCount || 0) - 1)
            } else {
              post.likes.push(userId)
              post.likeCount = (post.likeCount || 0) + 1
            }
          }
        })
        .addCase(toggleLike.rejected, (state, action) => {
          const { postId, userId } = action.meta.arg
          const post = state.posts.find((p) => p.id === postId)

          if (post) {
            const index = post.likes.findIndex(id => String(id) === String(userId))

            if (index > -1) {
              post.likes.splice(index, 1)
              post.likeCount = Math.max(0, (post.likeCount || 0) - 1)
            } else {
              post.likes.push(userId)
              post.likeCount = (post.likeCount || 0) + 1
            }
            console.error("Beğeni işlemi başarısız oldu, geri alındı.")
          }
        })
  },
})

export const { toggleSave, addPost, addComment, setPosts } = postSlice.actions
export default postSlice.reducer