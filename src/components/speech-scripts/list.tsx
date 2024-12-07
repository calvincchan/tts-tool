"use client";

import { ISpeechScript } from "@interfaces/type";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DateField, EditButton, List, useDataGrid } from "@refinedev/mui";
import { DAYJS_FORMAT } from "@utils/constants";
import React from "react";

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
      },
      {
        field: "revision",
        headerName: "Revision",
        type: "number",
      },
      {
        field: "original",
        headerName: "Original",
        minWidth: 400,
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        minWidth: 200,
        renderCell: function render({ value }) {
          return <DateField value={value} format={DAYJS_FORMAT} />;
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
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
};
