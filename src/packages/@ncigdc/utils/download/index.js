// @flow

import React from 'react';
// TODO change this
import { store } from '../../../../Portal';

import _ from 'lodash';
import $ from 'jquery';
import Cookies from 'js-cookie';

import { notify } from '@ncigdc/dux/notification';
import { setModal } from '@ncigdc/dux/modal';

import { Row, Column } from '@ncigdc/uikit/Flex';
import Button from '@ncigdc/uikit/Button';

// const cookiePath = document.querySelector('base').getAttribute('href')
const cookiePath = '/';
const iFrameIdPrefix = '__downloader_iframe__';
const formIdPrefix = '__downloader_form__';
const getIframeResponse = iFrame =>
  JSON.parse(iFrame.contents().find('body pre').text());
const showErrorModal = error => {
  const warning = error.warning || error.message;
  store.dispatch(
    setModal(
      <Column
        style={{
          padding: '15px',
        }}
      >
        {warning}
        <Row style={{ paddingTop: '0.5rem', justifyContent: 'flex-end' }}>
          <Button onClick={() => store.dispatch(setModal(null))}>
            OK
          </Button>
        </Row>
      </Column>,
    ),
  );
};
// notification config

const progressChecker = (
  iFrame,
  cookieKey,
  downloadToken,
  altMessage,
  inProgress,
  done,
) => {
  inProgress();
  const waitTime = 1000;
  let attempts = 0;
  let timeoutPromise = null;

  const cookieStillThere = () => downloadToken === Cookies.get(cookieKey); // TODO: not $
  const handleError = () => {
    const error = _.flow(
      _.attempt,
      e =>
        _.isError(e)
          ? {
              message: 'GDC download service is currently experiencing issues.',
            }
          : e,
    )(_.partial(getIframeResponse, iFrame));

    return error;
  };

  const finished = () => {
    //console.info('Download check count & wait interval (in milliseconds):', attempts, waitTime);
    timeoutPromise = null;
    iFrame.remove();
    store.dispatch(notify(null));
    done();
  };

  const cancelDownload = () => {
    if (timeoutPromise) {
      clearTimeout(timeoutPromise);
      timeoutPromise = null;
    }
    finished();
  };

  const simpleMessage = (
    <div>
      <div>Download preparation in progress. Please wait…</div>
      <a onClick={cancelDownload}>
        <i className="fa fa-times-circle-o" /> Cancel Download
      </a>
    </div>
  );

  const detailedMessage = (
    <div>
      <div>
        The download preparation can take time due to different factors (total
        file size, number of files, or number of concurrent users).
      </div>
      <div>
        We recommend that you use the{' '}
        <a
          href="https://gdc.cancer.gov/access-data/gdc-data-transfer-tool"
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}GDC Data Transfer Tool
        </a>{' '}
        or cancel the download and try again later.
      </div>
      <a
        onClick={cancelDownload}
        style={{
          textDecoration: 'underline',
        }}
      >
        <strong>
          <i className="fa fa-times-circle-o" /> Cancel Download
        </strong>
      </a>
    </div>
  );

  const checker = () => {
    attempts++;
    if (iFrame[0].__frame__loaded) {
      // The downloadToken cookie is removed before the server sends the response
      if (cookieStillThere()) {
        const error = handleError();
        Cookies.remove(cookieKey);
        finished();
        showErrorModal(error);
      } else {
        // A download should be now initiated.
        finished();
      }
    } else if (cookieStillThere()) {
      if (altMessage) {
        if (attempts === 5 || attempts === 2) {
          store.dispatch(
            notify({
              action: 'add',
              id: `download/${attempts}`,
              component: simpleMessage,
              delay: 1000,
            }),
          );
        } else if (attempts === 6) {
          store.dispatch(
            notify({
              action: 'add',
              id: `download/${attempts}`,
              component: detailedMessage,
              delay: 0,
            }),
          );
        }
      } else {
        store.dispatch(
          notify({
            action: 'add',
            id: `download/${attempts}`,
            component: simpleMessage,
            delay: 0,
          }),
        );
      }

      timeoutPromise = setTimeout(checker, waitTime);
    } else {
      // In case the download is initiated without triggering the iFrame to reload
      finished();
    }
  };

  timeoutPromise = setTimeout(checker, waitTime);
};

const cookielessChecker = (iFrame, inProgress, done) => {
  // let attempts = 30;
  // const finished = () => {
  //   iFrame.remove();
  //   done();
  // };
  // const checker = () => {
  //   // Here we simply try to read the error message if the iFrame DOM is
  //   // reloaded; for a successful download, the error message is not in the DOM
  //   // therefore #getIframeResponse will return a JS error.
  //   const error = _.attempt(_.partial(getIframeResponse, iFrame));
  //   if (_.isError(error)) {
  //     // Keep waiting until we exhaust `attempts` then we do the cleanup.
  //     if (--attempts < 0) {
  //       finished();
  //     } else {
  //       // setTimeout(checker, waitTime)
  //     }
  //   } else {
  //     finished();
  //     showErrorModal(error);
  //   }
  // };
  // setTimeout(checker, waitTime);
};

const hashString = s =>
  s.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0);

const toHtml = (key, value) =>
  `<input
    type="hidden"
    name="${key}"
    value="${_.isPlainObject(value)
      ? JSON.stringify(value).replace(/"/g, '&quot;')
      : value}"
  />`;

const arrayToStringFields = ['expand', 'fields', 'facets'];

const arrayToStringOnFields = (key, value, fields) =>
  _.includes(fields, key) ? [].concat(value).join() : value;

const download = ({ url, params, method = 'GET', altMessage = false }) => {
  const downloadToken = _.uniqueId(`${+new Date()}-`);
  const iFrameId = iFrameIdPrefix + downloadToken;
  const formId = formIdPrefix + downloadToken;
  // a cookie value that the server will remove as a download-ready indicator
  const cookieKey = navigator.cookieEnabled
    ? Math.abs(hashString(JSON.stringify(params) + downloadToken)).toString(16)
    : null;

  if (cookieKey) {
    Cookies.set(cookieKey, downloadToken);
    _.assign(params, {
      downloadCookieKey: cookieKey,
      downloadCookiePath: cookiePath,
    });
  }

  const fields = _.reduce(
    params,
    (result, value, key) => {
      const paramValue = arrayToStringOnFields(key, value, arrayToStringFields);
      return (
        result +
        [].concat(paramValue).reduce((acc, v) => acc + toHtml(key, v), '')
      );
    },
    '',
  );

  const formHtml = `<form
      method="${method.toUpperCase()}"
      id="${formId}"
      action="${url}"
      style="display: none"
    >
      ${fields}
    </form>`;

  $(
    `<iframe
      id="${iFrameId}"
      style="display: none"
      src="about:blank"
      onload="this.__frame__loaded = true;">
    </iframe>`,
  )
    // Appending to document body to allow navigation away from the current
    // page and downloads in the background
    .appendTo('body');

  const iFrame = $(`#${iFrameId}`);
  iFrame[0].__frame__loaded = false;

  iFrame.ready(() => {
    const iFrameBody = iFrame.contents().find('body');
    iFrameBody.append(formHtml);

    const form = iFrameBody.find(`#${formId}`);
    form.submit();
  });

  return cookieKey
    ? _.partial(progressChecker, iFrame, cookieKey, downloadToken, altMessage)
    : _.partial(cookielessChecker, iFrame);
};

/*----------------------------------------------------------------------------*/

export default download;