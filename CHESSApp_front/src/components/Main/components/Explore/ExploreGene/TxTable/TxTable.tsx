import React, { HTMLAttributes, HTMLProps } from 'react'
import ReactDOM from 'react-dom/client'
import { Table as BTable } from 'react-bootstrap'
import * as d3 from 'd3'

import 'bootstrap/dist/css/bootstrap.min.css'
import './TxTable.css'

import {
    Column,
    Table,
    ExpandedState,
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    ColumnDef,
    flexRender,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'

const D3Rectangle: React.FC = () => {
    const containerRef = React.useRef<SVGSVGElement | null>(null);

    React.useEffect(() => {
        // Use D3 to draw a simple rectangle
        const svg = d3.select(containerRef.current);
        svg
            .append('rect')
            .attr('width', 50)
            .attr('height', 20)
            .attr('fill', 'blue');
    }, []);

    return <svg ref={containerRef} width={50} height={20} />;
};

function TxTable() {
    const rerender = React.useReducer(() => ({}), {})[1]

    const columns = React.useMemo<ColumnDef<Person>[]>(
        () => [
            {
                accessorKey: 'tid',
                pin: 'left',
                header: ({ table }) => (
                    <div className="sticky">
                        <IndeterminateCheckbox
                            {...{
                                checked: table.getIsAllRowsSelected(),
                                indeterminate: table.getIsSomeRowsSelected(),
                                onChange: table.getToggleAllRowsSelectedHandler(),
                            }}
                        />{' '}
                        <button
                            {...{
                                onClick: table.getToggleAllRowsExpandedHandler(),
                            }}
                        >
                            {table.getIsAllRowsExpanded() ? '🞃' : '🞂'}
                        </button>{' '}
                        Transcript ID
                    </div>
                ),
                cell: ({ row, getValue }) => (
                    <div className="sticky"
                        style={{
                            // Since rows are flattened by default,
                            // we can use the row.depth property
                            // and paddingLeft to visually indicate the depth
                            // of the row
                            paddingLeft: `${row.depth * 2}rem`,
                        }}
                    >
                        <>
                            <IndeterminateCheckbox
                                {...{
                                    checked: row.getIsSelected(),
                                    indeterminate: row.getIsSomeSelected(),
                                    onChange: row.getToggleSelectedHandler(),
                                }}
                            />{' '}
                            {row.getCanExpand() ? (
                                <button
                                    {...{
                                        onClick: row.getToggleExpandedHandler(),
                                        style: { cursor: 'pointer' },
                                    }}
                                >
                                    {row.getIsExpanded() ? '🞃' : '🞂'}
                                </button>
                            ) : (
                                ''
                            )}{' '}
                            {getValue()}
                        </>
                    </div>
                ),
                meta: {
                    className: 'sticky',
                }
            },
            {
                accessorFn: row => row.lastName,
                id: 'lastName',
                cell: info => info.getValue(),
                header: () => <span>Last Name</span>,
            },
            {
                accessorKey: 'visits',
                header: () => <span>Visits</span>,
            },
            {
                accessorKey: 'rand1',
                header: 'Random 1',
            },
            {
                accessorKey: 'rand2',
                header: 'Random 2',
            },
            {
                accessorKey: 'rand3',
                header: 'Random 3',
            },
            {
                accessorKey: 'rand4',
                header: 'Random 4',
            },
            {
                accessorKey: 'rand5',
                header: 'Random 5',
            },
            {
                accessorKey: 'rand6',
                header: 'Random 6',
            },
            {
                accessorKey: 'rand7',
                header: 'Random 7',
            },
            {
                accessorKey: 'rand8',
                header: 'Random 8',
            },
            {
                accessorKey: 'rand9',
                header: 'Random 9',
            },
            {
                accessorKey: 'rand10',
                header: 'Random 10',
            },
            {
                accessorKey: 'rand11',
                header: 'Random 11',
            },
            {
                accessorKey: 'status',
                header: 'Status',
            },
            {
                accessorKey: 'progress',
                pin: 'right',
                header: 'Transcript',
                cell: ({ row, getValue }) => (
                    <div>
                        <D3Rectangle />
                    </div>
                ),
            },
        ],
        []
    )

    const [data, setData] = React.useState(() => makeData(15,5))

    const [expanded, setExpanded] = React.useState<ExpandedState>({})
    const [columnPinning, setColumnPinning] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
            columnPinning,
        },
        onExpandedChange: setExpanded,
        onColumnPinningChange: setColumnPinning,
        getSubRows: row => row.subRows,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        debugTable: true,
    })

    console.log(data)
    console.log(columns)

    return (
        <div className="p-2">
            <div className="h-2" />
            <BTable striped bordered hover responsive size="sm">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                return (
                                    <th
                                    // <th style={["tid"].includes(header.id) ? { left:  header.getStart('left'), position: 'sticky', top: 0 } : {}}
                                        key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </div>
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </BTable>
        </div>
    )
}

function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = React.useRef<HTMLInputElement>(null!)

    React.useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate])

    return (
        <input
            type="checkbox"
            ref={ref}
            className={className + ' cursor-pointer'}
            {...rest}
        />
    )
}

export default TxTable;