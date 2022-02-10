// import types from 'src/utils/types'

class LoginSettings {
  constructor (appData) {
    // const loginData = types.pObject(appData.StandardLoginFormWebclient)
  }
}

let settings = null

export default {
  init (appData) {
    settings = new LoginSettings(appData)
  },
}
