import { useEffect, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Activity, Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import type { SoapNote } from '../types'
import type { RecordSoapNoteSchema } from '../schema'
import { useRecordSoapNote } from '../hook'
import type { AppointmentPurposes } from '../../appointments/types'
import type { Vital } from '../../vitals/types'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'

type SoapNoteFormDialogProps = {
  appointmentId: string
  appointmentPurposes: AppointmentPurposes
  appointmentVital: Vital | undefined
  appointmentSoapNote: SoapNote | undefined
}

export default function SoapNoteFormDialog({
  appointmentId,
  appointmentPurposes,
  appointmentVital,
  appointmentSoapNote,
}: SoapNoteFormDialogProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { mutate: recordSoapNote, isPending } = useRecordSoapNote(appointmentId)
  const [soapNote, setSoapNote] = useState<RecordSoapNoteSchema>({
    appointment_id: appointmentId,
    subjective: {
      symptoms: [],
      purposes_of_appointment: appointmentPurposes,
      others: '',
    },
    objective: {
      physical_exam_report: [],
      vitals_summary: appointmentVital,
      labs: '',
      others: '',
    },
    assessment: {
      diagnosis: [],
      differential: [],
    },
    plan: {
      prescriptions: [],
      test_requests: [],
      recommendations: [],
      has_referral: false,
      referred_provider_name: '',
      others: '',
    },
  })

  const formattedVital = useMemo((): string[] => {
    if (!appointmentVital) return []
    const ignoredVital: (keyof Vital)[] = [
      'id',
      'appointment_id',
      'created_at',
      'created_by_id',
      'updated_at',
    ]

    const response: string[] = []
    Object.keys(appointmentVital).forEach((key: unknown) => {
      if (
        typeof key === 'string' &&
        !ignoredVital.includes(key as keyof Vital)
      ) {
        response.push(
          `• ${key.replace('_', ' ').toUpperCase()}: ${
            appointmentVital[key as keyof Vital] || 'N/A'
          }`
        )
      }
    })

    return response
  }, [appointmentVital])

  useEffect(() => {
    if (appointmentSoapNote) setSoapNote(appointmentSoapNote)
  }, [appointmentSoapNote])

  const handleSoapNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    recordSoapNote(soapNote)
    buttonRef?.current?.click()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button ref={buttonRef} onClick={() => {}}>
          {appointmentSoapNote ? 'Update Note' : 'Record Note'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-12" />
            Record Note
          </DialogTitle>
          <DialogDescription>
            Enter patient examinations, treatments and recommendations data
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => handleSoapNoteSubmit(e)} className="space-y-4">
          <Tabs defaultValue="subjective" className="">
            <TabsList className="mx-auto">
              <TabsTrigger value="subjective">Subjective</TabsTrigger>
              <TabsTrigger value="objective">Objective</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="subjective">
              <label className="text-sm font-medium">
                Patient's Symptoms & History
              </label>
              <Textarea
                placeholder="Patient's description of symptoms, history of present illness, review of symptoms..."
                value={(soapNote.subjective?.symptoms ?? []).join('\n')}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    subjective: {
                      ...soapNote.subjective,
                      symptoms: e.target.value.split('\n'),
                    },
                  })
                }
                className="mb-4"
              />

              <label className="text-sm font-medium">
                Purpose of Appointment
              </label>
              <Textarea
                placeholder="Purpose of appointment..."
                value={soapNote.subjective?.purposes_of_appointment
                  ?.map((apptPurpose) => apptPurpose?.replace('_', ' '))
                  ?.join('/n')}
                readOnly
                className="mb-4 cursor-not-allowed"
              />

              <label className="text-sm font-medium">Review of Symptoms</label>
              <Textarea
                placeholder="Review of symptoms..."
                value={soapNote.subjective?.others}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    subjective: {
                      ...soapNote.subjective,
                      others: e.target.value,
                    },
                  })
                }
                className="mb-4"
              />
            </TabsContent>

            <TabsContent value="objective">
              <label className="text-sm font-medium">
                Physical Examination
              </label>
              <Textarea
                placeholder="Physical examination findings..."
                value={(soapNote.objective?.physical_exam_report ?? []).join(
                  '\n'
                )}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    objective: {
                      ...soapNote.objective,
                      physical_exam_report: e.target.value.split('\n'),
                    },
                  })
                }
                className="mb-4"
              />

              <label className="text-sm font-medium">Vitals</label>
              <Textarea
                placeholder="Vitals..."
                value={formattedVital.join('\n')}
                readOnly
                className="mb-4 cursor-not-allowed"
              />

              <label className="text-sm font-medium">Lab Results</label>
              <Textarea
                className="mb-4"
                placeholder="Enter lab results, one per line. Format: Test Name: Result and details"
                value={soapNote.objective?.labs}
                onChange={(e) => {
                  setSoapNote({
                    ...soapNote,
                    objective: {
                      ...soapNote.objective,
                      labs: e.target.value,
                    },
                  })
                }}
              />

              <label className="text-sm font-medium">Other Observations</label>
              <Textarea
                placeholder="Any other observations..."
                value={soapNote.objective?.others}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    objective: {
                      ...soapNote.objective,
                      others: e.target.value,
                    },
                  })
                }
                className="mb-4"
              />
            </TabsContent>

            <TabsContent value="assessment">
              <label className="text-sm font-medium">
                Diagnosis & Clinical Impressions
              </label>
              <Textarea
                placeholder="Diagnosis, Clinical impression, problem list..."
                value={(soapNote.assessment?.diagnosis ?? []).join('\n')}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    assessment: {
                      ...soapNote.assessment,
                      diagnosis: e.target.value.split('\n'),
                    },
                  })
                }
                className="mb-4"
              />

              <label className="text-sm font-medium">
                Differential Diagnosis
              </label>
              <Textarea
                placeholder="Differential diagnosis..."
                value={(soapNote.assessment?.differential ?? []).join('\n')}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    assessment: {
                      ...soapNote.assessment,
                      differential: e.target.value.split('\n'),
                    },
                  })
                }
                className="mb-4"
              />
            </TabsContent>

            <TabsContent value="plan">
              <label className="text-sm font-medium">Prescription Plan</label>
              <div className="space-y-4">
                {(soapNote.plan?.prescriptions ?? []).length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSoapNote({
                        ...soapNote,
                        plan: {
                          ...soapNote.plan,
                          prescriptions: [
                            ...(soapNote.plan?.prescriptions ?? []),
                            {
                              medication_name: '',
                              dosage: '',
                              frequency: '',
                              duration: '',
                              instructions: '',
                              start_date: new Date(),
                            },
                          ],
                        },
                      })
                    }
                  >
                    Add Prescription
                  </Button>
                )}
                {(soapNote.plan?.prescriptions ?? []).map(
                  (prescription, index) => (
                    <div key={index} className="border rounded p-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          Prescription {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [
                              ...(soapNote.plan?.prescriptions ?? []),
                            ]
                            updated.splice(index, 1)
                            setSoapNote({
                              ...soapNote,
                              plan: {
                                ...soapNote.plan,
                                prescriptions: updated,
                              },
                            })
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <Input
                        placeholder="Medication Name"
                        value={prescription.medication_name}
                        onChange={(e) => {
                          const updated = [
                            ...(soapNote.plan?.prescriptions ?? []),
                          ]
                          updated[index].medication_name = e.target.value
                          setSoapNote({
                            ...soapNote,
                            plan: { ...soapNote.plan, prescriptions: updated },
                          })
                        }}
                      />
                      <Input
                        placeholder="Dosage"
                        value={prescription.dosage}
                        onChange={(e) => {
                          const updated = [
                            ...(soapNote.plan?.prescriptions ?? []),
                          ]
                          updated[index].dosage = e.target.value
                          setSoapNote({
                            ...soapNote,
                            plan: { ...soapNote.plan, prescriptions: updated },
                          })
                        }}
                      />
                      <Input
                        placeholder="Frequency"
                        value={prescription.frequency}
                        onChange={(e) => {
                          const updated = [
                            ...(soapNote.plan?.prescriptions ?? []),
                          ]
                          updated[index].frequency = e.target.value
                          setSoapNote({
                            ...soapNote,
                            plan: { ...soapNote.plan, prescriptions: updated },
                          })
                        }}
                      />
                      <Input
                        placeholder="Duration"
                        value={prescription.duration}
                        onChange={(e) => {
                          const updated = [
                            ...(soapNote.plan?.prescriptions ?? []),
                          ]
                          updated[index].duration = e.target.value
                          setSoapNote({
                            ...soapNote,
                            plan: { ...soapNote.plan, prescriptions: updated },
                          })
                        }}
                      />
                      <Textarea
                        placeholder="Instructions"
                        value={prescription.instructions}
                        onChange={(e) => {
                          const updated = [
                            ...(soapNote.plan?.prescriptions ?? []),
                          ]
                          updated[index].instructions = e.target.value
                          setSoapNote({
                            ...soapNote,
                            plan: { ...soapNote.plan, prescriptions: updated },
                          })
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              <label className="text-sm font-medium">Test Requests</label>
              <Textarea
                placeholder="Test requests (one per line)..."
                value={(soapNote.plan?.test_requests ?? []).join('\n')}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    plan: {
                      ...soapNote.plan,
                      test_requests: e.target.value.split('\n'),
                    },
                  })
                }
                className="mb-4"
              />

              <label className="text-sm font-medium">Recommendations</label>
              <Textarea
                placeholder="Recommendations (one per line)..."
                value={(soapNote.plan?.recommendations ?? []).join('\n')}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    plan: {
                      ...soapNote.plan,
                      recommendations: e.target.value.split('\n'),
                    },
                  })
                }
                className="mb-4"
              />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label htmlFor="has-referral" className="mb-0">
                    Referral?
                  </label>
                  <input
                    id="has-referral"
                    type="checkbox"
                    checked={soapNote.plan?.has_referral ?? false}
                    onChange={(e) =>
                      setSoapNote({
                        ...soapNote,
                        plan: {
                          ...soapNote.plan,
                          has_referral: e.target.checked,
                          referred_provider_name: e.target.checked
                            ? soapNote.plan?.referred_provider_name ?? ''
                            : '',
                        },
                      })
                    }
                  />
                </div>

                {soapNote.plan?.has_referral && (
                  <>
                    <label className="text-sm font-medium">
                      Referred provider name
                    </label>
                    <Input
                      id="referred-provider-name"
                      placeholder="Referred provider name"
                      value={soapNote.plan?.referred_provider_name ?? ''}
                      onChange={(e) =>
                        setSoapNote({
                          ...soapNote,
                          plan: {
                            ...soapNote.plan,
                            referred_provider_name: e.target.value,
                          },
                        })
                      }
                      className="ml-2"
                    />
                  </>
                )}
              </div>

              <label className="text-sm font-medium">Other Plans</label>
              <Textarea
                id="plan-others"
                placeholder="Other plan details..."
                value={soapNote.plan?.others ?? ''}
                onChange={(e) =>
                  setSoapNote({
                    ...soapNote,
                    plan: {
                      ...soapNote.plan,
                      others: e.target.value,
                    },
                  })
                }
                className="mb-4"
              />
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full">
            {isPending ? (
              <>
                <Loader2 className="animate-spin size-6" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
