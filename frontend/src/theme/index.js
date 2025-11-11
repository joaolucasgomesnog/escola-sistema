// theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontSize: 12,
    fontFamily: ['"Inter"', '"Roboto"', '"Helvetica"', '"Arial"', "sans-serif"].join(","),
    h1: { fontSize: "2rem", fontWeight: 600 },
    h2: { fontSize: "1.75rem", fontWeight: 600 },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.75rem" },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "0.875rem", // ajuste global do font-size dos inputs
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // pequeno ajuste para height/padding quando size="small"
          "&.MuiOutlinedInput-sizeSmall .MuiOutlinedInput-input": {
            padding: "6px 10px",
          },
        },
        input: {
          fontSize: "0.875rem", // garante a fonte
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem", // label menor
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: "0.7rem",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "0.875rem",
        },
      },
    },
  },
});
