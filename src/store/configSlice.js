import { createSlice } from "@reduxjs/toolkit"

import { initialState } from "./config.js"

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
})

export default configSlice.reducer
