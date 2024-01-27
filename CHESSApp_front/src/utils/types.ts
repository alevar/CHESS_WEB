export interface NestedObject {
    [key: string]: number | NestedObject;
}

export type Coord = [number, number];

export type Interval = [number, number];

export interface Attributes {
    [key: string]: string;
}

