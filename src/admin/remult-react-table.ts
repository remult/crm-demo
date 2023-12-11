import { useEffect, useMemo, useRef, useState } from 'react'
import { Column, Filters, SortingRule, TableState } from 'react-table'
import { ContainsStringValueFilter, Repository } from 'remult'

export function useRemultReactTable<entityType extends object>(
  repo: Repository<entityType>
) {
  const [data, setData] = useState<entityType[]>(() => [])
  const [count, setCount] = useState(0)
  const [filters, setFilters] = useState([] as Filters<entityType>)
  const [sort, setSort] = useState([] as Array<SortingRule<entityType>>)
  const [loading, setLoading] = useState(false)
  const fetchIdRef = useRef(0)
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  useEffect(() => {
    let where: any = {}
    let orderBy: any = {}

    for (const f of filters) {
      where[f.id] = {
        $contains: f.value
      } as ContainsStringValueFilter
    }
    for (const s of sort) {
      orderBy[s.id] = s.desc ? 'desc' : 'asc'
    }
    ;(async () => {
      const fetchId = ++fetchIdRef.current
      setLoading(true)
      try {
        const [rows, count] = await Promise.all([
          repo.find({
            where,
            orderBy,
            limit,
            page
          }),
          repo.count(where)
        ])
        if (fetchId === fetchIdRef.current) {
          setData(rows)
          setPageCount(Math.ceil(count / limit))
          setCount(count)
        }
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false)
        }
      }
    })()
  }, [filters, sort, limit, page, repo])
  const { columns, fields } = useMemo(() => {
    let fields: any = {}
    const columns = repo.metadata.fields.toArray().map(
      (f) =>
        (fields[f.key] = {
          Header: f.caption,
          accessor: (row: entityType) => {
            //@ts-ignore
            const val = row[f.key]
            let result = val
            if (f.options.displayValue)
              result = f.options.displayValue(row, val)
            else if (f.valueConverter.displayValue)
              result = f.valueConverter.displayValue(val)
            if (typeof result === 'string') return result
            if (result) return result.toString()
          },
          id: f.key
        } as Column<entityType>)
    )
    return { fields, columns }
  }, [repo.metadata.fields])
  return {
    data,
    columns,
    manualFilters: true,
    initialState: {
      filters,
      pageSize: 10,
      pageIndex: 0
    },
    stateReducer: (state: TableState<entityType>) => {
      if (state.filters !== filters) setFilters(state.filters)
      if (state.pageIndex !== page - 1) setPage(state.pageIndex + 1)
      if (state.pageSize !== limit) setLimit(state.pageSize)
      if (state.sortBy !== sort) setSort(state.sortBy)
      return state
    },
    loading,
    count,
    manualPagination: true,
    pageCount,
    manualSortBy: true,
    fields
  }
}

export declare type ReactDataFieldsAsColumns<entityType extends object> = {
  [Properties in keyof Partial<entityType>]?: Column<entityType>
}
