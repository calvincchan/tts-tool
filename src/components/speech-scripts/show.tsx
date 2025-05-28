"use client";

import { DAYJS_FORMAT } from "@/utils/constants";
import { Stack, Typography } from "@mui/material";
import { useShow } from "@refinedev/core";
import { MarkdownField, Show } from "@refinedev/mui";
import dayjs from "dayjs";

export const SpeechScriptShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1">
          Status: {record?.status || "--"}
        </Typography>
        <Typography variant="body1">
          Created At: {dayjs(record?.created_at).format(DAYJS_FORMAT)}
        </Typography>
        <Typography variant="body1">
          Updated At: {dayjs(record?.updated_at).format(DAYJS_FORMAT)}
        </Typography>
        <Typography variant="body1">Ref No: {record?.refno ?? ""}</Typography>
        <Typography variant="body1">
          Revision: {record?.revision ?? ""}
        </Typography>
        <Typography variant="body1">Content</Typography>
        <MarkdownField value={record?.content} />
        <Typography variant="body1">Original</Typography>
        <MarkdownField value={record?.original} />
      </Stack>
    </Show>
  );
};
