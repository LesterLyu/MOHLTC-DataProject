import React from 'react';
import ReactDOM from 'react-dom';
import ForgetPassword from './ForgetPassword';
import {MemoryRouter} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><ForgetPassword /></MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
