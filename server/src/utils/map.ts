export const keys = Object.keys as <T extends object>(obj: T) => Array<keyof T>

export const values = <T>(v: T) =>
    (Object.keys(v) as Array<keyof typeof v>).reduce((acc, curr) => {
        acc.push(v[curr])
        return acc
    }, [] as typeof v[keyof typeof v][])

export const sum = (list: number[]) => list.reduce((acc, v) => acc + v, 0)
export const sequence = (length: number) => Array.from({ length }, (_, i) => i + 1)

export const shuffle = <T>(list: T[]) =>
    list
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
