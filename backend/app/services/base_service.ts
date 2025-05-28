export default abstract class BaseService {
  protected handleError(error: any, defaultMessage: string) {
    console.error(error)
    throw new Error(defaultMessage)
  }
}
