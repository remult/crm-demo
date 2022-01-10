import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { remult } from "../common";
import { Company } from "./Company.entity";

export const CompanyShow: React.FC<{}> = () => {
    let params = useParams();
    const [company, setCompany] = useState<Company>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        remult.repo(Company).findId(params.id!).then(company => {
            setCompany(company);
            setLoading(false)
        });
    }, [params.id]);
    if (loading)
        return <span>Loading</span>;
    if (!company)
        return <span>not found</span>;
    return <Card>
        <CardContent>
            <Stack direction="row">
                <img src={company.logo} style={{ maxWidth: '100px' }} />
                <Stack sx={{ ml: 1 }} alignItems='flex-start'>
                    <Typography variant="h5">
                        {company.name}
                    </Typography>
                    <Typography variant="body2">
                        {company.sector}, {company.size?.caption}
                    </Typography>
                </Stack>
            </Stack>
        </CardContent>
    </Card>
}

