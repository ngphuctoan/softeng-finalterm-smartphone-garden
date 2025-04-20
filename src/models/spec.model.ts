import { Specs } from "@interfaces";

export interface SpecFromDB {
    spec: { name: string },
    value: string
}

const SPECS_ORDER = ["Display", "CPU", "Battery", "RAM", "Storage", "Camera"];

export function arrayToSpecs(specArray: SpecFromDB[]): Specs {
    return Object.fromEntries(
        specArray
            .map(_spec => [ _spec.spec.name, _spec.value ])
            .sort((specA, specB) => SPECS_ORDER.indexOf(specA[0]) - SPECS_ORDER.indexOf(specB[0]))
    );
}

export function specsToConnect(specs: Specs) {
    return Object.entries(specs).map(
        ([name, value]) => ({
            spec: {
                connectOrCreate: {
                    where: { name },
                    create: { name }
                }
            },
            value
        })
    );
}