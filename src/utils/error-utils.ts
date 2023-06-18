import {ResponseType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {appActions} from "app/app.reducer";
import axios, {AxiosError} from "axios";

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(appActions.setAppErrorAC({error: data.messages[0]}))
    } else {
        dispatch(appActions.setAppErrorAC({error: 'Some error occurred'}))
    }
    dispatch(appActions.setAppStatusAC({status: 'failed'}))
}

// export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch) => {
//     dispatch(appActions.setAppErrorAC(error.message ? {error: error.message} : {error: 'Some error occurred'}))
//     dispatch(appActions.setAppStatusAC({status: 'failed'}))
// }

export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
    const err = e as Error | AxiosError<{ error: string }>
    if (axios.isAxiosError(err)) {
        const error = err.message ? err.message : 'Some error occurred'
        dispatch(appActions.setAppErrorAC({error}))
    } else {
        dispatch(appActions.setAppErrorAC({error: `Native error ${err.message}`}))
    }
    dispatch(appActions.setAppStatusAC({status: 'failed'}))
}
