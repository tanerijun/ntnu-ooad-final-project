import vine from '@vinejs/vine'

const password = () => vine.string().minLength(8)
const name = () => vine.string().minLength(2).maxLength(30)
const email = () => vine.string().email().normalizeEmail()
const uniqueEmail = () =>
  email().unique(async (db, value) => {
    const match = await db.from('users').select('id').where('email', value).first()
    return !match
  })

export const registerValidator = vine.compile(
  vine.object({
    name: name(),
    email: uniqueEmail(),
    password: password(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: email(),
    password: password(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    name: name(),
  })
)

export const updateProfileWithEmailValidator = vine.compile(
  vine.object({
    name: name(),
    email: uniqueEmail(),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: password(),
  })
)
