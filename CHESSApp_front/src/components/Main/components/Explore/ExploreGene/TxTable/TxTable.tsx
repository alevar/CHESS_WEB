import React, { HTMLAttributes, HTMLProps } from 'react'
import ReactDOM from 'react-dom/client'
import { Table as BTable } from 'react-bootstrap'
import * as d3 from 'd3'

import SashimiPlot from '../SashimiPlot/SashimiPlot'
import { TX, Locus } from '../../../../../../utils/utils';

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

interface TxTableProps {
    locus: Locus,
    onTxClick: (tx: TX) => void;
}

const TxTable: React.FC<TxTableProps> = ({ locus, onTxClick }) => {
    const rerender = React.useReducer(() => ({}), {})[1]

    const columns = React.useMemo<ColumnDef<TX>[]>(
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
                        <SashimiPlot locus={locus} dimensions={{
                                                        width: 1000,
                                                        height: 25,
                                                        arrowSize: 10,
                                                        arrowSpacing: 50,
                                                    }} tx={row.original} />
                    </div>
                ),
            },
        ],
        []
    )

    const [data, setData] = React.useState(() => locus.txs)

    console.log(data)

    const [expanded, setExpanded] = React.useState<ExpandedState>({})

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: row => row.txs,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        debugTable: true,
    })

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
                            <tr key={row.id}
                                onClick={() => onTxClick(row.original)}>
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