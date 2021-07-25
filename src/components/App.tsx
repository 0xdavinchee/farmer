import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@material-ui/core";
import "../App.css";
import { useMemo } from "react";
import { Farmer } from "./Farmer";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: { main: "#6d8cfc" },
        },
      }),
    [prefersDarkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <div className="App">
          <Farmer />
        </div>
      </Container>
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
