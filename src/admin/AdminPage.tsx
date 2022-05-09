import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { EntityOrderBy, FieldMetadata, Paginator } from "remult";
import { remult } from "../common";
import { Contact } from "../Contacts/Contact.entity";





export const AdminPage = () => {
    const repo = remult.repo(Contact);
    const [items, setItems] = useState<Paginator<Contact>>();
    const [orderBy, setOrderBy] = useState<EntityOrderBy<Contact>>({});
    useEffect(() => {
        repo.query({ orderBy, pageSize: 25 }).paginator().then(setItems);
    }, [orderBy]);
    const HeaderCell: React.FC<{ field: FieldMetadata }> = ({ field }) => {
        const current = (orderBy as any)[field.key] as string | undefined;
        const handleClick = () => {
            setOrderBy({ [field.key]: current === "asc" ? "desc" : current === undefined ? "asc" : undefined });
        }
        return (<HeaderCellStyle onClick={handleClick}>{field.caption} {current === "asc" ? "\\/" : current === "desc" ? "/\\" : ""}</HeaderCellStyle>);
    }
    return (<div>
        <h4>{repo.metadata.caption}</h4>
        <TheTable style={{ maxHeight: 200 }}>
            <div className='Header'>
                {repo.metadata.fields.toArray().map(f => (<HeaderCell key={f.key} field={f} />))}
            </div>
            {items?.items.map(x => (<Line key={x.id}>{repo.metadata.fields.toArray().map(f => (<LineCell key={f.key}>{
                //@ts-ignore
                x[f.key].toString()
            }</LineCell>))}
                <LineCell style={{ position: 'sticky', right: 0, width: 'auto' }}><button>test</button></LineCell>
            </Line>))}
        </TheTable>
        <button disabled={!items?.hasNextPage} onClick={() => items?.nextPage().then(setItems)}>Next Page</button>
    </div>)
}


const Line = styled.div`
    white-space: nowrap;
`;

const HeaderCellStyle = styled.div`
display:inline-block;
width:400px
`;

const LineCell = styled.div`
display:inline-block;
width:400px
`;

const TheTable = styled.div`
overflow-x:auto;
overflow-y:auto;
.Header{
    white-space: nowrap;
    position:sticky;
    top:0;
    background-color:white;
    width:fit-content
}

`;