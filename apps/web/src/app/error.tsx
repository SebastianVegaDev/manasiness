'use client';

interface ErrorPageProps {
    readonly error: Error & {
        readonly digest?: string;
    };
    readonly reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
    return (
        <main>
            <h1>Something went wrong</h1>
            <p>The current route could not be rendered.</p>

            <button type="button" onClick={reset}>
                Try again
            </button>
        </main>
    );
}