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
import { get } from '3dmol'

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

interface TxTableProps {
    locusID: number,
}

const TxTable: React.FC<TxTableProps> = ({ locusID }) => {
    const rerender = React.useReducer(() => ({}), {})[1]

    const columns = React.useMemo<ColumnDef<Person>[]>(
        () => [
            {
                accessorKey: 'tid',
                header: ({ table }) => (
                    <div>
                        <IndeterminateCheckbox
                            {...{
                                checked: table.getIsAllRowsSelected(),
                                indeterminate: table.getIsSomeRowsSelected(),
                                onChange: table.getToggleAllRowsSelectedHandler(),
                            }}
                        />{' '}
                        <button
                            className={table.getIsAllRowsExpanded() ? 'chevron down' : 'chevron right'}
                            onClick={table.getToggleAllRowsExpandedHandler()}
                        />
                        Transcript ID
                    </div>

                ),
                cell: ({ row, getValue }) => (
                    <div
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
                                    className={row.getIsExpanded() ? 'chevron down' : 'chevron right'}
                                    onClick={row.getToggleExpandedHandler()}
                                />
                            ) : (
                                ''
                            )}{' '}
                            {getValue()}
                        </>
                    </div>
                ),
            },
            {
                accessorKey: 'gene_id',
                header: 'Gene ID',
            },
            {
                accessorKey: 'transcript',
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

    const [data, setData] = React.useState(() => makeData(15, 5))

    const [expanded, setExpanded] = React.useState<ExpandedState>({})

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: row => row.subRows,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        debugTable: true,
    })

    console.log(data)

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