window.SETUPAD_WRAPPER_EXAMPLE = {
  containerId: 'setupad-slot-1',
  adUnitCode: 'setupad_slot_1',
  width: 300,
  height: 250,
  timeout: 3500,
  currency: 'EUR',
  debug: true,
  bidders: [
    {
      bidder: 'adform',
      params: {
        mid: '1827042',
      },
    },
    {
      bidder: 'openx',
      params: {
        unit: '560637352',
        delDomain: 'setupad-d.openx.net',
      },
    },
    {
      bidder: 'smartadserver',
      params: {
        domain: 'prg.smartadserver.com',
        siteId: 644690,
        pageId: 1947881,
        formatId: 84779,
      },
    },
  ],
  fallbackHtml: 'No ad returned',
  onAuctionEnd: function (result) {
    console.log('[SetupadWrapper] Auction result:', result);
  },
};
