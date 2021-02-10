import React, { Component } from 'react';
import Banner from '@ncigdc/uikit/Banner';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
  NavbarText
} from 'reactstrap';
import {compose} from "recompose";
import {connect} from "react-redux";
import withRouter from '@ncigdc/utils/withRouter';
import { dismissNotification, removeNotification } from '@ncigdc/dux/bannerNotification';


class NavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  };

  render() {
    return (
        <React.Fragment>
        {this.props.notifications.map(n => (
              <Banner
                  {...n}
                  handleOnDismiss={() => this.props.dispatch(dismissNotification(n.id))}
                  key={n.id}
              />
          ))}
        <Container fluid={true}>
          <Navbar id="navbar" className="fixed-top px-1 py-1 container-fluid" expand="md" light>
            <NavbarBrand href="/" className="pr-5 mr-auto ml-2 text-dark d-flex align-items-center">
              <img src="img/logo.png" alt="Kidney Tissue Atlas" className="logo"/>
              <span id="title-text" className="ml-2">Kidney Tissue Atlas</span>
            </NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="mr-auto" navbar>
                <NavItem className="px-1">
                  <NavLink href="/"><span className="nav-text px-1">Dashboard (Home)</span></NavLink>
                </NavItem>
                <NavItem className="active px-1">
                  <NavLink href="/explorer"><span className="nav-text px-1">Explorer</span></NavLink>
                </NavItem>
                <NavItem className="px-1">
                  <NavLink href="/repository"><span className="nav-text px-1">Repository</span></NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </Container>
        </React.Fragment>
    );
  }
}

export default compose(
    withRouter,
    connect(state => ({
      notifications: state.bannerNotification,
    }))
)(NavBar);