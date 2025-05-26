import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import vine from '@vinejs/vine'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import env from '#start/env'

export default class UploadController {
  async uploadImage({ request, response }: HttpContext) {
    try {
      if (!request.hasBody()) {
        return response.badRequest({
          success: false,
          message: 'No file provided',
          error: 'Request body is empty',
        })
      }

      try {
        const imageFile = request.file('image')

        if (!imageFile) {
          return response.badRequest({
            success: false,
            message: 'No image file provided',
            error: 'The "image" field is missing in the request',
          })
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

        if (imageFile.size > maxSize) {
          return response.badRequest({
            success: false,
            message: 'Image file is too large (max 10MB)',
            error: 'File size exceeds the allowed limit',
          })
        }

        const extension = path.extname(imageFile.clientName).toLowerCase().substring(1)
        if (!allowedExtensions.includes(extension)) {
          return response.badRequest({
            success: false,
            message: 'Invalid file type',
            error: 'Only jpg, jpeg, png, gif, and webp files are allowed',
          })
        }

        const filename = `images/${randomUUID()}.${extension}`

        try {
          await imageFile.moveToDisk(filename, 'r2')

          const r2Url = await drive.use('r2').getUrl(filename)

          const url = r2Url.replace(
            `${env.get('R2_ENDPOINT')}/${env.get('R2_BUCKET')}`,
            env.get('R2_PUBLIC_URL')
          )

          return response.ok({
            success: true,
            data: {
              filename,
              url,
              originalName: imageFile.clientName,
              size: imageFile.size,
            },
          })
        } catch (storageError) {
          return response.badRequest({
            success: false,
            message: 'Failed to store image',
            error: 'Storage configuration error or file system issue',
            details: process.env.NODE_ENV === 'development' ? storageError.message : undefined,
          })
        }
      } catch (processingError) {
        return response.badRequest({
          success: false,
          message: 'Failed to process the uploaded file',
          error: 'File processing error',
          details: process.env.NODE_ENV === 'development' ? processingError.message : undefined,
        })
      }
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Failed to upload image',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      })
    }
  }

  async deleteImage({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        filename: vine.string(),
      })

      try {
        const { filename } = await request.validateUsing(schema as any)

        if (!filename.startsWith('images/')) {
          return response.badRequest({
            success: false,
            message: 'Invalid file path',
            error: 'File path must start with "images/"',
          })
        }

        // Delete from storage
        try {
          await drive.use('r2').delete(filename)

          return response.ok({
            success: true,
            message: 'Image deleted successfully',
          })
        } catch (storageError) {
          return response.badRequest({
            success: false,
            message: 'Failed to delete image from storage',
            error: 'Storage error or file not found',
            details: process.env.NODE_ENV === 'development' ? storageError.message : undefined,
          })
        }
      } catch (validationError) {
        return response.badRequest({
          success: false,
          message: 'Invalid filename',
          error: 'Validation failed',
          details: process.env.NODE_ENV === 'development' ? validationError.message : undefined,
        })
      }
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Failed to delete image',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      })
    }
  }
}
