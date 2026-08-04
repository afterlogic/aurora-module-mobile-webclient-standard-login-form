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
              data-test-id="login-email"
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
              data-test-id="login-password"
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
                  data-test-id="login-password-toggle"
                  :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
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
              <router-link
                data-test-id="login-forgot-password"
                :to="{ name: 'reset-password' }"
              >
                {{ $t('STANDARDRESETPASSWORD.ACTION_FORGOT_PASSWORD') }}
              </router-link>
            </div>
            <component
              v-for="(component, index) in beforeButtonsComponents"
              :key="index"
              :is="component"
            />
          </q-form>
        </div>
      </div>
      <div class="q-pb-xl text-center">
        <AppButton
          data-test-id="login-submit"
          class="text-uppercase"
          :label="$t('COREWEBCLIENT.LABEL_LOGIN')"
          :loading="loading"
          @click="proceedLogin"
          :disabled="!login || !password"
        />
      </div>
    </template>
  </LoginLayout>
</template>

<script>
import { ref, shallowRef, triggerRef, computed, onMounted } from 'vue'
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
    const beforeButtonsComponents = shallowRef([])

    const showForgotPassword = computed(() => {
      return modulesManager.isModuleAvailable('StandardResetPassword')
    })

    const loadBeforeButtonsComponents = async () => {
      const params = {}
      eventBus.$emit('StandardLoginFormMobileWebclient::GetBeforeButtonsComponents', params)
      if (!_.isArray(params.beforeButtonsComponents) || params.beforeButtonsComponents.length === 0) {
        beforeButtonsComponents.value = []
        return
      }

      const components = await Promise.all(params.beforeButtonsComponents.map((loader) => loader()))
      beforeButtonsComponents.value = components.map((component) => component.default).filter(Boolean)
      triggerRef(beforeButtonsComponents)
    }

    onMounted(() => {
      loadBeforeButtonsComponents()
    })

    const proceedLogin = async () => {
      loading.value = true
      const parameters = {
        Login: login.value,
        Password: password.value,
      }
      const populateParams = {
        Module: 'StandardLoginFormMobileWebclient',
        Parameters: parameters,
      }
      eventBus.$emit('AnonymousUserForm::PopulateFormSubmitParameters', populateParams)
      if (populateParams.Reject) {
        notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_CAPTCHA_IS_INCORRECT'))
        loading.value = false
        return
      }

      const result = await coreWebApi.login(populateParams.Parameters)
      if (result?.AuthToken) {
        eventBus.$emit('AnonymousUserForm::LoginSucceed', { ModuleName: 'StandardLoginFormMobileWebclient' })
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
              eventBus.$emit('AnonymousUserForm::LoginFailed', { ModuleName: 'StandardLoginFormMobileWebclient' })
              notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_PASS_INCORRECT'))
            }
          }, () => {
            eventBus.$emit('AnonymousUserForm::LoginFailed', { ModuleName: 'StandardLoginFormMobileWebclient' })
            notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_PASS_INCORRECT'))
          })
        } else {
          eventBus.$emit('AnonymousUserForm::LoginFailed', { ModuleName: 'StandardLoginFormMobileWebclient' })
          notification.showError(i18n.global.tc('COREWEBCLIENT.ERROR_PASS_INCORRECT'))
        }
      } else {
        eventBus.$emit('AnonymousUserForm::LoginFailed', { ModuleName: 'StandardLoginFormMobileWebclient' })
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
      beforeButtonsComponents,
      proceedLogin,
      onProceedToPassword,
      onProceedToLogin,
      onBackToLogin,
    }
  },
}
</script>

<style lang="scss">
$login-autofill-bg: #e8f0fe;
$login-autofill-icon: #5f6368;

.login_input .q-field__control:after {
  transform: unset;
  opacity: 0;
  transition: opacity 0.3s;
}

.login_input.q-field--highlighted .q-field__control:after {
  opacity: 1;
  transform: unset;
}

// Chrome paints autofill only on the native input; cover the whole Quasar field.
.login_input:has(.q-field__native:-webkit-autofill) {
  .q-field__control {
    background-color: $login-autofill-bg;
    border-radius: 4px 4px 0 0;
  }

  .q-field__control:before,
  .q-field__control:after {
    z-index: 1;
  }

  .q-field__prepend .q-icon,
  .q-field__append .q-icon {
    color: $login-autofill-icon !important;
  }
}

.login_input .q-field__native:-webkit-autofill,
.login_input .q-field__native:-webkit-autofill:hover,
.login_input .q-field__native:-webkit-autofill:focus,
.login_input .q-field__native:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px $login-autofill-bg inset !important;
  -webkit-text-fill-color: inherit;
  caret-color: auto;
  transition: background-color 99999s ease-out;
}

.login_forgot a {
  color: var(--q-primary);
  text-decoration: none;
  font-size: 0.875rem;
}
</style>
