import React, { useEffect } from "react";
import { ContainsStringValueFilter } from "remult";

import { Column, Filters, TableOptions } from "react-table";

import styled from "@emotion/styled";
import { useTable, useFilters } from "react-table";
import { remult } from "../common";

import { Company } from "../Companies/Company.entity";
import { useRemultReactTable } from "./remult-react-table";



const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter }
}: {
    column: {
        filterValue: any,
        preFilteredRows: any,
        setFilter: any
    }
}) {
    return (
        <input
            value={filterValue || ""}
            onChange={e => {
                setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
        />
    );
}
function Table<D extends object>({ options }: {
    options: TableOptions<D>
}) {
    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state
    } = useTable(
        {
            ...options,defaultColumn // Be sure to pass the defaultColumn option
           
        },
        useFilters // useFilters!
    );



    // We don't want to render all of the rows for this example, so cap
    // it for this use case


    return (
        <>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render("Header")}
                                    Render the columns filter UI
                                    <div>{column.canFilter ? column.render("Filter") : null}</div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div>
                <pre>
                    <code>

                    </code>
                </pre>
            </div>
        </>
    );
}


const repo = remult.repo(Company);

let f = repo.metadata.fields;
// SEE TABLE FOR NEW STUFF!
// App just contains boilderplate

export default function ReactTableDemo() {


    const { data, columns,setFilters } = useRemultReactTable(repo);





    return (
        <Styles>
            <Table
                options={{
                    columns, data,setFilters
                }}
            />
        </Styles>
    );
}
