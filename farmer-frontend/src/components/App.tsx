import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@material-ui/core";
import { useMemo } from "react";
import { Web3ContextProvider } from "../hooks/web3Context";
import { Farmer } from "./Farmer";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  console.log(prefersDarkMode);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: { main: "#6d8cfc" },
        },
        typography: {
          fontFamily: "VT323",
          body1: {
            fontSize: "1.2rem",
          },
          button: {
            fontSize: "1.2rem",
          },
        },
      }),
    [prefersDarkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <Farmer />
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
