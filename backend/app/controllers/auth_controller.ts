import User from '#models/user'
import {
  loginValidator,
  registerValidator,
  updateProfileValidator,
  updateProfileWithEmailValidator,
} from '#validators/auth'
import { errors } from '@adonisjs/core'
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
}
