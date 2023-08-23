import { Card, Typography } from '@mui/material'
import * as React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Deal } from './Deal.entity'
import { InstanceTypeWithRelations } from '../dev-remult/relations'

export const DealCard = ({
  deal,
  index
}: {
  deal: InstanceTypeWithRelations<
    typeof Deal,
    {
      company2: true
    }
  >
  index: number
}) => {
  if (!deal) return null

  const handleClick = () => {}
  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={handleClick}
        >
          <Card
            sx={{ m: 1, p: 1 }}
            style={{
              opacity: snapshot.isDragging ? 0.9 : 1,
              transform: snapshot.isDragging ? 'rotate(-2deg)' : ''
            }}
            elevation={snapshot.isDragging ? 3 : 1}
          >
            <div>
              {deal.company2.name}
              <div>
                <Typography variant="body2" gutterBottom>
                  {deal.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {deal.amount.toLocaleString('en-US', {
                    notation: 'compact',
                    style: 'currency',
                    currency: 'USD',
                    currencyDisplay: 'narrowSymbol',
                    minimumSignificantDigits: 3
                  })}
                  , {deal.type}
                </Typography>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
