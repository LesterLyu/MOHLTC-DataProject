import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, InputLabel,
  TextField
} from "@material-ui/core";
import React from "react";
import Dropdown from "../../Package/components/Dropdown";

export default function OrgAddDialog(props) {
  const {open, onClose, onAdd, onChange, values, organizations} = props;
  const title = values.edit ? "Edit Organization Type" : "Add Organization Type";
  const saveText = values.edit ? "Update" : "Add";

  return (
    <Dialog open={open} aria-labelledby={title} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <InputLabel>Organization Name</InputLabel>
        <TextField
          type="text" value={values.name} onChange={onChange('name')} fullWidth
          InputLabelProps={{shrink: true}} autoFocus style={{paddingBottom: 10}}/>
        <Dropdown
          title="Organizations"
          options={organizations}
          defaultValues={values.organizations}
          onChange={onChange('organizations')}
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
