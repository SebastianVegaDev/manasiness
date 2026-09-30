export function focusFirstInvalidControl(form: HTMLFormElement): boolean {
    const firstInvalidControl = form.querySelector<HTMLElement>(
        '[aria-invalid="true"]:not([disabled])',
    );

    if (firstInvalidControl === null) {
        return false;
    }

    firstInvalidControl.focus();
    return true;
}
