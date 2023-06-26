import { Dispatch } from "redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolist } from "common/actions/common-actions";
import { appActions } from "app/app.reducer";
import { handleServerAppError, handleServerNetworkError } from "common/utils";
import { authAPI, LoginParamsType } from "features/auth/auth.api";

export type InitialStateType = typeof initialState;

const initialState = {
  isLoggedIn: false,
};

export const slice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
      state.isLoggedIn = action.payload.value;
    },
  },
});

export const authReducer = slice.reducer;
export const setIsLoggedInAC = slice.actions.setIsLoggedInAC;

// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: ThunkDispatch) => {
  dispatch(appActions.setAppStatusAC({ status: "loading" }));
  authAPI
    .login(data)
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(setIsLoggedInAC({ value: true }));
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};
export const logoutTC = () => (dispatch: ThunkDispatch) => {
  dispatch(appActions.setAppStatusAC({ status: "loading" }));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(setIsLoggedInAC({ value: false }));
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        dispatch(clearTasksAndTodolist());
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};

// types

type ThunkDispatch = Dispatch;
