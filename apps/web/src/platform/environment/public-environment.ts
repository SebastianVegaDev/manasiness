export interface PublicWebRuntimeConfig {
    readonly apiOrigin: string;
}

export const publicWebRuntimeConfig =
    Object.freeze<PublicWebRuntimeConfig>({
        apiOrigin: new URL(
            process.env.NEXT_PUBLIC_API_ORIGIN,
        ).origin,
    });