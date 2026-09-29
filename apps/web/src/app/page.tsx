import Image from 'next/image';

import { ApiReadinessStatus } from '../platform/health/api-readiness-status';
import styles from './page.module.css';

export default function DevelopmentLandingPage() {
    return (
        <main className={styles['page']}>
            <section className={styles['panel']} aria-labelledby="application-title">
                <div>
                    <p className={styles['kicker']}>Product foundation</p>

                    <h1 id="application-title" className={styles['wordmark']}>
                        <Image
                            className={styles['mark']}
                            src="/brand/manasiness-mark.svg"
                            alt=""
                            width={48}
                            height={48}
                            priority
                            unoptimized
                        />
                        <span>Manasiness</span>
                    </h1>

                    <p className={styles['description']}>Web application foundation is running.</p>
                </div>

                <div className={styles['health']}>
                    <ApiReadinessStatus />
                </div>
            </section>
        </main>
    );
}
