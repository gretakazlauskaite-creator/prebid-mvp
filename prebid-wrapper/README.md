# Setupad Prebid Wrapper MVP

## Scope
- Prebid.js with selected SSP adapters
- Manual config
- Wrapper-based rendering
- No Google
- No reporting

## Files
- `dist/prebid.custom.js` - custom Prebid build (add your real build here)
- `src/wrapper.js` - wrapper logic
- `src/config.example.js` - example config
- `test/index.html` - local test page

## Usage
```html
<div id="setupad-slot-1"></div>
<script src="https://your-domain.com/prebid.custom.js"></script>
<script src="https://your-domain.com/wrapper.js"></script>
<script>
  SetupadWrapper.init({
    containerId: 'setupad-slot-1',
    adUnitCode: 'setupad_slot_1',
    width: 300,
    height: 250,
    timeout: 3500,
    currency: 'EUR',
    bidders: [
      { bidder: 'adform', params: { mid: '123456' } },
      { bidder: 'openx', params: { unit: '560637352', delDomain: 'setupad-d.openx.net' } }
    ]
  });
</script>
```

## Notes
- `test/index.html` expects a real `dist/prebid.custom.js` build.
- Start with 1 slot and 2-3 bidders.
- This MVP renders without Google and without reporting.
