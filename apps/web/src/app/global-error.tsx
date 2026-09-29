'use client';

interface GlobalErrorProps {
    readonly error: Error & {
        readonly digest?: string;
    };
    readonly reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
    return (
        <html>
            <body>
                <main>
                    <h1>Application error</h1>
                    <p>The application shell could not be rendered.</p>

                    <button type="button" onClick={reset}>
                        Try again
                    </button>
                </main>
            </body>
        </html>
    );
}
