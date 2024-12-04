"use client";
import { Box, TextField } from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";

export const SpeechScriptCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm();

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        {/*
                    DatePicker component is not included in "@refinedev/mui" package.
                    To use a <DatePicker> component, you can follow the official documentation for Material UI.

                    Docs: https://mui.com/x/react-date-pickers/date-picker/#basic-usage
                */}
        <TextField
          {...register("created_at", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.created_at}
          helperText={(errors as any)?.created_at?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          label="Created At"
          name="created_at"
        />

        {/*
                    DatePicker component is not included in "@refinedev/mui" package.
                    To use a <DatePicker> component, you can follow the official documentation for Material UI.

                    Docs: https://mui.com/x/react-date-pickers/date-picker/#basic-usage
                */}
        <TextField
          {...register("updated_at", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.updated_at}
          helperText={(errors as any)?.updated_at?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          label="Updated At"
          name="updated_at"
        />
        <TextField
          {...register("refno", {
            required: "This field is required",
            valueAsNumber: true,
          })}
          error={!!(errors as any)?.refno}
          helperText={(errors as any)?.refno?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="number"
          label="Refno"
          name="refno"
        />
        <TextField
          {...register("revision", {
            required: "This field is required",
            valueAsNumber: true,
          })}
          error={!!(errors as any)?.revision}
          helperText={(errors as any)?.revision?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="number"
          label="Revision"
          name="revision"
        />
        <TextField
          {...register("content", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.content}
          helperText={(errors as any)?.content?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label="Content"
          name="content"
        />
        <TextField
          {...register("original", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.original}
          helperText={(errors as any)?.original?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          multiline
          label="Original"
          name="original"
        />
      </Box>
    </Create>
  );
};
