import { Textarea } from './ui/textarea'
import { Input } from '../components/ui/input'
import { Button } from './ui/button'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { type SoapNote } from '../lib/schema'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'

export default function SoapNoteDialog({
  appointmentId,
  vitals,
  purposes,
  setAppointmentId,
  showAsDialog = true,
  onSoapNoteSaved,
  appointment,
}: {
  appointmentId: string
  vitals: Record<string, any>
  purposes: string[]
  setAppointmentId: React.Dispatch<React.SetStateAction<string | null>>
  showAsDialog?: boolean
  onSoapNoteSaved?: () => void
  appointment?: any
}) {
  const navigate = useNavigate()
  const [soapNote, setSoapNote] = useState<SoapNote>({
    appointment_id: appointmentId,
    subjective: {
      symptoms: [],
      purpose_of_appointment: purposes,
      others: '',
    },
    objective: {
      physical_exam_report: [],
      vitals_summary: vitals,
      labs: {},
      others: '',
    },
    assessment: {
      diagnosis: [],
      differential: [],
    },
    plan: {
      prescription: [],
      test_requests: [],
      recommendation: [],
      has_referral: false,
      referred_provider_name: '',
      others: '',
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_saved, setSaved] = useState(false)

  const handleNavigateToVitalsSoap = () => {
    setAppointmentId(appointmentId)
    navigate(`/provider/vitals/${appointmentId}`, {
      state: { appointment }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const filterEmpty = (arr: string[] = []) =>
        arr.filter((item) => item?.trim())
      const arrayToObject = (arr: string[] = []) =>
        filterEmpty(arr).reduce(
          (acc, item, i) => ({ ...acc, [`item_${i + 1}`]: item }),
          {}
        )

      const formattedSoapNote = {
        appointment_id: soapNote.appointment_id,
        subjective: {
          symptoms: filterEmpty(soapNote.subjective?.symptoms),
          purpose_of_appointment: soapNote.subjective?.purpose_of_appointment,
          others: soapNote.subjective?.others || '',
        },
        objective: {
          physical_exam_report: filterEmpty(
            soapNote.objective?.physical_exam_report
          ),
          vitals_summary: soapNote.objective?.vitals_summary || {},
          labs: soapNote.objective?.labs || {},
          others: soapNote.objective?.others || '',
        },
        assessment: {
          diagnosis: filterEmpty(soapNote.assessment?.diagnosis),
          differential: filterEmpty(soapNote.assessment?.differential),
        },
        plan: {
          prescription: soapNote.plan?.prescription || [],
          test_requests: Array.isArray(soapNote.plan?.test_requests)
            ? arrayToObject(soapNote.plan.test_requests)
            : soapNote.plan?.test_requests || {},
          recommendation: Array.isArray(soapNote.plan?.recommendation)
            ? arrayToObject(soapNote.plan.recommendation)
            : soapNote.plan?.recommendation || {},
          has_referral: soapNote.plan?.has_referral || false,
          referred_provider_name: soapNote.plan?.referred_provider_name || '',
          others: soapNote.plan?.others || '',
        },
      }

      console.log('SoapNote:', formattedSoapNote)
      const url = `${
        import.meta.env.VITE_SERVER_URL
      }/api/provider/soapnotes/record`
      const { data } = await API.post(url, formattedSoapNote)

      if (!data?.success) {
        console.error('Server response:', data)
        if (data.errors) {
          console.error('Validation errors:', data.errors)
        }
        throw new Error(data.message || 'Failed to submit SOAP note')
      }
      setSaved(true)

      toast.success('SOAP note saved successfully!')
      console.log('SOAP note saved successfully:', data)

      if (onSoapNoteSaved) {
        onSoapNoteSaved()
      }

      // Reset form or show toast here
    } catch (error) {
      console.error('SOAP Note Error:', error)
      toast.error('Failed to save SOAP note. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
    // Reset form
    setSoapNote({
      appointment_id: appointmentId,
      subjective: {
        symptoms: [],
        purpose_of_appointment: purposes,
        others: '',
      },
      objective: {
        physical_exam_report: [],
        vitals_summary: vitals,
        labs: {},
        others: '',
      },
      assessment: {
        diagnosis: [],
        differential: [],
      },
      plan: {
        prescription: [],
        test_requests: [],
        recommendation: [],
        has_referral: false,
        referred_provider_name: '',
        others: '',
      },
    })
  }

  const existingVitals = soapNote.objective?.vitals_summary
  const excludeFields = [
    'id',
    'created_by_id',
    'appointment_id',
    'created_at',
    'updated_at',
  ]
  const vitalsText = existingVitals
    ? Object.entries(existingVitals)
        .filter(([key]) => !excludeFields.includes(key))
        .map(([key, value]) => {
          const valueStr =
            typeof value === 'string' ? value : JSON.stringify(value)
          return `${key.replace(/_/g, ' ')}: ${valueStr.replace(
            /null/g,
            'none'
          )}`
        })
        .join('\n')
    : ''

  const [labText, setLabText] = useState(() =>
    typeof soapNote.objective?.labs === 'object' &&
    soapNote.objective?.labs !== null
      ? Object.entries(soapNote.objective.labs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      : ''
  )

  const soapContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Subjective</label>
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
        />
        <Textarea
          placeholder="Purpose of appointment..."
          value={(soapNote.subjective?.purpose_of_appointment ?? [])
            .map((item) => item.replace(/_/g, ' '))
            .join('\n')}
          readOnly
          className="cursor-not-allowed"
        />
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
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Objective</label>
        <Textarea
          placeholder="Physical examination findings..."
          value={soapNote.objective?.physical_exam_report}
          onChange={(e) =>
            setSoapNote({
              ...soapNote,
              objective: {
                ...soapNote.objective,
                physical_exam_report: e.target.value.split('\n'),
              },
            })
          }
        />
        <Textarea
          placeholder="Vitals..."
          value={vitalsText}
          readOnly
          className="cursor-not-allowed"
        />
        <Textarea
          placeholder="Enter lab results, one per line. Format: Test Name: Result and details
          Examples:
          CBC: WBC 5.5 k/uL within normal limits  
          Glucose: 95 mg/dL fasting
          Cholesterol: Total 180 mg/dL, LDL 110 mg/dL"
          value={labText}
          onChange={(e) => setLabText(e.target.value)}
          onBlur={() => {
            const labsObject: Record<string, string> = {}
            if (labText) {
              const lines = labText.split('\n')
              lines.forEach((line, index) => {
                if (line.includes(':')) {
                  const colonIndex = line.indexOf(':')
                  const key = line.substring(0, colonIndex).trim()
                  const value = line.substring(colonIndex + 1).trim()
                  if (key) {
                    labsObject[key] = value || ''
                  }
                } else if (line.trim()) {
                  labsObject[`result_${index + 1}`] = line.trim()
                }
              })
            }
            setSoapNote({
              ...soapNote,
              objective: {
                ...soapNote.objective,
                labs: labsObject,
              },
            })
          }}
        />
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
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assessment</label>
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
        />
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
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Plan</label>
        <div className="space-y-4">
          {(soapNote.plan?.prescription ?? []).length === 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setSoapNote({
                  ...soapNote,
                  plan: {
                    ...soapNote.plan,
                    prescription: [
                      ...(soapNote.plan?.prescription ?? []),
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
          {(soapNote.plan?.prescription ?? []).map((prescription, index) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Prescription {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updated = [...(soapNote.plan?.prescription ?? [])]
                    updated.splice(index, 1)
                    setSoapNote({
                      ...soapNote,
                      plan: { ...soapNote.plan, prescription: updated },
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
                  const updated = [...(soapNote.plan?.prescription ?? [])]
                  updated[index].medication_name = e.target.value
                  setSoapNote({
                    ...soapNote,
                    plan: { ...soapNote.plan, prescription: updated },
                  })
                }}
              />
              <Input
                placeholder="Dosage"
                value={prescription.dosage}
                onChange={(e) => {
                  const updated = [...(soapNote.plan?.prescription ?? [])]
                  updated[index].dosage = e.target.value
                  setSoapNote({
                    ...soapNote,
                    plan: { ...soapNote.plan, prescription: updated },
                  })
                }}
              />
              <Input
                placeholder="Frequency"
                value={prescription.frequency}
                onChange={(e) => {
                  const updated = [...(soapNote.plan?.prescription ?? [])]
                  updated[index].frequency = e.target.value
                  setSoapNote({
                    ...soapNote,
                    plan: { ...soapNote.plan, prescription: updated },
                  })
                }}
              />
              <Input
                placeholder="Duration"
                value={prescription.duration}
                onChange={(e) => {
                  const updated = [...(soapNote.plan?.prescription ?? [])]
                  updated[index].duration = e.target.value
                  setSoapNote({
                    ...soapNote,
                    plan: { ...soapNote.plan, prescription: updated },
                  })
                }}
              />
              <Textarea
                placeholder="Instructions"
                value={prescription.instructions}
                onChange={(e) => {
                  const updated = [...(soapNote.plan?.prescription ?? [])]
                  updated[index].instructions = e.target.value
                  setSoapNote({
                    ...soapNote,
                    plan: { ...soapNote.plan, prescription: updated },
                  })
                }}
              />
            </div>
          ))}
        </div>
        <Textarea
          placeholder="Test requests (one per line)..."
          value={(soapNote.plan?.test_requests ?? []).join('\n')}
          onChange={(e) =>
            setSoapNote({
              ...soapNote,
              plan: {
                ...soapNote.plan,
                test_requests: e.target.value
                  .split('\n')
                  .filter((test) => test.trim() !== ''),
              },
            })
          }
        />
        <Textarea
          placeholder="Recommendations (one per line)..."
          value={(soapNote.plan?.recommendation ?? []).join('\n')}
          onChange={(e) =>
            setSoapNote({
              ...soapNote,
              plan: {
                ...soapNote.plan,
                recommendation: e.target.value
                  .split('\n')
                  .filter((rec) => rec.trim() !== ''),
              },
            })
          }
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
          )}
        </div>
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
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        onClick={() => setAppointmentId(appointmentId)}
      >
        {isSubmitting ? (
          'Saving...'
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save SOAP Note
          </>
        )}
      </Button>
    </form>
  )

  if (!showAsDialog) {
    return soapContent
  }

  return (
    <Button
      onClick={handleNavigateToVitalsSoap}
      variant="outline"
      size="sm"
    >
      SOAP Note
    </Button>
  )
}
