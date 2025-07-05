import { FieldError } from "react-hook-form";
import { TextField } from "@mui/material";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  inputProps,
}: InputFieldProps) => {
  return (
    <TextField
      label={label}
      type={type}
      defaultValue={defaultValue}
      fullWidth
      size="small"
      error={!!error}
      helperText={error?.message}
      {...(register ? register(name) : {})} // ← evita erro aqui
      {...inputProps}
    />
  );
};

export default InputField;
