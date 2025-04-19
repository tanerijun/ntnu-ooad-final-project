import User from '#models/user'
import {
  loginValidator,
  registerValidator,
  updatePasswordValidator,
  updateProfileValidator,
  updateProfileWithEmailValidator,
} from '#validators/auth'
import env from '#start/env'
import { errors } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create(data)

    return User.accessTokens.create(user)
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    return User.accessTokens.create(user)
  }

  async logout({ auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      throw new errors.E_HTTP_EXCEPTION('User not found during logout', { status: 500 })
    }

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return { message: 'success' }
  }

  async me({ auth }: HttpContext) {
    await auth.check()

    return {
      user: auth.user,
    }
  }

  async updateProfile({ request, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw new errors.E_HTTP_EXCEPTION('User not found during updateProfile', { status: 500 })
    }

    const body = request.body()

    // If email hasn't changed, skip email uniqueness validation
    if (body.email === user.$attributes.email) {
      const data = await request.validateUsing(updateProfileValidator)

      await user.merge(data).save()
      return { user }
    }

    const data = await request.validateUsing(updateProfileWithEmailValidator)

    await user.merge(data).save()
    return { user }
  }

  async updatePassword({ request, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw new errors.E_HTTP_EXCEPTION('User not found', { status: 500 })
    }

    const { currentPassword, newPassword } = await request.validateUsing(updatePasswordValidator)

    try {
      // Verify current password
      await User.verifyCredentials(user.email, currentPassword)
    } catch (error) {
      throw new errors.E_HTTP_EXCEPTION('Current password is incorrect', { status: 400 })
    }

    user.password = newPassword
    await user.save()

    return { message: 'Password updated successfully' }
  }

  async updateAvatar({ request, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw new errors.E_HTTP_EXCEPTION('User not found', { status: 500 })
    }

    const avatar = request.file('avatar', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    })

    if (!avatar) {
      throw new errors.E_HTTP_EXCEPTION('No avatar file provided', { status: 400 })
    }

    if (!avatar.isValid) {
      throw new errors.E_HTTP_EXCEPTION(avatar.errors[0].message, { status: 400 })
    }

    try {
      // Delete old avatar if it exists
      if (user.avatarUrl) {
        const oldKey = user.avatarUrl.replace(env.get('R2_PUBLIC_URL'), '').substring(1) // Remove leading slash

        try {
          await drive.use('r2').delete(oldKey)
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError)
        }
      }

      const key = `avatars/${cuid()}.${avatar.extname}`
      await avatar.moveToDisk(key)

      const r2Url = await drive.use('r2').getUrl(key)
      const publicUrl = r2Url.replace(
        `${env.get('R2_ENDPOINT')}/${env.get('R2_BUCKET')}`,
        env.get('R2_PUBLIC_URL')
      )

      user.avatarUrl = publicUrl
      await user.save()

      return {
        message: 'Avatar updated successfully',
        avatarUrl: user.avatarUrl,
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw new errors.E_HTTP_EXCEPTION('Failed to upload avatar', { status: 500 })
    }
  }
}
