// UNUSED, refer to dataTable.tsx

"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Tissue = {
  id: string
  numSamples: number
  tissueName: string
}

export const columns: ColumnDef<Tissue>[] = [
  {
    accessorKey: "tissueName",
    header: "Tissue",
  },
  {
    accessorKey: "numSamples",
    header: "Number of Samples",
  },
]
