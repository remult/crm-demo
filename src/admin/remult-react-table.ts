import { useEffect, useMemo, useState } from "react";
import { Column, Filters } from "react-table";
import { ContainsStringValueFilter, Repository } from "remult";

export function useRemultReactTable<entityType extends object>(
    repo: Repository<entityType>) {
    const [data, setData] = useState<entityType[]>(() => [])
    const [filters, setFilters] = useState([] as Filters<entityType>);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let where: any = {};
        for (const f of filters) {
            where[f.id] = {
                $contains: f.value
            } as ContainsStringValueFilter
        }
        (async () => {
            setLoading(true);
            try {
                setData(await repo.find({ where }));
            }
            finally {
                setLoading(false);
            }
        })();
    }, [filters]);
    const columns = useMemo(
        () =>
            repo.metadata.fields.toArray().map(f => ({
                Header: f.caption,
                accessor: (row: entityType) => {
                    //@ts-ignore
                    const val = row[f.key];
                    let result = val;
                    if (f.options.displayValue)
                        result = f.options.displayValue(row, val);
                    else if (f.valueConverter.displayValue)
                        result = f.valueConverter.displayValue(val);
                    if (typeof result === "string")
                        return result;
                    if (result)
                        return result.toString();

                },
                id: f.key

            } as Column<entityType>))
        ,
        []
    );
    return {
        data, columns, setFilters, manualFilters: true, initialState: {
            filters
        }
    }
}