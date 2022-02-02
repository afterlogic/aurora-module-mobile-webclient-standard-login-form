// import typesUtils from 'src/utils/types'

class LoginSettings {
  constructor (appData) {
    // const loginData = typesUtils.pObject(appData.StandardLoginFormWebclient)
  }
}

let settings = null

export default {
  init (appData) {
    settings = new LoginSettings(appData)
  },
}
