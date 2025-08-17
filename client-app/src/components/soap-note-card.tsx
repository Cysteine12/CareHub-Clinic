import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Edit, Trash2, Save, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { type SoapNote } from '../lib/schema'
import API from '../lib/api'

export type SoapNoteCardProps = {
  soapNote: SoapNote & { id?: string }
  created_at?: string
  updated_at?: string
  created_by?: {
    id: string
    first_name: string
    last_name: string
    role_title: string
  }
  updated_by?: {
    id: string
    first_name: string
    last_name: string
    role_title: string
  }
  onUpdate?: (soapNoteId?: string) => void
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export const SoapNoteCard = ({
  soapNote,
  created_at,
  updated_at,
  created_by,
  updated_by,
  onUpdate,
  onDelete,
  canEdit = false,
  canDelete = false,
}: SoapNoteCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedNote, setEditedNote] = useState<SoapNote>(soapNote)

  const handleDelete = async () => {
    if (!soapNote.id || !canDelete) return

    if (
      !confirm(
        'Are you sure you want to delete this SOAP note? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const url = `/api/provider/soapnotes/${soapNote.id}`
      const { data } = await API.delete(url)

      if (data?.success) {
        toast.success('SOAP note deleted successfully')
        if (onDelete) onDelete()
      } else {
        throw new Error(data?.message || 'Failed to delete SOAP note')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete SOAP note')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedNote(soapNote)
  }

  const handleSaveEdit = async () => {
    if (!soapNote.id) return

    setIsUpdating(true)
    try {
      const filterEmpty = (arr: string[] = []) =>
        arr.filter((item) => item?.trim())
      const arrayToObject = (arr: string[] = []) =>
        filterEmpty(arr).reduce(
          (acc, item, i) => ({ ...acc, [`item_${i + 1}`]: item }),
          {}
        )

      const formattedNote = {
        appointment_id: editedNote.appointment_id,
        subjective: {
          symptoms: filterEmpty(editedNote.subjective?.symptoms),
          purpose_of_appointment: filterEmpty(
            editedNote.subjective?.purpose_of_appointment
          ),
          others: editedNote.subjective?.others || '',
        },
        objective: {
          physical_exam_report: filterEmpty(
            editedNote.objective?.physical_exam_report
          ),
          vitals_summary: editedNote.objective?.vitals_summary || {},
          labs: editedNote.objective?.labs || {},
          others: editedNote.objective?.others || '',
        },
        assessment: {
          diagnosis: filterEmpty(editedNote.assessment?.diagnosis),
          differential: filterEmpty(editedNote.assessment?.differential),
        },
        plan: {
          prescription: editedNote.plan?.prescription || [],
          test_requests: Array.isArray(editedNote.plan?.test_requests)
            ? arrayToObject(editedNote.plan.test_requests)
            : editedNote.plan?.test_requests || {},
          recommendation: Array.isArray(editedNote.plan?.recommendation)
            ? arrayToObject(editedNote.plan.recommendation)
            : editedNote.plan?.recommendation || {},
          has_referral: editedNote.plan?.has_referral || false,
          referred_provider_name: editedNote.plan?.referred_provider_name || '',
          others: editedNote.plan?.others || '',
        },
      }

      const url = `${
        import.meta.env.VITE_SERVER_URL
      }/api/provider/soapnotes/update/${soapNote.id}`
      const { data } = await API.put(url, formattedNote)

      if (data?.success) {
        toast.success('SOAP note updated successfully')
        setIsEditing(false)
        if (onUpdate) onUpdate()
      } else {
        throw new Error(data?.message || 'Failed to update SOAP note')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update SOAP note')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedNote(soapNote)
  }

  const [labText, setLabText] = useState(() =>
    typeof soapNote.objective?.labs === 'object' &&
    soapNote.objective?.labs !== null
      ? Object.entries(soapNote.objective.labs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      : ''
  )

  return (
    <Card className="my-4 w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle>SOAP Note</CardTitle>
            <div className="text-xs mt-2">
              Created at:{' '}
              {created_at ? new Date(created_at).toLocaleString() : 'N/A'}
            </div>
            {created_by && (
              <div className="text-xs mt-1">
                Created by:{' '}
                {`${created_by.role_title} ${created_by.first_name} ${created_by.last_name}`}
              </div>
            )}
            {updated_at && updated_at !== created_at && (
              <>
                <div className="text-xs mt-1">
                  Last updated: {new Date(updated_at).toLocaleString()}
                </div>
                {updated_by && (
                  <div className="text-xs mt-1">
                    Updated by:{' '}
                    {`${updated_by.role_title} ${updated_by.first_name} ${updated_by.last_name}`}
                  </div>
                )}
              </>
            )}
          </div>

          {(canEdit || canDelete) && (
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </>
              )}
              {isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subjective Section */}
        {(soapNote.subjective || isEditing) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Subjective</h3>

            <div>
              <h4 className="font-medium mb-2">Symptoms:</h4>
              {isEditing ? (
                <Textarea
                  value={editedNote.subjective?.symptoms?.join('\n') || ''}
                  onChange={(e) =>
                    setEditedNote((prev) => ({
                      ...prev,
                      subjective: {
                        ...prev.subjective,
                        symptoms: e.target.value
                          .split('\n')
                          .filter((line) => line.trim()),
                      },
                    }))
                  }
                  placeholder="Enter symptoms, one per line"
                  className="min-h-[80px]"
                />
              ) : soapNote.subjective?.symptoms &&
                soapNote.subjective.symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {soapNote.subjective.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm">No symptoms recorded</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Purpose of Appointment:</h4>
              {isEditing ? (
                <Textarea
                  value={(
                    (editedNote.subjective?.purpose_of_appointment ??
                      []) as string[]
                  )
                    .map((p) => p.replace(/_/g, ' '))
                    .join('\n')}
                  readOnly
                  className="min-h-[60px] cursor-not-allowed"
                />
              ) : soapNote.subjective?.purpose_of_appointment &&
                soapNote.subjective.purpose_of_appointment.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {soapNote.subjective.purpose_of_appointment.map(
                    (purpose, index) => (
                      <Badge key={index} variant="outline">
                        {purpose.replace(/_/g, ' ')}
                      </Badge>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm">No purpose recorded</p>
              )}
            </div>

            {(soapNote.subjective?.others || isEditing) && (
              <div>
                <h4 className="font-medium mb-2">Additional Notes:</h4>
                {isEditing ? (
                  <Textarea
                    value={editedNote.subjective?.others || ''}
                    onChange={(e) =>
                      setEditedNote((prev) => ({
                        ...prev,
                        subjective: {
                          ...prev.subjective,
                          others: e.target.value,
                        },
                      }))
                    }
                    placeholder="Additional notes"
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm">{soapNote.subjective?.others}</p>
                )}
              </div>
            )}
          </div>
        )}

        <Separator />

        {(soapNote.objective || isEditing) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Objective</h3>

            <div>
              <h4 className="font-medium mb-2">Physical Exam:</h4>
              {isEditing ? (
                <Textarea
                  value={
                    editedNote.objective?.physical_exam_report?.join('\n') || ''
                  }
                  onChange={(e) =>
                    setEditedNote((prev) => ({
                      ...prev,
                      objective: {
                        ...prev.objective,
                        physical_exam_report: e.target.value
                          .split('\n')
                          .filter((line) => line.trim()),
                      },
                    }))
                  }
                  placeholder="Enter physical exam findings, one per line"
                  className="min-h-[80px]"
                />
              ) : soapNote.objective?.physical_exam_report &&
                soapNote.objective.physical_exam_report.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {soapNote.objective.physical_exam_report.map(
                    (exam, index) => (
                      <Badge key={index} variant="secondary">
                        {exam}
                      </Badge>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm">No physical exam findings recorded</p>
              )}
            </div>

            {!isEditing && soapNote.objective?.vitals_summary && (
              <div>
                <h4 className="font-medium mb-2">Vitals Summary:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3rounded-lg">
                  {soapNote.objective.vitals_summary.blood_pressure && (
                    <div className="text-center">
                      <span className="text-xs ">BP</span>
                      <p className="font-medium">
                        {soapNote.objective.vitals_summary.blood_pressure}
                      </p>
                    </div>
                  )}
                  {soapNote.objective.vitals_summary.heart_rate && (
                    <div className="text-center">
                      <span className="text-xs">HR</span>
                      <p className="font-medium">
                        {soapNote.objective.vitals_summary.heart_rate} bpm
                      </p>
                    </div>
                  )}
                  {soapNote.objective.vitals_summary.temperature && (
                    <div className="text-center">
                      <span className="text-xs">Temp</span>
                      <p className="font-medium">
                        {soapNote.objective.vitals_summary.temperature}°F
                      </p>
                    </div>
                  )}
                  {soapNote.objective.vitals_summary.oxygen_saturation && (
                    <div className="text-center">
                      <span className="text-xs">O2 Sat</span>
                      <p className="font-medium">
                        {soapNote.objective.vitals_summary.oxygen_saturation}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(soapNote.objective?.labs &&
              Object.keys(soapNote.objective.labs).length > 0) ||
            isEditing ? (
              <div>
                <h4 className="font-medium mb-2">Lab Results:</h4>
                {isEditing ? (
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
                      setEditedNote({
                        ...soapNote,
                        objective: {
                          ...soapNote.objective,
                          labs: labsObject,
                        },
                      })
                    }}
                  />
                ) : (
                  <div className="p-3 rounded-lg">
                    {soapNote.objective?.labs &&
                      Object.entries(soapNote.objective.labs).map(
                        ([key, value], index) => (
                          <div key={index} className="text-sm mb-1">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="">{value}</span>
                          </div>
                        )
                      )}
                  </div>
                )}
              </div>
            ) : null}

            {(soapNote.objective?.others || isEditing) && (
              <div>
                <h4 className="font-medium mb-2">Additional Findings:</h4>
                {isEditing ? (
                  <Textarea
                    value={editedNote.objective?.others || ''}
                    onChange={(e) =>
                      setEditedNote((prev) => ({
                        ...prev,
                        objective: {
                          ...prev.objective,
                          others: e.target.value,
                        },
                      }))
                    }
                    placeholder="Additional findings"
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm">{soapNote.objective?.others}</p>
                )}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Assessment Section */}
        {(soapNote.assessment || isEditing) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Assessment</h3>

            <div>
              <h4 className="font-medium mb-2">Diagnosis:</h4>
              {isEditing ? (
                <Textarea
                  value={editedNote.assessment?.diagnosis?.join('\n') || ''}
                  onChange={(e) =>
                    setEditedNote((prev) => ({
                      ...prev,
                      assessment: {
                        ...prev.assessment,
                        diagnosis: e.target.value
                          .split('\n')
                          .filter((line) => line.trim()),
                      },
                    }))
                  }
                  placeholder="Enter diagnoses, one per line"
                  className="min-h-[80px]"
                />
              ) : soapNote.assessment?.diagnosis &&
                soapNote.assessment.diagnosis.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {soapNote.assessment.diagnosis.map((diagnosis, index) => (
                    <Badge key={index} variant="default">
                      {diagnosis}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm">No diagnosis recorded</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Differential Diagnosis:</h4>
              {isEditing ? (
                <Textarea
                  value={editedNote.assessment?.differential?.join('\n') || ''}
                  onChange={(e) =>
                    setEditedNote((prev) => ({
                      ...prev,
                      assessment: {
                        ...prev.assessment,
                        differential: e.target.value
                          .split('\n')
                          .filter((line) => line.trim()),
                      },
                    }))
                  }
                  placeholder="Enter differential diagnoses, one per line"
                  className="min-h-[80px]"
                />
              ) : soapNote.assessment?.differential &&
                soapNote.assessment.differential.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {soapNote.assessment.differential.map((diff, index) => (
                    <Badge key={index} variant="outline">
                      {diff}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm">No differential diagnosis recorded</p>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Plan Section */}
        {(soapNote.plan || isEditing) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Plan</h3>

            {!isEditing &&
              soapNote.plan?.prescription &&
              soapNote.plan.prescription.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Prescriptions:</h4>
                  <div className="space-y-2">
                    {soapNote.plan.prescription.map((prescription, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium">
                          {prescription.medication_name}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Dosage:</span>{' '}
                          {prescription.dosage} |
                          <span className="font-medium"> Frequency:</span>{' '}
                          {prescription.frequency} |
                          <span className="font-medium"> Duration:</span>{' '}
                          {prescription.duration}
                        </div>
                        {prescription.instructions && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">Instructions:</span>{' '}
                            {prescription.instructions}
                          </div>
                        )}
                        <div className="text-xs mt-1">
                          Start Date:{' '}
                          {new Date(
                            prescription.start_date
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <h4 className="font-medium mb-2">Test Requests:</h4>
              {isEditing ? (
                <Textarea
                  value={
                    Array.isArray(editedNote.plan?.test_requests)
                      ? editedNote.plan.test_requests.join('\n')
                      : typeof editedNote.plan?.test_requests === 'object'
                      ? Object.values(editedNote.plan.test_requests || {}).join(
                          '\n'
                        )
                      : ''
                  }
                  onChange={(e) => {
                    const values = e.target.value
                      .split('\n')
                      .filter((line) => line.trim())
                    setEditedNote((prev) => ({
                      ...prev,
                      plan: {
                        ...prev.plan,
                        test_requests: values,
                      },
                    }))
                  }}
                  placeholder="Enter test requests, one per line"
                  className="min-h-[80px]"
                />
              ) : soapNote.plan?.test_requests ? (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(soapNote.plan.test_requests)
                    ? soapNote.plan.test_requests.map((test, index) => (
                        <Badge key={index} variant="secondary">
                          {test}
                        </Badge>
                      ))
                    : Object.values(soapNote.plan.test_requests).map(
                        (test, index) => (
                          <Badge key={index} variant="secondary">
                            {test}
                          </Badge>
                        )
                      )}
                </div>
              ) : (
                <p className="text-sm">No test requests recorded</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommendations:</h4>
              {isEditing ? (
                <Textarea
                  value={
                    Array.isArray(editedNote.plan?.recommendation)
                      ? editedNote.plan.recommendation.join('\n')
                      : typeof editedNote.plan?.recommendation === 'object'
                      ? Object.values(
                          editedNote.plan.recommendation || {}
                        ).join('\n')
                      : ''
                  }
                  onChange={(e) => {
                    const values = e.target.value
                      .split('\n')
                      .filter((line) => line.trim())
                    setEditedNote((prev) => ({
                      ...prev,
                      plan: {
                        ...prev.plan,
                        recommendation: values,
                      },
                    }))
                  }}
                  placeholder="Enter recommendations, one per line"
                  className="min-h-[80px]"
                />
              ) : soapNote.plan?.recommendation ? (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(soapNote.plan.recommendation)
                    ? soapNote.plan.recommendation.map((rec, index) => (
                        <Badge key={index} variant="secondary">
                          {rec}
                        </Badge>
                      ))
                    : Object.values(soapNote.plan.recommendation).map(
                        (rec, index) => (
                          <Badge key={index} variant="secondary">
                            {rec}
                          </Badge>
                        )
                      )}
                </div>
              ) : (
                <p className="text-sm">No recommendations recorded</p>
              )}
            </div>

            {(soapNote.plan?.has_referral || isEditing) && (
              <div>
                <h4 className="font-medium mb-2">Referral:</h4>
                {isEditing ? (
                  <Input
                    value={editedNote.plan?.referred_provider_name || ''}
                    onChange={(e) =>
                      setEditedNote((prev) => ({
                        ...prev,
                        plan: {
                          ...prev.plan,
                          referred_provider_name: e.target.value,
                          has_referral: !!e.target.value,
                        },
                      }))
                    }
                    placeholder="Referred provider name"
                  />
                ) : soapNote.plan?.has_referral &&
                  soapNote.plan?.referred_provider_name ? (
                  <Badge variant="secondary">
                    Referred to: {soapNote.plan.referred_provider_name}
                  </Badge>
                ) : (
                  <p className="text-sm">No referral made</p>
                )}
              </div>
            )}

            {(soapNote.plan?.others || isEditing) && (
              <div>
                <h4 className="font-medium mb-2">Additional Plan Notes:</h4>
                {isEditing ? (
                  <Textarea
                    value={editedNote.plan?.others || ''}
                    onChange={(e) =>
                      setEditedNote((prev) => ({
                        ...prev,
                        plan: {
                          ...prev.plan,
                          others: e.target.value,
                        },
                      }))
                    }
                    placeholder="Additional plan notes"
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm">{soapNote.plan?.others}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
