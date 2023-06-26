import { Dispatch } from "redux";
import { appActions } from "app/app.reducer";
import { ResponseType } from "common/types/common.types";

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    dispatch(appActions.setAppErrorAC({ error: data.messages[0] }));
  } else {
    dispatch(appActions.setAppErrorAC({ error: "Some error occurred" }));
  }
  dispatch(appActions.setAppStatusAC({ status: "failed" }));
};
