import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  users: [],
  devices: [],
  groups: [],
}

const danaSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload
    },
    setDevices: (state, action) => {
      state.devices = action.payload
    },
    setGroups: (state, action) => {
      state.groups = action.payload
    },
  },
})

export const { setUsers, setDevices, setGroups } = danaSlice.actions
export default danaSlice.reducer
