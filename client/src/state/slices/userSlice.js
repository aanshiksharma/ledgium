import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
    },
    logOutUser: () => {
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, logOutUser } = userSlice.actions;
export default userSlice.reducer;
