import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import counterReducer from "../features/counter/counterSlice"
import databaseReducer from "../features/database/databaseSlice"
import settingsReducer from "../features/settings/settingsSlice"

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    database: databaseReducer,
    settings: settingsReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
