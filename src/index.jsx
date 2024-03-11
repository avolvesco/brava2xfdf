import React from 'react';
import ReactDOM from 'react-dom';
import Root from './Root';
import * as serviceWorker from './serviceWorker';

let once = false;
const render = () => {
  if (!once) {
    once = true;
    ReactDOM.render(<Root />, document.getElementById('root'));
  }
};
render();
// if (module.hot) {
//   module.hot.accept(['./App'], render);
// }

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
