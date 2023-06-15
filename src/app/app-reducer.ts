import {Dispatch} from 'redux'
import {authAPI} from 'api/todolists-api'
import {setIsLoggedInAC} from 'features/Login/auth-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'


const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as string | null,
    isInitialized: false
}

const slice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppErrorAC(state, action: PayloadAction<{error: string | null}>) {
            state.error = action.payload.error
        },
        setAppStatusAC(state, action: PayloadAction<{status: RequestStatusType}>) {
            state.status = action.payload.status
        },
        setAppInitializedAC(state, action: PayloadAction<{value: boolean}>) {
            state.isInitialized = action.payload.value
        }
    }
})

export const appReducer = slice.reducer
export const appActions = slice.actions

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({value: true}));
        } else {

        }
        dispatch(appActions.setAppInitializedAC({value: true}));
    })
}
