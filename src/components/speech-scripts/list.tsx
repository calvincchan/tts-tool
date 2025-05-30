"use client";

import { ISpeechScript } from "@/types/type";
import { DAYJS_FORMAT } from "@/utils/constants";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { EditButton, List, useDataGrid } from "@refinedev/mui";
import dayjs from "dayjs";
import React from "react";

function icon(name: string) {
  return (
    name === "Completed" ? "✅" :
      name === "In Progress" ? "🔄" :
        name === "Draft" ? "✏️" : ""
  );
}

export const SpeechScriptList = () => {
  const { dataGridProps } = useDataGrid<ISpeechScript>({
    sorters: {
      initial: [
        {
          field: "refno",
          order: "asc",
        },
      ],
    },
    pagination: {
      pageSize: 100,
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "refno",
        headerName: "Page ID",
        type: "number",
      },
      {
        field: "status",
        headerName: "Status",
        renderCell: ({ value }) => {
          return <>{icon(value)} {value}</>;
        },
        width: 160
      },
      {
        field: "ssml",
        headerName: "Content",
        minWidth: 400,
        flex: 1,
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        minWidth: 200,
        renderCell: function render({ value }) {
          return dayjs(value).format(DAYJS_FORMAT);
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        renderCell: function render({ row }) {
          return (
            <>
              <EditButton hideText recordItemId={row.id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
        minWidth: 80,
      },
    ],
    []
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} pageSizeOptions={[10, 25, 100]} />
    </List>
  );
};