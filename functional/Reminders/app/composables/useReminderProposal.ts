/**
 * The proposal made once, after the first "Apprendre ce sujet" (FR-002): both channels
 * unticked, 19:00 chosen, and "Plus tard" turns nothing on. The API remembers that it was
 * seen, so no other device of the account makes it again (research R12).
 *
 * The notifications are offered only where they can work; an iPhone outside the installed
 * app is told to install CINQ first (FR-005).
 */
export const useReminderProposal = () => {
  const nuxtApp = useNuxtApp()
  const { t } = useI18n()
  const { notify, notifyError } = useToast()
  const { install } = usePwaInstall()
  const settings = useReminderSettings()
  const pushDevice = usePushDevice()

  const isOpen = useState('reminder-proposal-open', () => false)
  const canOfferPush = useState('reminder-proposal-can-offer-push', () => false)
  const needsInstall = useState('reminder-proposal-needs-install', () => false)
  const wantsPush = useState('reminder-proposal-push', () => false)
  const wantsEmail = useState('reminder-proposal-email', () => false)
  const sendTime = useState('reminder-proposal-time', () => DEFAULT_SEND_TIME)
  const isSaving = ref(false)

  const canActivate = computed(() => wantsPush.value || wantsEmail.value)

  /**
   * A proposal that cannot be loaded is simply not made: the subject is learned all the same.
   */
  const offer = async (): Promise<void> => {
    try {
      await nuxtApp.runWithContext(() => settings.load())
      await pushDevice.inspect()
    } catch {
      return
    }

    const setting = settings.setting.value

    if (
      !setting ||
      setting.proposal_seen_at ||
      setting.email_enabled ||
      setting.devices_count > 0
    ) {
      return
    }

    canOfferPush.value = pushDevice.isReady.value
    needsInstall.value = pushDevice.needsInstall.value
    wantsPush.value = false
    wantsEmail.value = false
    sendTime.value = setting.send_time
    isOpen.value = true
  }

  /**
   * The email does not wait for the device: when only the device fails, the email is turned on
   * all the same and the failure is said once the proposal is closed.
   */
  const activate = async (): Promise<void> => {
    isSaving.value = true

    try {
      const deviceFailed = wantsPush.value && !(await pushDevice.enable())

      if (deviceFailed && !wantsEmail.value) {
        return
      }

      await nuxtApp.runWithContext(() => settings.load())
      await settings.save({
        ...(wantsEmail.value ? { email_enabled: true } : {}),
        send_time: sendTime.value,
      })
      isOpen.value = false

      if (!deviceFailed) {
        notify(t('your reminders are on. you can change them in your account.'))
      } else if (pushDevice.problem.value === 'denied') {
        notifyError(
          t(
            'your email reminders are on. notifications are blocked for this site: allow them in the settings of your browser, then turn them on from your account.',
          ),
        )
      } else {
        notifyError(
          t(
            'your email reminders are on, but this device could not be registered for the notifications. you can try again from your account.',
          ),
        )
      }
    } catch {
      notifyError(t('something went wrong, please try again'))
    } finally {
      isSaving.value = false
    }
  }

  const later = async (): Promise<void> => {
    isOpen.value = false

    try {
      await nuxtApp.runWithContext(() => ReminderSetting.actions('dismiss-proposal', []))
      notify(t('ok. you can turn the reminders on any time from your account.'))
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  return {
    isOpen,
    canOfferPush,
    needsInstall,
    wantsPush,
    wantsEmail,
    sendTime,
    isSaving,
    canActivate,
    problem: pushDevice.problem,
    offer,
    activate,
    later,
    showInstallSteps: install,
  }
}
