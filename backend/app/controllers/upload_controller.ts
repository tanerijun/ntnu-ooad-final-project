import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import UploadService from '#services/upload_service'

export default class UploadController {
  private uploadService = new UploadService()

  async uploadImage({ request, response }: HttpContext) {
    try {
      if (!request.hasBody()) {
        return response.badRequest({
          success: false,
          message: 'No file provided',
          error: 'Request body is empty',
        })
      }

      const imageFile = request.file('image')
      if (!imageFile) {
        return response.badRequest({
          success: false,
          message: 'No image file provided',
          error: 'The "image" field is missing in the request',
        })
      }

      const result = await this.uploadService.uploadImage(imageFile)

      return response.ok({
        success: true,
        data: result,
      })
    } catch (error) {
      return this.handleUploadError(response, error)
    }
  }

  async deleteImage({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        filename: vine.string(),
      })

      const { filename } = await request.validateUsing(schema as any)
      await this.uploadService.deleteImage(filename)

      return response.ok({
        success: true,
        message: 'Image deleted successfully',
      })
    } catch (error) {
      return this.handleDeleteError(response, error)
    }
  }

  private handleUploadError(response: any, error: any) {
    const errorMessages: Record<string, string> = {
      'No image file provided': 'The "image" field is missing in the request',
      'Image file is too large (max 10MB)': 'File size exceeds the allowed limit',
      'Invalid file type': 'Only jpg, jpeg, png, gif, and webp files are allowed',
      'Failed to store image': 'Storage configuration error or file system issue',
    }

    const message = error.message as string
    const errorDetail = errorMessages[message] || 'File processing error'

    return response.badRequest({
      success: false,
      message,
      error: errorDetail,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }

  private handleDeleteError(response: any, error: any) {
    if (error.message.includes('Invalid file path')) {
      return response.badRequest({
        success: false,
        message: 'Invalid file path',
        error: 'File path must start with "images/"',
      })
    }

    return response.badRequest({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}
