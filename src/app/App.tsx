import React, { useCallback, useEffect } from "react";
import "app/App.css";
import {
  AppBar,
  Button,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import { TodolistsList } from "features/TodolistsList/TodolistsList";
import { ErrorSnackbar } from "common/components/ErrorSnackbar/ErrorSnackbar";
import { useSelector } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import { Login } from "features/auth/Login";
import { logoutTC } from "features/auth/auth.reducer";
import { selectIsLoggedIn } from "features/auth/auth.selectors";
import { selectorIsInitialized, selectorStatus } from "app/app.selectors";
import { useAppDispatch } from "common/hooks/useAppDispatch";
import { initializeAppTC } from "app/app.reducer";

type PropsType = {
  demo?: boolean;
};

function App({ demo = false }: PropsType) {
  const status = useSelector(selectorStatus);
  const isInitialized = useSelector(selectorIsInitialized);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAppTC());
  }, []);

  const logoutHandler = useCallback(() => {
    dispatch(logoutTC());
  }, []);

  if (!isInitialized) {
    return (
      <div style={{ position: "fixed", top: "30%", textAlign: "center", width: "100%" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <ErrorSnackbar />
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <Menu />
            </IconButton>
            <Typography variant="h6">News</Typography>
            {isLoggedIn && (
              <Button color="inherit" onClick={logoutHandler}>
                Log out
              </Button>
            )}
          </Toolbar>
          {status === "loading" && <LinearProgress />}
        </AppBar>
        <Container fixed>
          <Route exact path={"/"} render={() => <TodolistsList demo={demo} />} />
          <Route path={"/login"} render={() => <Login />} />
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
