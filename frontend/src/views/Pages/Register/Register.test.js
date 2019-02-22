import React from 'react';
import ReactDOM from 'react-dom';
import Register from './Register';
import {MemoryRouter} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><Register /></MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
