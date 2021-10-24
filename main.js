'use es6';

import * as utils from '../utils';
import { addPixels, disablePixels, reinstallPixels, onUtkReady } from './pixels';
import { fetchConfig } from '../configFetcher';

var start = function start() {
  var envString = utils.getEnv() === 'qa' ? 'qa' : '';
  var hublet = utils.getHublet();
  var hubletString = hublet === 'na1' || !hublet ? '' : "-" + hublet;
  var configDomain = "api" + hubletString + ".hubapi" + envString + ".com";
  var config = null;
  var utk = null;

  if (window.disabledHsPopups && window.disabledHsPopups.indexOf('ADS') > -1) {
    return;
  } // For GDPR purposes, users must consent to privacy policy before pixel is added


  window._hsp = window._hsp || [];

  window._hsp.push(["addPrivacyConsentListener", function (consent) {
    if (consent.categories.advertisement) {
      if (!config) {
        fetchConfig({
          jsonUrl: configDomain + "/hs-script-loader-public/v1/config/pixel/json",
          jsonpUrl: configDomain + "/hs-script-loader-public/v1/config/pixel/jsonp"
        }, function (cfg) {
          config = cfg;
          addPixels(cfg, utk);
        }, 'addPixels');
      } else {
        reinstallPixels(config, utk);
      }
    } else if (config) {
      disablePixels(config);
    }
  }]);

  window._hsq = window._hsq || [];

  window._hsq.push(["addUserTokenListener", function (newUtk) {
    utk = newUtk;

    if (config) {
      onUtkReady(config, utk);
    }
  }]);
};

window.PIXELS_RAN = window.PIXELS_RAN || false;

if (!window.PIXELS_RAN) {
  window.PIXELS_RAN = true; // Code entry point

  start();
}