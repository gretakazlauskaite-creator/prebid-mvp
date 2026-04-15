(function (global) {
  function ensurePbjs() {
    global.pbjs = global.pbjs || {};
    global.pbjs.que = global.pbjs.que || [];
    return global.pbjs;
  }

  function createIframe(container, width, height) {
    container.innerHTML = '';

    var iframe = document.createElement('iframe');
    iframe.width = String(width);
    iframe.height = String(height);
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('marginwidth', '0');
    iframe.setAttribute('marginheight', '0');
    iframe.setAttribute('frameborder', '0');

    container.appendChild(iframe);
    return iframe;
  }

  function writeIframeShell(iframe) {
    var doc = iframe.contentWindow.document;
    doc.open();
    doc.write(
      '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="utf-8" />' +
        '<style>' +
        'html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent;}' +
        '#slot{width:100%;height:100%;}' +
        '</style>' +
        '</head>' +
        '<body><div id="slot"></div></body>' +
        '</html>'
    );
    doc.close();
    return doc;
  }

  function validateConfig(config) {
    if (!config) throw new Error('Missing config');
    if (!config.containerId) throw new Error('Missing containerId');
    if (!config.width || !config.height) throw new Error('Missing width/height');
    if (!Array.isArray(config.bidders) || !config.bidders.length) {
      throw new Error('Missing bidders');
    }
  }

  function buildAdUnit(config) {
    return {
      code: config.adUnitCode || config.containerId,
      mediaTypes: {
        banner: {
          sizes: [[config.width, config.height]],
        },
      },
      bids: config.bidders,
    };
  }

  function renderWinningBid(pbjs, adUnitCode, doc) {
    var bids = pbjs.getHighestCpmBids(adUnitCode);

    if (!bids || !bids.length) {
      return false;
    }

    var winningBid = bids[0];

    try {
      pbjs.renderAd(doc, winningBid.adId);
      return true;
    } catch (err) {
      console.error('[SetupadWrapper] renderAd failed:', err);
      return false;
    }
  }

  function showFallback(container, width, height, html) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = '#f3f4f6';
    wrapper.style.color = '#6b7280';
    wrapper.style.fontSize = '12px';
    wrapper.style.border = '1px solid #e5e7eb';
    wrapper.innerHTML = html || 'No ad available';
    container.appendChild(wrapper);
  }

  function init(config) {
    try {
      validateConfig(config);
    } catch (err) {
      console.error('[SetupadWrapper] Invalid config:', err.message);
      return;
    }

    var pbjs = ensurePbjs();

    var container = document.getElementById(config.containerId);
    if (!container) {
      console.error('[SetupadWrapper] Container not found:', config.containerId);
      return;
    }

    var timeout = Number(config.timeout || 3500);
    var currency = config.currency || 'EUR';
    var debug = !!config.debug;
    var adUnit = buildAdUnit(config);

    pbjs.que.push(function () {
      try {
        pbjs.setConfig({
          debug: debug,
          bidderTimeout: timeout,
          currency: {
            adServerCurrency: currency,
          },
          consentManagement: config.consentManagement || undefined,
          userSync: config.userSync || undefined,
        });

        pbjs.addAdUnits([adUnit]);

        pbjs.requestBids({
          adUnits: [adUnit],
          timeout: timeout,
          bidsBackHandler: function () {
            var iframe = createIframe(container, config.width, config.height);
            var doc = writeIframeShell(iframe);

            var rendered = renderWinningBid(pbjs, adUnit.code, doc);

            if (!rendered) {
              container.innerHTML = '';
              showFallback(
                container,
                config.width,
                config.height,
                config.fallbackHtml || 'No bid'
              );
            }

            if (typeof config.onAuctionEnd === 'function') {
              try {
                config.onAuctionEnd({
                  adUnitCode: adUnit.code,
                  bids: pbjs.getBidResponses(),
                  winningBids: pbjs.getHighestCpmBids(adUnit.code),
                });
              } catch (hookErr) {
                console.error('[SetupadWrapper] onAuctionEnd hook failed:', hookErr);
              }
            }
          },
        });
      } catch (err) {
        console.error('[SetupadWrapper] Auction failed:', err);
        showFallback(
          container,
          config.width,
          config.height,
          config.fallbackHtml || 'Auction error'
        );
      }
    });
  }

  global.SetupadWrapper = {
    init: init,
  };
})(window);
