import { Eye, FileText } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import type { SoapNote } from '../types'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { Badge } from '../../../components/ui/badge'

const SoapNoteCard = ({ soapNote }: { soapNote: SoapNote }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Eye />
          View Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-12" />
            Clinical Note
          </DialogTitle>
          <DialogDescription>
            Patient accessments and treatment plans
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="subjective" className="">
          <TabsList className="mx-auto">
            <TabsTrigger value="subjective">Subjective</TabsTrigger>
            <TabsTrigger value="objective">Objective</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="subjective">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Subjective</h3>

              <div>
                <h4 className="font-medium mb-2">Symptoms:</h4>
                {soapNote.subjective?.symptoms &&
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
                {soapNote.subjective?.purposes_of_appointment &&
                soapNote.subjective.purposes_of_appointment.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {soapNote.subjective.purposes_of_appointment.map(
                      (purpose, index) => (
                        <Badge key={index} variant="outline">
                          {purpose.replace('_', ' ')}
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm">No purpose recorded</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Additional Notes:</h4>
                {soapNote.subjective?.others ? (
                  <p className="text-sm">{soapNote.subjective?.others}</p>
                ) : (
                  <p className="text-sm">No additional note provided</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="objective">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Objective</h3>

              <div>
                <h4 className="font-medium mb-2">Physical Exam:</h4>
                {soapNote.objective?.physical_exam_report &&
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

              {soapNote.objective?.vitals_summary && (
                <div>
                  <h4 className="font-medium mb-2">Vitals Summary:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3rounded-lg">
                    {soapNote.objective.vitals_summary.blood_pressure && (
                      <div className="text-center">
                        <span className="text-xs ">BP</span>
                        <p className="font-medium">
                          {soapNote.objective.vitals_summary.blood_pressure}mmHg
                        </p>
                      </div>
                    )}
                    {soapNote.objective.vitals_summary.respiratory_rate && (
                      <div className="text-center">
                        <span className="text-xs ">Resp R</span>
                        <p className="font-medium">
                          {soapNote.objective.vitals_summary.respiratory_rate}
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
                          {soapNote.objective.vitals_summary.temperature}°C
                        </p>
                      </div>
                    )}
                    {soapNote.objective.vitals_summary.bmi && (
                      <div className="text-center">
                        <span className="text-xs">BMI</span>
                        <p className="font-medium">
                          {soapNote.objective.vitals_summary.bmi}
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

              <div>
                <h4 className="font-medium mb-2">Lab Results:</h4>
                <div className="p-3 rounded-lg">
                  {soapNote.objective?.labs
                    ? soapNote.objective?.labs
                    : 'No lab note recorded'}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Additional Findings:</h4>
                <p className="text-sm">
                  {soapNote.objective?.others
                    ? soapNote.objective?.others
                    : 'No additional note'}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assessment">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Assessment</h3>

              <div>
                <h4 className="font-medium mb-2">Diagnosis:</h4>
                {soapNote.assessment?.diagnosis &&
                soapNote.assessment?.diagnosis?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {soapNote.assessment?.diagnosis?.map((diagnosis, index) => (
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
                {soapNote.assessment?.differential &&
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
          </TabsContent>

          <TabsContent value="plan">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Plan</h3>

              {soapNote.plan?.prescriptions &&
                soapNote.plan.prescriptions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prescriptions:</h4>
                    <div className="space-y-2">
                      {soapNote.plan.prescriptions.map(
                        (prescription, index) => (
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
                                <span className="font-medium">
                                  Instructions:
                                </span>{' '}
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
                        )
                      )}
                    </div>
                  </div>
                )}

              <div>
                <h4 className="font-medium mb-2">Test Requests:</h4>
                {soapNote.plan?.test_requests ? (
                  <div className="flex flex-wrap gap-2">
                    {soapNote.plan?.test_requests.join('\n')}
                  </div>
                ) : (
                  <p className="text-sm">No test requests recorded</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommendations:</h4>
                {soapNote.plan?.recommendations ? (
                  <div className="flex flex-wrap gap-2">
                    {soapNote.plan?.recommendations.join('\n')}
                  </div>
                ) : (
                  <p className="text-sm">No recommendations recorded</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Referral:</h4>
                {soapNote.plan?.has_referral &&
                soapNote.plan?.referred_provider_name ? (
                  <Badge variant="secondary">
                    Referred to: {soapNote.plan.referred_provider_name}
                  </Badge>
                ) : (
                  <p className="text-sm">No referral made</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Additional Plan Notes:</h4>
                {soapNote.plan?.others ? (
                  <p className="text-sm">soapNote.plan?.others</p>
                ) : (
                  <p className="text-sm">No additional plan provided</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
export default SoapNoteCard
