import { faker } from '@faker-js/faker'

export type Person = {
    tid: string
    lastName: string
    age: number
    visits: number
    rand1: number
    rand2: number
    rand3: number
    rand4: number
    rand5: number
    rand6: number
    rand7: number
    rand8: number
    rand9: number
    rand10: number
    rand11: number
    progress: number
    status: 'relationship' | 'complicated' | 'single'
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
        lastName: faker.person.lastName(),
        age: faker.number.int(40),
        visits: faker.number.int(1000),
        rand1: faker.number.int(100),
        rand2: faker.number.int(100),
        rand3: faker.number.int(100),
        rand4: faker.number.int(100),
        rand5: faker.number.int(100),
        rand6: faker.number.int(100),
        rand7: faker.number.int(100),
        rand8: faker.number.int(100),
        rand9: faker.number.int(100),
        rand10: faker.number.int(100),
        rand11: faker.number.int(100),
        progress: faker.number.int(100),
        status: faker.helpers.shuffle<Person['status']>([
            'relationship',
            'complicated',
            'single',
        ])[0]!,
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