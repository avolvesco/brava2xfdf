import React, { Component } from 'react';
import styled from 'styled-components';
import xrlToXfdf from '../../xrlToXfdf/xrlToXfdf';

const WebViewerContainer = styled.div`
  height: 100%;
`;

class WebViewer extends Component {
  async componentDidMount() {
    const { markupFile, docFile, onError } = this.props;

    const instance = await window.WebViewer({
      fullAPI: true,
      path: '/lib',
      css: 'styles.css',
      annotationAdmin: true,
      disabledElements: [
        ...(process.env.REACT_APP_TESTING === 'on' ? [
          'header',
          'toolsHeader',
          'pageNavOverlay',
        ] : []),
      ],
    }, this.refViewer);

    const { docViewer } = instance;
    let extension = null;

    window.docViewer = docViewer;
    this.annotationManager = docViewer.getAnnotationManager();
    const regex = /\.([\w]+)$/;
    const match = docFile.name.match(regex);
    if (match) {
      ([, extension] = match);
    } else {
      onError(new Error(`No extension for ${docFile.name}`), `No extension for ${docFile.name}`);
    }
    instance.loadDocument(docFile, { filename: `file.${extension}` });

    // Enable ChangeView
    //
    instance.UI.enableFeatures([instance.UI.Feature.ChangeView]);


    //
    // Put pageInfos together
    //

    // TODO: Read extension
    const isXod = false;
    docViewer.on('documentLoaded', async () => {
      const doc = docViewer.getDocument();
      // await doc.documentCompletePromise();
      const pageCount = docViewer.getPageCount();

      // Get OCG layers
      const ocgLayers = await doc.getLayersArray();

      const pageInfos = [];
      for (let i = 1; i <= pageCount; i++) {
        let { width, height } = doc.getPageInfo(i);
        if (isXod) {
          [width, height] = [width * (3 / 4), height * (3 / 4)];
        }
        const pageRotationDegree = doc.getPageRotation(i);
        // Adding page information as well as information about OCG layers
        pageInfos.push({
          width, height, pageRotationDegree, ocgLayers,
        });
      }

      const reader = new FileReader();
      reader.readAsText(markupFile);
      const markdownStr = await new Promise((resolve) => {
        reader.onload = () => {
          resolve(reader.result);
        };
      });

      try {
        //
        // Convert from Brava XRL to XFDF
        //
        const { xfdf } = await xrlToXfdf(markdownStr, pageInfos, instance);

        //
        // Import XFDF into WebViewer
        //
        await this.annotationManager.importAnnotations(xfdf);


        // await instance.Core.PDFNet.initialize();

        // Event for testing
        const event = new Event('import');
        window.dispatchEvent(event);
      } catch (error) {
        // window.Sentry.captureException(error);
        console.error(error);
        if (process.env.REACT_APP_TESTING === 'on') {
          throw error;
        } else {
          onError(error, 'Failed conversion');
        }
      }
    });
  }

  render() {
    return (
      <WebViewerContainer
        ref={(refViewer) => { this.refViewer = refViewer; }}
      />
    );
  }
}

export default WebViewer;
