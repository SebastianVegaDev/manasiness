import Image from 'next/image';

import { ApiReadinessStatus } from '../../platform/health/api-readiness-status';
import { getTranslations } from '../../platform/i18n/server';
import styles from '../page.module.css';
import { PrimitiveDiagnostics } from '../primitive-diagnostics';
import { FormPatternFixture } from './form-pattern-fixture';

export default async function EngineeringFoundationPage() {
    const t = await getTranslations('landing');

    return (
        <main className={styles['page']}>
            <section className={styles['panel']} aria-labelledby="application-title">
                <div>
                    <p className={styles['kicker']}>{t('kicker')}</p>

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

                    <p className={styles['description']}>{t('description')}</p>
                </div>

                <PrimitiveDiagnostics />

                <FormPatternFixture />

                <div className={styles['health']}>
                    <ApiReadinessStatus />
                </div>
            </section>
        </main>
    );
}
