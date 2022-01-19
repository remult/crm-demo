import { Box } from "@mui/material";
import React from "react";
import { Status } from "./Status";

export const StatusIndicator:React.FC<{status:Status}> = ({status})=>{
    return (<Box
        width={10}
        height={10}
        display="inline-block"
        borderRadius={5}
        bgcolor={status.color}
        component="span"
    />)
}