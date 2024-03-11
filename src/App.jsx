import React, { Component } from 'react';
import styled from 'styled-components';
import queryString from 'query-string';

import WebViewer from './components/WebViewer';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const ErrorContainer = styled.div`
  padding: 20px;
`;

const LoadButton = styled.div`
  color: #fff;
  background-color: #39A04c;
  max-width: 80%;
  font-size: 1.25rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: 0.625rem 1.25rem;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);
  ${({ isDisabled }) => isDisabled && `background-color: grey; cursor: not-allowed;`}
`;

const SelectFileLabel = styled.label`
  color: #fff;
  background-color: #4285f4;
  max-width: 80%;
  font-size: 1.25rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: 0.625rem 1.25rem;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);
`;

const StyledInput = styled.input`
  ${({ isFileChosen }) => !isFileChosen && `display: none`}
`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      docFile: null,
      markupFile: null,
      loadPickedFiles: false,
      docFileFromPicker: null,
      markupFileFromPicker: null,
      error: null,
      errorMessage: '',
    };
  }

  componentDidMount() {
    this.processQuery(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.processQuery(nextProps);
  }

  processQuery = async ({ location }) => {
    const docName = queryString.parse(location.search).doc;
    const markupName = queryString.parse(location.search).markup;

    if (docName && markupName) {
      // Reason for accept header...
      // https://stackoverflow.com/questions/40896925/create-react-app-proxy-works-only-with-fetch-api-but-not-in-simple-get-of-the-br
      const [docResponse, markupResponse] = await Promise.all([
        fetch(`/${docName}`, {
          method: 'GET',
          headers: {
            Accept: 'application/*',
          },
        }),
        fetch(`/${markupName}`, {
          method: 'GET',
          headers: {
            Accept: 'application/*',
          },
        }),
      ]);
      const [docBlob, markupBlob] = await Promise.all([
        docResponse.blob(),
        markupResponse.blob(),
      ]);
      this.setState({
        docFile: new File([docBlob], docName),
        markupFile: new File([markupBlob], markupName),
      });
    }
  };

  handleFilePick = (e) => {
    this.setState({
      docFileFromPicker: e.target.files[0],
    });
  };

  handleMarkupPick = (e) => {
    this.setState({
      markupFileFromPicker: e.target.files[0],
    });
  };

  render() {
    const {
      docFile,
      markupFile,
      loadPickedFiles,
      docFileFromPicker,
      markupFileFromPicker,
    } = this.state;

    if (this.state.error) {
      return (
        <Container>
          <ErrorContainer>
            <h2>{this.state.errorMessage}</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.error.stack}
            </details>
          </ErrorContainer>
        </Container>
      );
    }

    if (docFile && markupFile) {
      // redirect convert?
      return (
        <WebViewer
          docFile={docFile}
          markupFile={markupFile}
          onError={(error, errorMessage) => this.setState({ error, errorMessage })}
        />
      );
    }

    if (loadPickedFiles) {
      // redirect convertFromPicker?
      return (
        <WebViewer
          docFile={docFileFromPicker}
          markupFile={markupFileFromPicker}
          onError={(error, errorMessage) => this.setState({ error, errorMessage })}
        />
      );
    }

    const loadDisabled = !docFileFromPicker || !markupFileFromPicker;

    return (
      <Container>
        <div>
          <div>
            <LoadButton
              type="button"
              onClick={() => {
                this.props.history.push('/run/?doc=samples/dwg3.dwg.pdf&markup=samples/test.xrl');
              }}
            >
              Load demo files
            </LoadButton>
          </div>
          <div>
            <SelectFileLabel
              htmlFor="fileElem"
            >
              {!docFileFromPicker && `Choose a pdf...`}
              <StyledInput
                type="file"
                id="fileElem"
                isFileChosen={!!docFileFromPicker}
                onChange={this.handleFilePick}
                accept=".pdf,.docx,.jpg,.jpeg,.png,.xod"
              />
            </SelectFileLabel>
            <SelectFileLabel
              htmlFor="markupElem"
            >
              {!markupFileFromPicker && `Choose a .xrl file...`}
              <StyledInput
                type="file"
                id="markupElem"
                isFileChosen={!!markupFileFromPicker}
                onChange={this.handleMarkupPick}
                accept=".xrl,.xml"
              />
            </SelectFileLabel>
            <LoadButton
              type="button"
              isDisabled={loadDisabled}
              onClick={(e) => {
                if (loadDisabled) {
                  e.preventDefault();
                } else {
                  this.setState({ loadPickedFiles: true });
                }
              }}
            >
              Load my files
            </LoadButton>
          </div>
        </div>
      </Container>
    );
  }
}

export default App;
