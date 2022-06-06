export const convertTime = (time: number) => `${Math.trunc(time / 60)}:${(time % 60 < 10 ? '0' : '') + (time % 60)}`
