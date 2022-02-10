<template>
  <login-layout :subheading="$t('LOG IN TO CONTINUE')">
    <template v-if="processLoginResultComponent">
      <component :is="processLoginResultComponent" :login="login" :password="password" :loginResult="loginResult"></component>
    </template>
    <template v-else >
      <div class="full-width">
        <div class="page-body-login full-width">
          <q-form>
            <AppInput type="email" v-model="login" :placeholder="$t('COREWEBCLIENT.LABEL_EMAIL')" />
            <AppInput type="password" v-model="password" placeholder="Password" />
          </q-form>
        </div>
      </div>
      <div class="q-pb-xl text-center">
        <AppButton label="Login" :loading="loading" @click="proceedLogin" :disabled="!login || !password" />
      </div>
    </template>
  </login-layout>
</template>

<script>
import { ref, shallowRef, triggerRef } from 'vue'
import { i18n } from 'src/boot/i18n'
import _ from 'lodash'

import coreWebApi from 'src/api/core-web-api'
import eventBus from 'src/event-bus'
import notification from 'src/utils/notification'
import store from 'src/store'

import AppInput from 'src/components/common/AppInput'
import AppButton from 'src/components/common/AppButton'
import AppCheckbox from 'src/components/common/AppCheckbox'
import LoginLayout from 'src/layouts/LoginLayout'

export default {
  name: 'Login',

  components: {
    LoginLayout,
    AppCheckbox,
    AppInput,
    AppButton,
  },

  setup() {
    const login = ref('')
    const password = ref('')
    const loginResult = ref(null)
    const loading = ref(false)
    const processLoginResultComponent = shallowRef(null)

    const proceedLogin = async () => {
      loading.value = true
      const parameters = {
        Login: login.value,
        Password: password.value,
      }
      const result = await coreWebApi.login(parameters)
      if (result?.AuthToken) {
        await store.dispatch('core/setAuthToken', result.AuthToken)
      } else if (result) {
        const params = {}
        eventBus.$emit('StandardLoginFormMobileWebclient::GetProcessLoginResultComponent', params)
        if (_.isFunction(params.getProcessLoginResultComponent)) {
          params.getProcessLoginResultComponent().then(component => {
            if (component?.default) {
              loginResult.value = result
              processLoginResultComponent.value = component.default
              triggerRef(processLoginResultComponent)
            } else {
              notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_PASS_INCORRECT'))
            }
          }, () => {
            notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_PASS_INCORRECT'))
          })
        } else {
          notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_PASS_INCORRECT'))
        }
      }
      loading.value = false
    }

    return {
      login,
      password,
      loading,
      loginResult,
      processLoginResultComponent,
      proceedLogin,
    }
  },
}
</script>

<style lang="scss" scoped>
.two-factor {
  padding-top: 6.25rem;

  &__heading {
    font-size: 1.125rem;
    line-height: 1.25rem;
  }
}
.page-body-login {
  padding-top: 9.25rem;
}
</style>
