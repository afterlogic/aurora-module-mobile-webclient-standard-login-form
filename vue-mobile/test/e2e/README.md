# Mobile E2E (Playwright)

Scenarios for **StandardLoginFormMobileWebclient**.

Full docs (run / UI Mode / filters / env):

- Install root: [`README-e2e-mobile.md`](../../../../../README-e2e-mobile.md)
- Runner: [`CoreMobileWebclient/vue-mobile/test/e2e/README.md`](../../../../CoreMobileWebclient/vue-mobile/test/e2e/README.md)

```bash
# from Aurora install root
yarn test:e2e-mobile -- --setup "StandardLoginFormMobileWebclient iPhone13"
yarn test:e2e-mobile:ui -- --setup "StandardLoginFormMobileWebclient iPhone13"

# from modules/CoreMobileWebclient/vue-mobile
yarn test:e2e_local -- --setup "StandardLoginFormMobileWebclient iPhone13"
yarn test:e2e:ui -- --setup "StandardLoginFormMobileWebclient iPhone13"
```

`--setup "<modules> <devices>"` (like desktop). Comma-separate multiple modules/devices.
`*` = all modules: `--setup "* iPhone13"`. Device aliases: `"iPhone 13"` → `iPhone13`.

Shared helpers: Core `test/e2e/helpers/` (`AURORA_MOBILE_E2E_ROOT`). Domain helpers: `./helpers/` here (if present).

