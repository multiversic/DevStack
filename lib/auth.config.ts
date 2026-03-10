import type { NextConfig } from "next"

const authConfig = {
    providers: [],
    trustHost: true,
    pages: {
        signIn: "/auth/login",
    },
}

export default authConfig