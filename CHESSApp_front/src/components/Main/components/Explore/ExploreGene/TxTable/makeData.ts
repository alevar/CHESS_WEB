import { faker } from '@faker-js/faker'

export type Person = {
    tid: string
    transcript: number
    gene_id: number
    subRows?: Person[]
}

const range = (len: number) => {
    const arr: number[] = []
    for (let i = 0; i < len; i++) {
        arr.push(i)
    }
    return arr
}

const newPerson = (): Person => {
    return {
        tid: faker.person.firstName(),
        transcript: faker.number.int(100),
        gene_id: faker.number.int(3),
    }
}

export function makeData(...lens: number[]) {
    const makeDataLevel = (depth = 0): Person[] => {
        const len = Math.floor(Math.random() * lens[depth]!);
        return range(len).map((d): Person => {
            return {
                ...newPerson(),
                subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
            }
        })
    }

    return makeDataLevel()
}