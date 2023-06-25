import {
  createTaskArgType,
  RemoveTaskArgType,
  ResultCode,
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskArgType,
  UpdateTaskModelType,
} from "api/todolists-api";
import { Dispatch } from "redux";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice } from "@reduxjs/toolkit";
import { clearTasksAndTodolist } from "common/actions/common-actions";
import { appActions } from "app/app.reducer";
import { todolistsActions, todolistsThunks } from "features/TodolistsList/todolists.reducer";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";

const initialState: TasksStateType = {};

const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>(
  "tasks/removeTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;

    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      const res = await todolistsAPI.deleteTask(arg.todolistId, arg.taskId);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        return { taskId: arg.taskId, todolistId: arg.todolistId };
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

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  "tasks/fetchTasks",
  async (todolistId: string, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      const res = await todolistsAPI.getTasks(todolistId);
      const tasks = res.data.items;
      dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
      return { tasks: tasks, todolistId: todolistId }; // то что возвращает запрос, можно закинуть сразу в экстраредюсер, вместо создания дополнительного редюсера с дополнительным экшенкреэйтером
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);

const addTask = createAppAsyncThunk<{ task: TaskType }, createTaskArgType>("tasks/addTask", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;

  try {
    dispatch(appActions.setAppStatusAC({ status: "loading" }));
    const res = await todolistsAPI.createTask({ title: arg.title, todolistId: arg.todolistId });
    if (res.data.resultCode === 0) {
      const task = res.data.data.item;
      dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
      return { task };
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  }
});

export const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>(
  "tasks/updateTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI;

    try {
      dispatch(appActions.setAppStatusAC({ status: "loading" }));
      const state = getState();
      const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
      //TODO
      if (!task) {
        //throw new Error("task not found in the state");
        dispatch(appActions.setAppErrorAC({ error: "task not found in the state" }));
        return rejectWithValue(null);
      }
      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...arg.model,
      };

      const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel);

      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatusAC({ status: "succeeded" }));
        return { taskId: arg.taskId, model: arg.model, todolistId: arg.todolistId };
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

export const slice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(removeTask.fulfilled, (state, action) => {
        const index = state[action.payload.todolistId].findIndex((task) => task.id === action.payload.taskId);
        state[action.payload.todolistId].splice(index, 1);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state[action.payload.todolistId].findIndex((tasks) => tasks.id === action.payload.taskId);
        if (index !== -1) {
          state[action.payload.todolistId][index] = {
            ...state[action.payload.todolistId][index],
            ...action.payload.model,
          };
        }
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state[action.payload.task.todoListId].unshift(action.payload.task);
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.todolistId];
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.forEach((todo) => {
          state[todo.id] = [];
        });
      })
      .addCase(clearTasksAndTodolist, () => {
        return {};
      });
  },
});

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunk = { fetchTasks, addTask, updateTask, removeTask };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};
type ThunkDispatch = Dispatch;
