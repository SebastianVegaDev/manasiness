import { ApplicationShell } from '../platform/shell/application-shell';
import { OverviewFoundation } from './overview-foundation';

export default function ProductExperiencePage() {
    return (
        <ApplicationShell>
            <OverviewFoundation />
        </ApplicationShell>
    );
}
