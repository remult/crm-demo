import * as React from 'react';
import { Box, Typography, Divider, Link, Button } from '@mui/material';
import { Company } from './Company.entity';
import EditIcon from '@mui/icons-material/Edit';

export const CompanyAside = ({
    company,
    link = 'edit',
}: {
    company?: Company;
    link?: string;
}) =>
    company ? (
        <Box ml={4} width={250} minWidth={250}>
            <Box textAlign="center" mb={2}>
                {link === 'edit' ? (
                    <Button startIcon={<EditIcon/>}>Edit Company</Button>
                ) : (
                    <Button>Show Company</Button>
                )}
            </Box>

            <Typography variant="subtitle2">Company info</Typography>
            <Divider />

            <Box mt={2}>
                Website: <Link href={company.website}>{company.website}</Link>
                <br />
                LinkedIn: <Link href={company.linkedIn}>LinkedIn</Link>
            </Box>

            <Box mt={1}>
                {company.phoneNumber}{' '}

                <Typography
                    variant="body1"
                    color="textSecondary"
                    component="span"
                >
                    Main
                </Typography>
            </Box>

            <Box mt={1} mb={3}>
                {company.address}
                <br />
                {company.city} {company.zipcode}{' '}
                {company.stateAbbr}
            </Box>

            <Typography variant="subtitle2">Background</Typography>
            <Divider />

            <Box mt={1}>
                <Typography
                    variant="body1"
                    color="textSecondary"
                    component="span"
                >
                    Added on{' '}
                    {new Date(company.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </Typography>
                <br />
                <Typography
                    component="span"
                    variant="body1"
                    color="textSecondary"
                >
                    Followed by
                </Typography>{' '}

                <Link href="#">
                    {company.accountManager ? `${company.accountManager.firstName} ${company.accountManager.lastName}` : ''}
                </Link>
            </Box>
        </Box>
    ) : null;