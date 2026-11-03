import types from 'src/utils/types'

class LoginSettings {
  constructor (appData) {
    const loginData = types.pObject(appData.StandardLoginFormWebclient)
    this.demoLogin = types.pString(loginData.DemoLogin)
    this.demoPassword = types.pString(loginData.DemoPassword)
    this.infoText = types.pString(loginData.InfoText)
    this.bottomInfoHtmlText = types.pString(loginData.BottomInfoHtmlText)
  }
}

let settings = null

export default {
  init (appData) {
    settings = new LoginSettings(appData)
  },

  getSetting (settingName) {
    return settings ? settings[settingName] : null
  },
}
