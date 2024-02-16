// TxTable.tsx

import React from 'react';
import {
  Column,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

interface Row {
  id: number;
  title: string;
}

const TxTable: React.FC = () => {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        header: 'ID',
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: 'id',
            header: ({ table }) => (
              <>
                {/* Your header content here */}
                {table.getIsAllRowsSelected() ? 'All Selected' : 'None Selected'}
              </>
            ),
            cell: ({ row, getValue }) => (
              <div>
                {/* Your cell content here */}
                {getValue()}
              </div>
            ),
            footer: (props) => props.column.id,
          },
        ],
      },
      {
        header: 'Title',
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: 'title',
            header: () => 'Title',
            cell: ({ row, getValue }) => (
              <div>
                {/* Your cell content here */}
                {getValue()}
              </div>
            ),
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
    []
  );

  const rows: Row[] = [
    { id: 0, title: 'Example' },
    { id: 1, title: 'Demo' },
    { id: 1, title: 'Test' },
  ];

  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  });

  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanFilter() ? (
                        <div>
                          {/* You can add Filter component here if needed */}
                        </div>
                      ) : null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TxTable;
