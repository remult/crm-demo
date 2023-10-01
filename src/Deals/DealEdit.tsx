import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Deal, DealContact } from './Deal.entity'
import { remult, repo } from 'remult'
import { ErrorInfo } from 'remult'

import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { Company } from '../Companies/Company.entity'
import { DealTypes } from './DealType'
import { DealStages } from './DealStage'
import { Contact } from '../Contacts/Contact.entity'

const dealRepo = remult.repo(Deal)

interface IProps {
  deal: Deal
  onClose: () => void
  onSaved: (deal: Deal) => void
}

export const DealEdit: React.FC<IProps> = ({ deal, onSaved, onClose }) => {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>(
    deal.accountManager ? [deal.accountManager] : []
  )
  const [companies, setCompanies] = useState<Company[]>(
    deal.company ? [deal.company] : []
  )
  const [companyContacts, setCompanyContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  useEffect(() => {
    remult.repo(AccountManager).find().then(setAccountManagers)
    if (deal.id)
      repo(Deal)
        .relations(deal)
        .contacts.find({
          include: {
            contact: true
          }
        })
        .then((dc) => {
          const contacts = dc.filter((dc) => dc.contact).map((dc) => dc.contact)
          if (companyContacts.length === 0) setCompanyContacts(contacts)
          setSelectedContacts(contacts)
        })
  }, [companyContacts.length, deal])
  const [companySearch, setCompanySearch] = useState('')
  useEffect(() => {
    repo(Company)
      .find({ where: { name: { $contains: companySearch } }, limit: 20 })
      .then((x) => setCompanies(x))
  }, [companySearch])

  const [state, setState] = useState(deal)

  useEffect(() => {
    repo(Contact)
      .find({ where: { company: [state.company] } })
      .then(setCompanyContacts)
    setSelectedContacts([
      ...selectedContacts.filter((sc) => sc.company?.id === state.company?.id)
    ])
  }, [state.company])

  const [errors, setErrors] = useState<ErrorInfo<Deal>>()
  const handleClose = () => {
    onClose()
  }
  const handleSave = async () => {
    const ref = dealRepo.getEntityRef(deal)
    try {
      setErrors(undefined)
      deal = Object.assign(deal, state)
      await deal.saveWithContacts!(selectedContacts.map((c) => c.id!))
      onSaved(deal)
      handleClose()
    } catch (err: any) {
      setErrors(err)
      ref.undoChanges()
    }
  }

  return (
    <div>
      <Dialog open={Boolean(deal)} onClose={handleClose}>
        <DialogTitle>{!deal.id ? 'Create ' : 'Update '} Deal</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1 }} noValidate autoComplete="off">
            <Stack spacing={2}>
              <TextField
                autoFocus
                label="Deal name"
                error={Boolean(errors?.modelState?.name)}
                helperText={errors?.modelState?.name}
                fullWidth
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
              <TextField
                label="Description"
                multiline
                error={Boolean(errors?.modelState?.description)}
                helperText={errors?.modelState?.description}
                fullWidth
                value={state.description}
                onChange={(e) =>
                  setState({ ...state, description: e.target.value })
                }
              />
              <FormControl
                sx={{ flexGrow: 1 }}
                error={Boolean(errors?.modelState?.accountManager)}
              >
                <Autocomplete
                  disablePortal
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  id="combo-box-demo"
                  getOptionLabel={(c) => c.name}
                  options={companies}
                  value={state.company ? state.company : null}
                  inputValue={companySearch}
                  onChange={(e, newValue: Company | null) =>
                    setState({ ...state, company: newValue ? newValue : null! })
                  }
                  onInputChange={(e, newInput) => setCompanySearch(newInput)}
                  renderInput={(params) => (
                    <TextField {...params} label="Company" />
                  )}
                />
                <FormHelperText>{errors?.modelState?.company}</FormHelperText>
              </FormControl>
              <FormControl sx={{ flexGrow: 1 }}>
                <Autocomplete
                  disablePortal
                  multiple
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  id="combo-box-demo"
                  getOptionLabel={(c) => c.firstName + ' ' + c.lastName}
                  options={companyContacts}
                  value={selectedContacts}
                  onChange={(e, newValue: Contact[] | null) =>
                    setSelectedContacts(newValue ? newValue : [])
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Contacts" />
                  )}
                />
              </FormControl>
              <Stack direction="row" spacing={2}>
                <FormControl
                  sx={{ flexGrow: 1 }}
                  error={Boolean(errors?.modelState?.stage)}
                >
                  <InputLabel id="stage-label">Stage</InputLabel>
                  <Select
                    labelId="stage-label"
                    label="Stage"
                    value={state.stage}
                    onChange={(e) =>
                      setState({ ...state, stage: e.target.value })
                    }
                  >
                    <MenuItem value={''}>None</MenuItem>
                    {DealStages.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors?.modelState?.stage}</FormHelperText>
                </FormControl>
                <FormControl
                  sx={{ flexGrow: 1 }}
                  error={Boolean(errors?.modelState?.type)}
                >
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    label="Type"
                    value={state.type}
                    onChange={(e) =>
                      setState({ ...state, type: e.target.value })
                    }
                  >
                    <MenuItem value={''}>None</MenuItem>
                    {DealTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors?.modelState?.type}</FormHelperText>
                </FormControl>
              </Stack>

              <TextField
                label="Amount"
                error={Boolean(errors?.modelState?.amount)}
                type="number"
                helperText={errors?.modelState?.amount}
                fullWidth
                value={state.amount}
                onChange={(e) =>
                  setState({ ...state, amount: +e.target.value })
                }
              />

              <FormControl
                sx={{ flexGrow: 1 }}
                error={Boolean(errors?.modelState?.accountManager)}
              >
                <InputLabel id="accountManager-label">
                  Account Manager
                </InputLabel>
                <Select
                  labelId="accountManager-label"
                  label="Account Manager"
                  value={accountManagers && (state.accountManager?.id || '')}
                  onChange={(e) =>
                    setState({
                      ...state,
                      accountManager: accountManagers?.find(
                        (x) => x.id === e.target.value
                      )!
                    })
                  }
                >
                  <MenuItem value={''}></MenuItem>
                  {accountManagers?.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.lastName + ' ' + s.firstName}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors?.modelState?.accountManager}
                </FormHelperText>
              </FormControl>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
