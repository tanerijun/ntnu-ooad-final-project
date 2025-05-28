import User from '#models/user'
import { errors } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'
import BaseService from '#services/base_service'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { MultipartFile } from '@adonisjs/core/types/bodyparser'

export default class AuthService extends BaseService {
  async createUser(data: any) {
    const user = await User.create(data)
    return User.accessTokens.create(user)
  }

  async authenticateUser(email: string, password: string) {
    const user = await User.verifyCredentials(email, password)
    return User.accessTokens.create(user)
  }

  async logoutUser(user: User & { currentAccessToken: AccessToken }) {
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
  }

  async updateUserProfile(user: User, data: any) {
    await user.merge(data).save()
    return user
  }

  async updateUserPassword(user: User, currentPassword: string, newPassword: string) {
    try {
      await User.verifyCredentials(user.email, currentPassword)
    } catch {
      throw new errors.E_HTTP_EXCEPTION('Current password is incorrect', { status: 400 })
    }

    user.password = newPassword
    await user.save()
  }

  async updateUserAvatar(user: User, avatar: MultipartFile) {
    if (!avatar?.isValid) {
      throw new errors.E_HTTP_EXCEPTION(avatar?.errors[0]?.message || 'Invalid file', {
        status: 400,
      })
    }

    try {
      // Delete old avatar
      if (user.avatarUrl) {
        const oldKey = user.avatarUrl.replace(env.get('R2_PUBLIC_URL'), '').substring(1)
        try {
          await drive.use('r2').delete(oldKey)
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError)
        }
      }

      // Upload new avatar
      const key = `avatars/${cuid()}.${avatar.extname}`
      await avatar.moveToDisk(key)

      const r2Url = await drive.use('r2').getUrl(key)
      const publicUrl = r2Url.replace(
        `${env.get('R2_ENDPOINT')}/${env.get('R2_BUCKET')}`,
        env.get('R2_PUBLIC_URL')
      )

      user.avatarUrl = publicUrl
      await user.save()

      return { avatarUrl: user.avatarUrl }
    } catch (error) {
      this.handleError(error, 'Failed to upload avatar')
    }
  }
}
