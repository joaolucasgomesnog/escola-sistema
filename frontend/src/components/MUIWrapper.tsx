"use client";

import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material";
import { useThemeContext } from "../contexts/ThemeContext";
// import { useThemeContext } from "@/context/ThemeContext";

export function MUIWrapper({ children } : {children : any}) {
  const { theme } = useThemeContext();

  const muiTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  return <MUIThemeProvider theme={muiTheme}>{children}</MUIThemeProvider>;
}
