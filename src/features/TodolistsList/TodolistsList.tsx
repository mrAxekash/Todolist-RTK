import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { FilterValuesType, todolistsActions, todolistsThunks } from "features/TodolistsList/todolists.reducer";
import { tasksThunk } from "features/TodolistsList/tasks.reducer";
import { Grid, Paper } from "@material-ui/core";
import { Todolist } from "./Todolist/Todolist";
import { Redirect } from "react-router-dom";
import { selectIsLoggedIn } from "features/auth/auth.selectors";
import { selectorTodolists } from "features/TodolistsList/todolists.selectors";
import { selectorTasks } from "features/TodolistsList/tasks.selectors";
import { useAppDispatch } from "common/hooks/useAppDispatch";
import { AddItemForm } from "common/components";
import { TaskStatuses } from "common/enums";

type PropsType = {
  demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector(selectorTodolists);
  const tasks = useSelector(selectorTasks);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    const thunk = todolistsThunks.fetchTodolists();
    dispatch(thunk);
  }, []);

  const removeTask = useCallback(function (id: string, todolistId: string) {
    const thunk = tasksThunk.removeTask({ taskId: id, todolistId });
    dispatch(thunk);
  }, []);

  const addTask = useCallback(function (title: string, todolistId: string) {
    dispatch(tasksThunk.addTask({ title, todolistId }));
  }, []);

  const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
    dispatch(tasksThunk.updateTask({ taskId: id, model: { status }, todolistId }));
  }, []);

  const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
    dispatch(tasksThunk.updateTask({ taskId: id, model: { title: newTitle }, todolistId }));
  }, []);

  const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
    const action = todolistsActions.changeTodolistFilterAC({ id: todolistId, filter: value });
    dispatch(action);
  }, []);

  const removeTodolist = useCallback(function (id: string) {
    const thunk = todolistsThunks.removeTodolist({ todolistId: id });
    dispatch(thunk);
  }, []);

  const changeTodolistTitle = useCallback(function (id: string, title: string) {
    const thunk = todolistsThunks.changeTodolistTitle({ todolistId: id, title });
    dispatch(thunk);
  }, []);

  const addTodolist = useCallback(
    (title: string) => {
      const thunk = todolistsThunks.addTodolist({ title });
      dispatch(thunk);
    },
    [dispatch]
  );

  if (!isLoggedIn) {
    return <Redirect to={"/login"} />;
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolist} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id];

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitle}
                  demo={demo}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
