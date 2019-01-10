import React from 'react';
import ReactDOM from 'react-dom';
import ForgetPassword from './ForgetPassword';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ForgetPassword />, div);
  ReactDOM.unmountComponentAtNode(div);
});
