<template>
  <login-layout :subheading="$t('LOG IN TO CONTINUE')">
    <div class="full-width">
      <div v-if="isTwoFactor" class="text-center two-factor full-width">
        <p class="text-weight-medium two-factor__heading">
          {{ $t('TWOFACTORAUTH.HEADING_TWA_VERIFICATION') }}
        </p>
        <p class="q-mt-sm">
          {{ $t('TWOFACTORAUTH.INFO_TWA_VERIFICATION') }}
        </p>
        <div class="q-mt-lg">
          <div v-if="isMethodChoosing">
            <p class="q-mt-sm">
              {{ $t('TWOFACTORAUTH.INFO_OTHER_VERIFICATION_OPTIONS') }}
            </p>
            <AppButton
              :label="$t('TWOFACTORAUTH.ACTION_USE_AUTHENTICATOR_APP')"
              @click="chooseMethod('verification')"
              class="q-mt-lg"
            />
            <AppButton
              :label="$t('TWOFACTORAUTH.LABEL_ENTER_BACKUP_CODE')"
              @click="chooseMethod('backup')"
              class="q-mt-md"
            />
          </div>
          <div v-else-if="allowUsedDevices && getAuthTokenStatus">
            <p class="q-mt-sm">You’re all set</p>
            <AppCheckbox
              v-model="trustDevice"
              leftLabel
              :label="`Don’t ask again on this device for ${trustDevicesForDays} days`"
            />
            <AppButton
              label="Continue"
              class="q-mt-lg"
              :loading="loading"
              @click="goHome"
            />
          </div>
          <div v-else>
            <p class="q-mt-sm">
              Specify verification code from the Authenticator app
            </p>
            <AppInput
              v-if="verificationOption === 'verification'"
              autofocus
              type="text"
              v-model="verificationCode"
              placeholder="Verification code"
            />
            <AppInput
              v-else
              autofocus
              type="text"
              v-model="backupCode"
              placeholder="Backup code"
            />
            <AppButton
              label="Verify"
              class="q-mt-lg q-mb-md"
              :loading="loading"
              @click="verifyCode"
              :disabled="disabledVerification"
            />
            <a
              href="javascript:void(0)"
              @click.prevent="isMethodChoosing = !isMethodChoosing"
            >
              {{ $t('TWOFACTORAUTH.ACTION_TRY_ANOTHER_WAY') }}
            </a>
          </div>
        </div>
      </div>
      <div v-else class="page-body-login full-width">
        <q-form>
          <AppInput
            type="email"
            v-model="login"
            :placeholder="$t('COREWEBCLIENT.LABEL_EMAIL')"
          />
          <AppInput type="password" v-model="password" placeholder="Password" />
        </q-form>
      </div>
    </div>
    <div class="q-pb-xl text-center">
      <div v-if="!isTwoFactor">
        <AppButton
          label="Login"
          :loading="loading"
          @click="proceedLogin"
          :disabled="!login || !password"
        />
      </div>
      <a
        v-else-if="!getAuthTokenStatus"
        href="javascript:void(0)"
        @click.prevent="isTwoFactor = !isTwoFactor"
      >
        Back to login
      </a>
    </div>
  </login-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import VueCookies from 'vue-cookies'

import settings from 'src/settings'

import AppInput from 'src/components/common/AppInput'
import AppButton from 'src/components/common/AppButton'
import AppCheckbox from 'src/components/common/AppCheckbox'
import LoginLayout from 'src/views/layouts/LoginLayout'

export default {
  name: 'Login',
  components: {
    LoginLayout,
    AppCheckbox,
    AppInput,
    AppButton,
  },
  data: () => ({
    login: 'test1@afterlogic.com',
    password: '',
    loading: false,
    isTwoFactor: false,
    trustDevice: false,
    isMethodChoosing: false,
    backupCode: '',
    verificationCode: '',
    verificationOption: 'verification', // 'verification', 'backup', 'key'
  }),
  computed: {
    ...mapGetters('user', ['getAuthTokenStatus']),
    disabledVerification() {
      return this.verificationOption === 'verification'
        ? !this.verificationCode
        : !this.backupCode
    },
    code() {
      return this.verificationOption === 'backup'
        ? this.backupCode
        : this.verificationCode
    },
    trustDevicesForDays() {
      const data = settings.getTwoFactorData()
      return data.trustDevicesForDays
    },
    allowUsedDevices() {
      const data = settings.getTwoFactorData()
      return data.allowUsedDevices
    },
  },
  mounted() {
    this.showTrustForm()
  },
  methods: {
    ...mapActions('user', [
      'loginFunc',
      'confirmTwoFactorAuth',
      'trustTheDevice',
      'getUsedDevices',
    ]),
    async proceedLogin() {
      this.loading = true
      try {
        const parameters = {
          Login: this.login,
          Password: this.password,
        }
        const response = await this.loginFunc(parameters)
        if (response?.AuthToken) {
          await this.$router.push('/mail')
        }
        if (response?.TwoFactorAuth) {
          this.isTwoFactor = true
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async verifyCode() {
      this.loading = true
      try {
        const data = {
          Login: this.login,
          Password: this.password,
          Code: this.code,
        }
        await this.confirmTwoFactorAuth(data)
        // await this.showTrustForm()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async goHome() {
      this.loading = true
      try {
        const uuid = VueCookies.get('DeviceId')
        const deviceName = window.navigator.userAgent
        const data = {
          Login: this.login,
          Password: this.password,
          DeviceId: uuid,
          DeviceName: deviceName,
          Trust: this.trustDevice,
        }
        await this.trustTheDevice(data)
        await this.$router.push('/mail')
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    chooseMethod(method) {
      this.isMethodChoosing = false
      this.verificationOption = method
    },
    async showTrustForm() {
      const deviceId = VueCookies.get('DeviceId')
      let isDevice = false
      if (this.getAuthTokenStatus) {
        const deviceData = await this.getUsedDevices({})
        isDevice = !!deviceData.find((device) => device.DeviceId === deviceId)
      }
      if (this.getAuthTokenStatus && this.allowUsedDevices && !isDevice) {
        this.isTwoFactor = true
      } else if (this.getAuthTokenStatus || isDevice) {
        await this.$router.push('/mail')
      }
    },
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
