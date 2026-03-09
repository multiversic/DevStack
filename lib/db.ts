import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient()
}

// Utilisation de globalThis pour persister l'instance à travers les rechargements Next.js
declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// En production, génère une nouvelle instance. En dev, réutilise l'instance globale.
export const db = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db
