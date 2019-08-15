import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, InputLabel,
  TextField
} from "@material-ui/core";
import React, {useMemo} from "react";
import Dropdown from "../../Package/components/Dropdown";

export default function OrgAddDialog(props) {
  const {open, onClose, onAdd, onChange, values, users, types} = props;
  const title = values.edit ? "Edit Organization" : "Add Organization";
  const saveText = values.edit ? "Update" : "Add";
  const availableManagers = useMemo(() => {
    const managers = [];
    for (const user of users) {
      if (values.users.includes(user[0])) {
        managers.push(user);
      }
    }
    return managers;
  }, [values.users, users]);
  return (
    <Dialog open={open} aria-labelledby={title} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <InputLabel>Organization Name</InputLabel>
        <TextField
          type="text" value={values.name} onChange={onChange('name')} fullWidth
          InputLabelProps={{shrink: true}} autoFocus style={{paddingBottom: 10}}/>
        <Dropdown
          title="Users"
          options={users}
          defaultValues={values.users}
          onChange={onChange('users')}
        />
        <Dropdown
          title="Managers"
          options={availableManagers}
          defaultValues={values.managers}
          onChange={onChange('managers')}
        />
        <Dropdown
          title="Organization Types"
          options={types}
          defaultValues={values.types}
          onChange={onChange('types')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onAdd} color="primary">
          {saveText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
