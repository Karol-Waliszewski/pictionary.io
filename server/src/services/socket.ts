// use when you send event to the client
export type ServerToClientEvents = {
    anotherDeviceConnected: (message: string) => void
    passWatched: (watchedAssets: string[]) => void
    passPrivacyMode: (privacyMode: boolean) => void
}

// use when you receive events from a client
export type ClientToServerEvents = {
    init: (message: string) => void
    userAvailable: (userId: string) => void
    updateWatched: (assets: string[], userId: string) => void
    updatePrivacyMode: (privacyStatus: boolean, userId: string) => void
}

// use when you send events between servers
export type InnerServerEvents = {
    localTest: (message: string) => void
}

// data type that can be passed through events
export type SocketData = {
    data: string
}
