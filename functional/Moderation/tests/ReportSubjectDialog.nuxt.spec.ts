import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportSubjectDialog from '../app/components/ReportSubjectDialog.vue'
import { dialogText, stubApi } from './support'

const openDialog = async () => {
  const dialog = await mountSuspended(ReportSubjectDialog, {
    props: { subjectId: 25 },
    attachTo: document.body,
  })
  await dialog.find('button').trigger('click')
  await flushPromises()

  return dialog
}

const bodyButton = (text: string) =>
  [...document.body.querySelectorAll<HTMLButtonElement>('.report-subject__panel button')].find(
    (button) => button.textContent?.includes(text),
  )

describe('ReportSubjectDialog', () => {
  it('offers the five reasons and asks for one before sending', async () => {
    const calls = stubApi({ 'reports/mutate': () => ({ created: [1], updated: [] }) })
    await openDialog()

    const reasons = [...document.body.querySelectorAll('.report-subject__reason')].map((label) =>
      label.textContent?.trim(),
    )
    expect(reasons).toEqual([
      'Contenu inapproprié',
      'Contenu erroné',
      'Spam',
      "Droits d'auteur",
      'Autre',
    ])

    bodyButton('Envoyer le signalement')?.click()
    await flushPromises()

    expect(dialogText()).toContain('Choisissez un motif.')
    expect(calls.some((call) => call.path === 'reports/mutate')).toBe(false)
  })

  it('sends the report and confirms that the subject stays visible', async () => {
    const calls = stubApi({ 'reports/mutate': () => ({ created: [1], updated: [] }) })
    await openDialog()

    document.body.querySelector<HTMLInputElement>('input[value="copyright"]')?.click()
    const comment = document.body.querySelector<HTMLTextAreaElement>(
      '.report-subject__panel textarea',
    )!
    comment.value = 'Copié d’une méthode publiée.'
    comment.dispatchEvent(new Event('input'))
    bodyButton('Envoyer le signalement')?.click()
    await flushPromises()

    expect(calls.find((call) => call.path === 'reports/mutate')?.body).toEqual({
      mutate: [
        {
          operation: 'create',
          attributes: {
            subject_id: 25,
            reason: 'copyright',
            comment: 'Copié d’une méthode publiée.',
          },
        },
      ],
    })
    expect(dialogText()).toContain('Merci, votre signalement est enregistré.')
  })

  it('says so when a report is already pending', async () => {
    stubApi({
      'reports/mutate': () => {
        throw Object.assign(new Error('pending'), {
          statusCode: 409,
          data: { code: 'report_already_pending', message: 'Déjà signalé.' },
        })
      },
    })
    await openDialog()

    document.body.querySelector<HTMLInputElement>('input[value="spam"]')?.click()
    bodyButton('Envoyer le signalement')?.click()
    await flushPromises()

    expect(dialogText()).toContain('Vous avez déjà signalé ce sujet.')
  })
})
