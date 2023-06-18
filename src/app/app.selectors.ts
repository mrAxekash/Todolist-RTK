import {AppRootStateType} from "app/store";


export const selectorIsInitialized = (state: AppRootStateType) => state.app.isInitialized
export const selectorStatus = (state: AppRootStateType) => state.app.status
export const selectorError = (state: AppRootStateType) => state.app.error