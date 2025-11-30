import { createSlice } from "@reduxjs/toolkit";

const followSlice = createSlice({
    name: "follow",
    initialState: {
        following: [], // Takip edilen kullanıcı IDleri
    },
    reducers: {
        followUser(state, action) {
            const id = action.payload;
            if (!state.following.includes(id)) {
                state.following.push(id);
            }
        },
        unfollowUser(state, action) {
            const id = action.payload;
            state.following = state.following.filter((x) => x !== id);
        },
        setFollowingList(state, action) {
            state.following = action.payload; // backend'den liste alırsan kullanırsın
        },
    },
});

export const { followUser, unfollowUser, setFollowingList } = followSlice.actions;
export default followSlice.reducer;
