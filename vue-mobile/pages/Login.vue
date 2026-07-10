<template>
  <LoginLayout :subheading="$t('STANDARDLOGINFORMMOBILEWEBCLIENT.LABEL_LOGIN_TO_CONTINUE')">
    <template v-if="processLoginResultComponent">
      <component
        :is="processLoginResultComponent"
        :login="login"
        :password="password"
        :loginResult="loginResult"
        @backToLogin="onBackToLogin"
      />
    </template>
    <template v-else>
      <div class="full-width q-my-auto">
        <div class="full-width">
          <q-form>
            <q-input
              class="login_input"
              type="email"
              v-model="login"
              @keydown.enter="onProceedToPassword"
              :placeholder="$t('COREWEBCLIENT.LABEL_EMAIL')"
            >
              <template v-slot:prepend>
                <q-icon name="mail_outline" color="grey-5" />
              </template>
            </q-input>
            <q-input
              class="login_input"
              ref="passwordInput"
              :type="isPasswordVisible ? 'text' : 'password'"
              v-model="password"
              @keydown.enter="onProceedToLogin"
              :placeholder="$t('COREWEBCLIENT.LABEL_PASSWORD')"
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" color="grey-5" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPasswordVisible ? 'visibility' : 'visibility_off'"
                  color="grey-5"
                  class="cursor-pointer"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
              </template>
            </q-input>
            <div
              v-if="showForgotPassword"
              class="login_forgot q-mt-sm text-right"
            >
              <router-link :to="{ name: 'reset-password' }">
                {{ $t('STANDARDRESETPASSWORD.ACTION_FORGOT_PASSWORD') }}
              </router-link>
            </div>
          </q-form>
        </div>
      </div>
      <div class="q-pb-xl text-center">
        <AppButton label="LOGIN" :loading="loading" @click="proceedLogin" :disabled="!login || !password" />
      </div>
    </template>
  </LoginLayout>
</template>

<script>
import { ref, shallowRef, triggerRef, computed } from 'vue'
import { i18n } from 'src/boot/i18n'
import _ from 'lodash'

import coreWebApi from 'src/api/core-web-api'
import eventBus from 'src/event-bus'
import notification from 'src/utils/notification'
import modulesManager from 'src/modules-manager'

import { useCoreStore } from 'src/stores/index-pinia'
const coreStore = useCoreStore()

import AppButton from 'src/components/common/AppButton'
import LoginLayout from 'src/layouts/LoginLayout'

export default {
  name: 'Login',

  components: {
    LoginLayout,
    AppButton,
  },

  setup() {
    const login = ref('')
    const password = ref('')
    const loginResult = ref(null)
    const loading = ref(false)
    const passwordInput = ref(null)
    const isPasswordVisible = ref(false)
    const processLoginResultComponent = shallowRef(null)

    const showForgotPassword = computed(() => {
      return modulesManager.isModuleAvailable('StandardResetPassword')
    })

    const proceedLogin = async () => {
      loading.value = true
      const parameters = {
        Login: login.value,
        Password: password.value,
      }
      const result = await coreWebApi.login(parameters)
      if (result?.AuthToken) {
        // await store.dispatch('core/setAuthToken', )
        await coreStore.setAuthToken(result.AuthToken)
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

    const onProceedToPassword = () => {
      if (!login.value) return;
      passwordInput.value.focus()
    }

    const onProceedToLogin = () => {
      if (!login.value || !password.value) return;
      proceedLogin()
    }

    const onBackToLogin = () => {
      processLoginResultComponent.value = null
      triggerRef(processLoginResultComponent)
    }

    return {
      login,
      password,
      loading,
      passwordInput,
      isPasswordVisible,
      showForgotPassword,
      loginResult,
      processLoginResultComponent,
      proceedLogin,
      onProceedToPassword,
      onProceedToLogin,
      onBackToLogin,
    }
  },
}
</script>

<style lang="scss">
.login_input .q-field__control:after {
  transform: unset;
  opacity: 0;
  transition: opacity 0.3s;
}

.login_input.q-field--highlighted .q-field__control:after {
  opacity: 1;
  transform: unset;
}

.login_forgot a {
  color: var(--q-primary);
  text-decoration: none;
  font-size: 0.875rem;
}
</style>
