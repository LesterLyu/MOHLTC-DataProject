import {XlsxPopulate} from '../Excel/helpers'
import React from 'react';
import {Button} from '@material-ui/core';
let workbook;

function upload() {
  const input = document.createElement('input');
  input.type = 'file';

  input.onchange = e => {
    const file = e.target.files[0];
    console.log(file.name);
    XlsxPopulate.fromDataAsync(file)
      .then(wb => workbook = wb);
  };

  input.click();
}

export default function ImportId() {
  return (
    <Button variant="contained" color="primary" onClick={upload}>
      Upload Workbook
    </Button>
  )
}
