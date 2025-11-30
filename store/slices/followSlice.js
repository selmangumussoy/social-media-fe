import { createSlice } from "@reduxjs/toolkit";

const followSlice = createSlice({
    name: "follow",

    initialState: {
        following: [],      // Takip edilen userId listesi
        followMap: {}       // key = userId, value = followId (UNFOLLOW için gerekli)
    },

    reducers: {

        // ---------------- FOLLOW ----------------
        followUser: (state, action) => {
            const { userId, followId } = action.payload;

            // userId daha önce yoksa ekle
            if (!state.following.includes(userId)) {
                state.following.push(userId);
            }

            // userId -> followId eşleşmesini kaydet
            state.followMap[userId] = followId;
        },

        // ---------------- UNFOLLOW ----------------
        unfollowUser: (state, action) => {
            const userId = action.payload;

            // following listesinden çıkar
            state.following = state.following.filter(id => id !== userId);

            // followId bilgisini sil
            delete state.followMap[userId];
        }
    }
});

export const { followUser, unfollowUser } = followSlice.actions;
export default followSlice.reducer;
