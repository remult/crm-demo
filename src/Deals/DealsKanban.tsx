import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { DragDropContext, OnDragEndResponder } from "react-beautiful-dnd";
import { remult } from "../common";
import { Deal } from "./Deal.entity";
import { DealColumn } from "./DealColumn";
import { DealStages } from "./DealStage";

export const DealsKanban = () => {
    const [dealsForStage, setDeals] = useState<{ [key: string]: Deal[] }>();
    const loadDeals = useCallback(() => remult.repo(Deal).find({ orderBy: { index: "asc" } }).then(deals => {
        const newDealsForStage: typeof dealsForStage = DealStages.reduce((x, stage) => ({ ...x, [stage]: [] }), {});
        for (const d of deals) {
            if (newDealsForStage[d.stage])
                newDealsForStage[d.stage].push(d);
        }
        setDeals(newDealsForStage);

    }), [])
    useEffect(() => {
        loadDeals();
    }, [loadDeals]);
    const onDragEnd: OnDragEndResponder = async ({ source, destination, draggableId }) => {
        if (!destination)
            return;
        if (!dealsForStage)
            return;

        const stage = destination.droppableId;
        const onDealId = dealsForStage[destination.droppableId][destination.index]?.id;
        Deal.organizeLists({
            dealId: draggableId,
            stage,
            onDealId,
            origList: dealsForStage[source.droppableId],
            targetList: dealsForStage[stage]
        });
        setDeals(dealsForStage);
        await Deal.DealDropped(draggableId, stage, onDealId);
        await loadDeals()
    };
    if (!dealsForStage)
        return <>loading...</>;
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box display="flex">
                {DealStages.map(stage => (
                    <DealColumn
                        stage={stage}
                        deals={dealsForStage[stage]}
                        key={stage}
                    />
                ))}
            </Box>
        </DragDropContext>
    );
}

