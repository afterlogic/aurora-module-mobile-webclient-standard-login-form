import settings from './settings'

export default {
  moduleName: 'StandardLoginFormMobileWebclient',

  requiredModules: [],

  init (appdata) {
    settings.init(appdata)
  },

  getAnonymousPages () {
    return [
      {
        pageName: 'login',
        pagePath: '/',
        pageComponent: () => import('./pages/Login'),
      },
    ]
  },
}
