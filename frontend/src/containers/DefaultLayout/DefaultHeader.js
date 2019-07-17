import React, {Component} from 'react';
import {DropdownItem, DropdownMenu, DropdownToggle, Nav} from 'reactstrap';
import PropTypes from 'prop-types';

import {AppHeaderDropdown, AppSidebarToggler, AppNavbarBrand} from '@coreui/react';
import logo from '../../assets/img/brand/ON_POS_LOGO_BLUE_RGB.svg'
import sygnet from '../../assets/img/brand/ON_POS_LOGO_RGB_BLUE_NO_FONT_SPACED.svg'

import {AppBar, Toolbar, IconButton} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  render() {
    return (
      <React.Fragment>
        <AppBar style={{minHeight: 55, backgroundColor: '#536DFE'}}>
          <Toolbar style={{minHeight: 55}}>
            <AppSidebarToggler className="d-lg-none" display="md" mobile/>
            <AppNavbarBrand
              full={{src: logo, height: 48, alt: 'MOH Logo'}}
              minimized={{src: sygnet, height: 48, alt: 'MOH Logo'}}
            />
            <AppSidebarToggler className="d-md-down-none" display="lg"/>
            <Nav className="ml-auto" navbar>
              <AppHeaderDropdown direction="down">
                <DropdownToggle nav>
                  <i className="mdi mdi-account mdi-36px"/>
                </DropdownToggle>
                <DropdownMenu right style={{right: 'auto'}}>
                  <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
                  <DropdownItem onClick={e => this.props.onLogout(e)}><i className="fa fa-lock"/> Logout</DropdownItem>
                </DropdownMenu>
              </AppHeaderDropdown>
            </Nav>
          </Toolbar>
        </AppBar>
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
