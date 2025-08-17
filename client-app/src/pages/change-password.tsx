import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { useState } from 'react'
import API from '../lib/api'
import { toast } from 'sonner'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

type ChangePasswordData = z.infer<typeof changePasswordSchema>

const ChangePassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordData) => {
    setIsSubmitting(true)
    try {
      const { data: resData } = await API.post(
        `/api/auth/change-password`,
        data
      )

      if (!resData?.success) {
        toast.error('Failed to change password')
        return
      }

      toast.success('Password changed successfully.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to change password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-12 space-y-6 text-black"
    >
      <h2 className="text-2xl font-bold">Change Password</h2>

      <div className="space-y-2">
        <Label>Current Password</Label>
        <Input type="password" {...register('currentPassword')} />
        {errors.currentPassword && (
          <p className="text-red-500">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>New Password</Label>
        <Input type="password" {...register('newPassword')} />
        {errors.newPassword && (
          <p className="text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <Input type="password" {...register('confirmNewPassword')} />
        {errors.confirmNewPassword && (
          <p className="text-red-500">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-black text-white"
      >
        {isSubmitting ? 'Updating...' : 'Change Password'}
      </Button>
    </form>
  )
}

export default ChangePassword
