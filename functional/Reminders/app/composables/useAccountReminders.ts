/**
 * The "Rappels" section of the account page (FR-003 to FR-006): the email channel, the time,
 * and the devices, each turned off on its own.
 */
export const useAccountReminders = async () => {
  const { t } = useI18n()
  const { notify, notifyError } = useToast()
  const { install } = usePwaInstall()
  const settings = useReminderSettings()
  const pushDevice = usePushDevice()

  const isBusy = ref(false)

  const canEnableHere = computed(
    () =>
      pushDevice.isReady.value &&
      !settings.devices.value.some((device) => pushDevice.isCurrent(device)),
  )

  const run = async (change: () => Promise<void>, confirmation: string): Promise<void> => {
    isBusy.value = true

    try {
      await change()
      notify(confirmation)
    } catch {
      notifyError(t('something went wrong, please try again'))
    } finally {
      isBusy.value = false
    }
  }

  const changeEmail = (enabled: boolean): Promise<void> =>
    run(
      () => settings.save({ email_enabled: enabled }),
      enabled
        ? t('you will receive the reminders by email.')
        : t('you will no longer receive the reminders by email.'),
    )

  const changeTime = (time: string): Promise<void> =>
    run(
      () => settings.save({ send_time: time }),
      t('your reminders will come at {time}.', { time }),
    )

  const enableHere = async (): Promise<void> => {
    isBusy.value = true

    try {
      if (await pushDevice.enable()) {
        await settings.load()
        notify(t('this device will show the reminders.'))
      }
    } finally {
      isBusy.value = false
    }
  }

  const turnOff = (device: PushSubscription): Promise<void> =>
    run(
      async () => {
        await pushDevice.forget(device)
        await settings.removeDevice(device)
      },
      t('“{device}” will no longer show the reminders.', { device: device.device_label }),
    )

  await settings.load()

  if (import.meta.client) {
    await pushDevice.inspect()
  }

  return {
    emailEnabled: settings.emailEnabled,
    sendTime: settings.sendTime,
    devices: settings.devices,
    problem: pushDevice.problem,
    needsInstall: pushDevice.needsInstall,
    isSupported: pushDevice.isSupported,
    isReady: pushDevice.isReady,
    isCurrent: pushDevice.isCurrent,
    canEnableHere,
    isBusy,
    changeEmail,
    changeTime,
    enableHere,
    turnOff,
    showInstallSteps: install,
  }
}
