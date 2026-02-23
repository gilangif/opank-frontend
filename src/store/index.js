import { configureStore } from "@reduxjs/toolkit"

import auth from "./authSlice.js"
import dana from "./danaSlice.js"
import config from "./configSlice.js"

export const store = configureStore({ reducer: { auth, config, dana } })
