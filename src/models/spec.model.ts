import { Specs } from "@interfaces";

export interface SpecFromDB {
    spec: { name: string },
    value: string
}

export function arrayToSpecs(specArray: SpecFromDB[]): Specs {
    return Object.fromEntries(
        specArray.map(_spec => [ _spec.spec.name, _spec.value ])
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