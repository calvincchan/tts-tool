"use client";

import { ISpeechScript } from "@interfaces/type";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { DAYJS_FORMAT } from "@utils/constants";
import dayjs from "dayjs";
import Markdown from "markdown-to-jsx";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another
import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";

export const SpeechScriptEdit = () => {
  const {
    saveButtonProps,
    refineCore: { query, formLoading },
    register,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<ISpeechScript>({
    refineCoreProps: {
      autoSave: {
        enabled: true,
      },
    },
  });

  const record = query?.data?.data;

  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (record) {
      setContent(record.content);
    }
  }, [record]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      {formLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column" }}
            autoComplete="off"
          >
            <Typography variant="body1">
              Status: {record?.status || "--"}
            </Typography>
            <Typography variant="body1">
              Page: {record?.refno || "--"}
            </Typography>
            <Typography variant="body1">
              Revision: {record?.revision || "--"}
            </Typography>
            <Paper
              variant="outlined"
              sx={{ borderColor: "primary.main", mt: 4 }}
            >
              <Editor
                value={content}
                onValueChange={(value) => {
                  setContent(value);
                  setValue("content", value);
                }}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages.ssml, "ssml")
                }
                padding={10}
                placeholder="Type some SSML here..."
              />
            </Paper>
            <Typography variant="body2" mt={4}>
              Original
            </Typography>
            <Markdown style={{ color: "text.secondary" }}>
              {record?.original || "--"}
            </Markdown>{" "}
          </Box>
          <Box>
            <Typography variant="body2">
              Updated At: {dayjs(record?.updated_at).format(DAYJS_FORMAT)}
            </Typography>
            <Typography variant="body2">
              Created At: {dayjs(record?.created_at).format(DAYJS_FORMAT)}
            </Typography>
          </Box>
        </>
      )}
    </Edit>
  );
};
