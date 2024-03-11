import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import styled, { createGlobalStyle } from 'styled-components';
import App from './App';

// window.Sentry.init({ dsn: 'https://4954afb425d34480b07443a8b53933fd@sentry.io/1407863' });

const Container = styled.div`
  padding: 20px;
`;

class ErrorBoundary extends React.Component {
  constructor() {
    super();
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: Sentry
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <Container>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </Container>
      );
    }
    return this.props.children;
  }
}

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
  }
  #root {
    height: 100%;
  }
`;

const Root = function () {
  return (
    <ErrorBoundary>
      <GlobalStyle />
      <Router>
        <Switch>
          <Route exact path="/" component={App} />
          <Route path="/run" component={App} />
        </Switch>
      </Router>
    </ErrorBoundary>
  );
};

export default Root;
