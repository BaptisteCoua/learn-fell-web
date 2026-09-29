export interface IReminderChanges {
  email_enabled?: boolean
  send_time?: string
}

const FIRST_SLOT_MINUTES = 6 * 60
const SLOT_COUNT = 36

const asTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/**
 * Every half hour from 06:00 to 23:30 (FR-003).
 */
export const SEND_TIMES = Array.from({ length: SLOT_COUNT }, (_, index) =>
  asTime(FIRST_SLOT_MINUTES + index * 30),
)

export const DEFAULT_SEND_TIME = '19:00'

/**
 * The reminder settings of the signed-in account and the devices that show its reminders.
 */
export const useReminderSettings = () => {
  const nuxtApp = useNuxtApp()

  const setting = shallowRef<ReminderSetting | null>(null)
  const devices = shallowRef<PushSubscription[]>([])

  const emailEnabled = computed(() => setting.value?.email_enabled ?? false)
  const sendTime = computed(() => setting.value?.send_time ?? DEFAULT_SEND_TIME)

  const load = async (): Promise<void> => {
    const [[settings], [deviceList]] = await nuxtApp.runWithContext(() =>
      Promise.all([
        ReminderSetting.query().limit(1).get(),
        PushSubscription.query().limit(50).get(),
      ]),
    )
    setting.value = Array.from(settings)[0] ?? null
    devices.value = Array.from(deviceList)
  }

  const save = async (changes: IReminderChanges): Promise<void> => {
    if (!setting.value) {
      return
    }

    if (changes.email_enabled !== undefined) {
      setting.value.email_enabled = changes.email_enabled
    }

    if (changes.send_time !== undefined) {
      setting.value.send_time = changes.send_time
    }

    await setting.value.save()
    await load()
  }

  const removeDevice = async (device: PushSubscription): Promise<void> => {
    await device.delete()
    await load()
  }

  return { setting, devices, emailEnabled, sendTime, load, save, removeDevice }
}
