import { getAuthInstance } from '@/services/auth/auth0-plugin'
import { Route } from 'vue-router'

export const authGuard = (to: Route, _: Route, next: (path?: string) => void) => {
    const authService = getAuthInstance()

    const guardAction = () => {
        if (authService.isAuthenticated) return next()
        authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } })
    }

    if (!authService.isLoading) return guardAction()

    authService.$watch('isLoading', (isLoading: boolean) => {
        if (!isLoading) return guardAction()
    })
}
