"use client";

import { Stack, Typography } from "@mui/material";
import { useShow } from "@refinedev/core";
import { DateField, MarkdownField, NumberField, Show } from "@refinedev/mui";

export const SpeechScriptShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          Status: {record?.status || "--"}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          Created At
        </Typography>
        <DateField value={record?.created_at} />
        <Typography variant="body1" fontWeight="bold">
          Updated At
        </Typography>
        <DateField value={record?.updated_at} />
        <Typography variant="body1" fontWeight="bold">
          Refno
        </Typography>
        <NumberField value={record?.refno ?? ""} />
        <Typography variant="body1" fontWeight="bold">
          Revision
        </Typography>
        <NumberField value={record?.revision ?? ""} />
        <Typography variant="body1" fontWeight="bold">
          Content
        </Typography>
        <MarkdownField value={record?.content} />
        <Typography variant="body1" fontWeight="bold">
          Original
        </Typography>
        <MarkdownField value={record?.original} />
      </Stack>
    </Show>
  );
};
