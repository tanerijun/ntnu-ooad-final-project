import drive from '@adonisjs/drive/services/main'
import env from '#start/env'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import BaseService from './base_service.js'

export default class UploadService extends BaseService {
  private readonly maxSize = 10 * 1024 * 1024 // 10MB
  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

  async uploadImage(imageFile: any) {
    if (!imageFile) {
      throw new Error('No image file provided')
    }

    this.validateImageFile(imageFile)

    const extension = path.extname(imageFile.clientName).toLowerCase().substring(1)
    const filename = `images/${randomUUID()}.${extension}`

    try {
      await imageFile.moveToDisk(filename, 'r2')
      const r2Url = await drive.use('r2').getUrl(filename)
      const url = this.transformUrl(r2Url)

      return {
        filename,
        url,
        originalName: imageFile.clientName,
        size: imageFile.size,
      }
    } catch (error) {
      this.handleError(error, 'Failed to store image')
    }
  }

  async deleteImage(filename: string) {
    if (!filename.startsWith('images/')) {
      throw new Error('Invalid file path - must start with "images/"')
    }

    try {
      await drive.use('r2').delete(filename)
    } catch (error) {
      this.handleError(error, 'Failed to delete image from storage')
    }
  }

  private validateImageFile(imageFile: any) {
    if (imageFile.size > this.maxSize) {
      throw new Error('Image file is too large (max 10MB)')
    }

    const extension = path.extname(imageFile.clientName).toLowerCase().substring(1)
    if (!this.allowedExtensions.includes(extension)) {
      throw new Error('Invalid file type - only jpg, jpeg, png, gif, and webp files are allowed')
    }
  }

  private transformUrl(r2Url: string): string {
    return r2Url.replace(
      `${env.get('R2_ENDPOINT')}/${env.get('R2_BUCKET')}`,
      env.get('R2_PUBLIC_URL')
    )
  }
}
