import Link from 'next/link';

export default function NotFoundPage() {
    return (
        <main>
            <h1>Route not found</h1>
            <p>The requested route does not exist.</p>

            <Link href="/">Return to the application root</Link>
        </main>
    );
}