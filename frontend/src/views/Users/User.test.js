import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import { mount } from 'enzyme'
import User from './User';
import ReactDOM from "react-dom";
import Users from "./Users.test";


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><User /></MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
