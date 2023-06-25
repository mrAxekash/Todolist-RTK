import { RemoveTodolistArgType, ResultCode, todolistsAPI, TodolistType } from "api/todolists-api";
import { appActions, RequestStatusType } from "app/app.reducer";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolist } from "common/actions/common-actions";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";

const initialState: Array<TodolistDomainType> = [];

//thunks

const changeTodolistTitle = createAppAsyncThunk<{ id: string; title: string }, { todolistId: string; title: string }>(
  "todolist/changeTodolistTitle",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      const res = await todolistsAPI.updateTodolist(arg.todolistId, arg.title);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        return { id: arg.todolistId, title: arg.title };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }>(
  "todolist/fetchTodolists",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;

    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      const res = await todolistsAPI.getTodolists();
      if (res.data) {
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        return { todolists: res.data };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, { title: string }>(
  "todolist/addTodolist",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;

    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      const res = await todolistsAPI.createTodolist(arg.title);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        return { todolist: res.data.data.item };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);

const removeTodolist = createAppAsyncThunk<RemoveTodolistArgType, RemoveTodolistArgType>(
  "todolist/removeTodolist",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;

    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      dispatch(todolistsActions.changeTodolistEntityStatusAC({ id: arg.todolistId, status: "loading" }));
      const res = await todolistsAPI.deleteTodolist(arg.todolistId);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        return { todolistId: arg.todolistId };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);

//reducers

const slice = createSlice({
  name: "todolist",
  initialState: initialState,
  reducers: {
    changeTodolistFilterAC: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const index = state.findIndex((todolist) => todolist.id === action.payload.id);
      state[index].filter = action.payload.filter;
    },
    changeTodolistEntityStatusAC: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
      const index = state.findIndex((todolist) => todolist.id === action.payload.id);
      state[index].entityStatus = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearTasksAndTodolist, () => {
        return [];
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.todolistId);
        if (index !== -1) {
          state.splice(index, 1);
        }
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, entityStatus: "idle", filter: "all" });
      })
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map((todo) => ({ ...todo, filter: "all", entityStatus: "idle" }));
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id);
        if (index !== -1) state[index].title = action.payload.title;
      });
  },
});

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistsThunks = { removeTodolist, addTodolist, fetchTodolists, changeTodolistTitle };

// types

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
