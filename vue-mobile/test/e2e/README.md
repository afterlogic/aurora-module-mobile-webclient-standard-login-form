# Mobile E2E (Playwright)

Scenarios for **StandardLoginFormMobileWebclient**. Runner: `modules/CoreMobileWebclient/vue-mobile`.

```bash
# from CoreMobileWebclient/vue-mobile
yarn test:e2e_local:iphone
yarn test:e2e_local -- --project=StandardLoginFormMobileWebclient-iPhone13
```

Shared helpers: Core `test/e2e/helpers/` (`AURORA_MOBILE_E2E_ROOT`).
Domain helpers: `./helpers/` here.
