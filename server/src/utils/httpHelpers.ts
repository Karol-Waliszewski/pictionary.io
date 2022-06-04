import { Request, Response, NextFunction } from 'express'

type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type ExtendedRequest = (req: Request, res: Response, next: NextFunction) => any

export const httpErrorMessages = {
    invalidParams: 'Invalid params',
    notAllowed: 'Method not allowed',
    accessDenied: 'Access denied',
    notFound: 'Not found',
    fetchingData: 'Error fetching data',
    unauthorized: 'Unauthorized'
}

export const isErr = (status: number) => status < 200 && status >= 300
export const makeHttpResponse = (message: string) => ({ message })
export const makeHttpError = (status: 400 | 401 | 403 | 404 | 405 | 422 | 500) => (message: keyof typeof httpErrorMessages) => ({
    ...makeHttpResponse(httpErrorMessages[message]),
    status
})

export const makeUpdateResponse = (affectedRows: number) => makeHttpResponse(`${affectedRows} row(s) affected.`)

export const handle =
    (method: HttpMethod) =>
    (handler: ExtendedRequest): ExtendedRequest =>
    async (req, res, next) => {
        if (![method].includes(req.method.toLowerCase() as HttpMethod)) {
            next(makeHttpError(405)('notAllowed'))
        }
        try {
            await handler(req, res, next)
        } catch (err) {
            next(err)
        }
    }

export const get = handle('get')
export const post = handle('post')
export const put = handle('put')
export const del = handle('delete')
