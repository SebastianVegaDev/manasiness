'use client';

import NextLink from 'next/link';
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type ComponentPropsWithoutRef,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

import { Button } from '../button/button';
import { uiClassName } from '../internal/ui-class-name';
import styles from './menu.module.css';

type MenuFocusTarget = 'first' | 'last';

interface MenuContextValue {
    closeAndRestoreFocus: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
    const context = useContext(MenuContext);

    if (context === null) {
        throw new Error('MenuItem and MenuLink must be rendered inside Menu.');
    }

    return context;
}

function getMenuItems(menu: HTMLElement | null): HTMLElement[] {
    if (menu === null) {
        return [];
    }

    return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

export interface MenuProps {
    triggerLabel: string;
    triggerContent?: ReactNode;
    children: ReactNode;
    align?: 'start' | 'end';
}

export function Menu({ align = 'start', children, triggerContent, triggerLabel }: MenuProps) {
    const menuId = useId();
    const triggerId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const pendingFocusRef = useRef<MenuFocusTarget | null>(null);
    const [open, setOpen] = useState(false);

    function requestOpen(focusTarget: MenuFocusTarget) {
        pendingFocusRef.current = focusTarget;
        setOpen(true);
    }

    function closeAndRestoreFocus() {
        setOpen(false);
        pendingFocusRef.current = null;
        queueMicrotask(() => triggerRef.current?.focus());
    }

    useEffect(() => {
        if (!open || pendingFocusRef.current === null) {
            return;
        }

        const focusTarget = pendingFocusRef.current;
        pendingFocusRef.current = null;

        const frame = window.requestAnimationFrame(() => {
            const items = getMenuItems(menuRef.current);
            const item = focusTarget === 'last' ? items[items.length - 1] : items[0];

            item?.focus();
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handlePointerDown(event: PointerEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (!rootRef.current?.contains(target)) {
                setOpen(false);
                pendingFocusRef.current = null;
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [open]);

    function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            requestOpen('first');
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            requestOpen('last');
        }
    }

    function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const items = getMenuItems(menuRef.current);

        if (items.length === 0) {
            return;
        }

        const currentIndex = items.findIndex((item) => item === document.activeElement);

        if (event.key === 'Escape') {
            event.preventDefault();
            closeAndRestoreFocus();
            return;
        }

        if (event.key === 'Tab') {
            setOpen(false);
            pendingFocusRef.current = null;
            return;
        }

        if (event.key === 'Home') {
            event.preventDefault();
            items[0]?.focus();
            return;
        }

        if (event.key === 'End') {
            event.preventDefault();
            items[items.length - 1]?.focus();
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
            items[nextIndex]?.focus();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            const previousIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
            items[previousIndex]?.focus();
        }
    }

    return (
        <div ref={rootRef} className={styles['root']}>
            <Button
                ref={triggerRef}
                id={triggerId}
                variant="secondary"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={triggerContent === undefined ? undefined : triggerLabel}
                onClick={() => {
                    if (open) {
                        setOpen(false);
                        pendingFocusRef.current = null;
                    } else {
                        requestOpen('first');
                    }
                }}
                onKeyDown={handleTriggerKeyDown}
            >
                {triggerContent ?? triggerLabel}
                <span aria-hidden="true">▾</span>
            </Button>

            <div
                ref={menuRef}
                id={menuId}
                className={styles['menu']}
                role="menu"
                aria-labelledby={triggerId}
                data-align={align}
                hidden={!open}
                onKeyDown={handleMenuKeyDown}
            >
                <MenuContext.Provider value={{ closeAndRestoreFocus }}>
                    {children}
                </MenuContext.Provider>
            </div>
        </div>
    );
}

export interface MenuItemProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'disabled' | 'onClick'
> {
    disabled?: boolean;
    onSelect?: () => void;
    tone?: 'default' | 'critical';
}

export function MenuItem({
    children,
    className,
    disabled = false,
    onSelect,
    tone = 'default',
    ...buttonProps
}: MenuItemProps) {
    const { closeAndRestoreFocus } = useMenuContext();

    return (
        <button
            {...buttonProps}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={uiClassName(
                styles['item'],
                tone === 'critical' ? styles['criticalItem'] : undefined,
                className,
            )}
            aria-disabled={disabled ? true : undefined}
            onClick={(event) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }

                onSelect?.();
                closeAndRestoreFocus();
            }}
        >
            {children}
        </button>
    );
}

export type MenuLinkProps = Omit<ComponentPropsWithoutRef<typeof NextLink>, 'role' | 'tabIndex'>;

export function MenuLink({ className, onClick, ...linkProps }: MenuLinkProps) {
    const { closeAndRestoreFocus } = useMenuContext();

    return (
        <NextLink
            {...linkProps}
            role="menuitem"
            tabIndex={-1}
            className={uiClassName(styles['item'], className)}
            onClick={(event) => {
                onClick?.(event);

                if (!event.defaultPrevented) {
                    closeAndRestoreFocus();
                }
            }}
        />
    );
}
