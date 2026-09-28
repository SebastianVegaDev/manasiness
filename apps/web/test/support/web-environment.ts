export async function register(): Promise<void> {
    if (process.env['NEXT_RUNTIME'] !== 'nodejs') {
        return;
    }

    const { loadWebServerRuntimeConfig } =
        await import(
            '../../src/platform/environment/server-environment'
        );

    loadWebServerRuntimeConfig();
}
