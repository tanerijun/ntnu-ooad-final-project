import {
  loginValidator,
  registerValidator,
  updatePasswordValidator,
  updateProfileValidator,
  updateProfileWithEmailValidator,
} from '#validators/auth'
import { errors } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  private authService = new AuthService()

  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    return await this.authService.createUser(data)
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    return await this.authService.authenticateUser(email, password)
  }

  async logout({ auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw new errors.E_HTTP_EXCEPTION('User not found during logout', { status: 500 })
    }

    await this.authService.logoutUser(user)
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
    const hasEmailChanged = body.email !== user.$attributes.email

    const data = hasEmailChanged
      ? await request.validateUsing(updateProfileWithEmailValidator)
      : await request.validateUsing(updateProfileValidator)

    const updatedUser = await this.authService.updateUserProfile(user, data)
    return { user: updatedUser }
  }

  async updatePassword({ request, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw new errors.E_HTTP_EXCEPTION('User not found', { status: 500 })
    }

    const { currentPassword, newPassword } = await request.validateUsing(updatePasswordValidator)
    await this.authService.updateUserPassword(user, currentPassword, newPassword)

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

    const result = await this.authService.updateUserAvatar(user, avatar)
    return {
      message: 'Avatar updated successfully',
      ...result,
    }
  }
}
