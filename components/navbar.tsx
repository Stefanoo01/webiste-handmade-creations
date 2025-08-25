"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Instagram from "@/components/ui/svg/instagram";
import Facebook from "@/components/ui/svg/facebook";
import TikTok from "@/components/ui/svg/tiktok";

import {
    Menu,
    ShoppingBag,
    ChevronDown,
    ChevronRight,
    ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; slug: string; parent_id?: string | null };

export default function SiteNavbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(false);
    const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
    const [config, setConfig] = useState<{
        name: string;
        description: string;
        instagram: string;
        facebook: string;
        tiktok: string;
    }>();

    useEffect(() => {
        const load = async () => {
            setLoadingCats(true);
            const supabase = createSupabaseClient();
            const { data } = await supabase
                .from("categories")
                .select("id, name, slug, parent_id")
                .order("name");
            const config = await supabase
                .from("config")
                .select("*")
                .eq("id", 1)
                .maybeSingle();
            setCategories(data ?? []);
            setLoadingCats(false);
            setConfig(config.data ?? undefined);
        };
        load();
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/75 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="group inline-flex items-center gap-2">
                    <div className="relative">
                        <ShoppingBag className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-[1px]" />
                    </div>
                    <span className="text-sm font-semibold">
                        IlLabirintoDiRiri<span className="text-primary"></span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 md:flex">
                    <NavLink
                        href="/"
                        label="Home"
                        active={isActive(pathname, "/")}
                    />
                    <CatalogWithDropdown
                        categories={categories}
                        loading={loadingCats}
                        active={pathname.startsWith("/catalog")}
                    />
                    <NavLink
                        href="/contact"
                        label="Contatti"
                        active={pathname.startsWith("/contact")}
                    />
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Button
                        size="sm"
                        type="button"
                        className="snipcart-checkout inline-flex items-center gap-2 transition-transform hover:-translate-y-[1px]"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Carrello</span>
                        <span
                            className="snipcart-items-count ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground"
                            aria-live="polite"
                        />
                    </Button>
                    <Link
                        href={config?.facebook ?? "https://facebook.com"}
                        className="rounded-md p-2 text-primary transition-colors hover:bg-secondary hover:text-primary-foreground"
                        aria-label="Facebook"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Facebook/>
                    </Link>
                    <Link
                        href={config?.instagram ?? "https://instagram.com"}
                        className="rounded-md p-2 text-primary transition-colors hover:bg-secondary hover:text-primary-foreground"
                        aria-label="Instagram"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Instagram/>
                    </Link>
                    <Link
                        href={config?.tiktok ?? "https://tiktok.com"}
                        className="rounded-md p-2 text-primary transition-colors hover:bg-secondary hover:text-primary-foreground"
                        aria-label="TikTok"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <TikTok/>
                    </Link>
                </div>

                {/* Mobile */}
                <button
                    className="inline-flex rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
                    onClick={() => setOpen((s) => !s)}
                    aria-label="Toggle menu"
                    aria-expanded={open}
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden">
                    <div className="mx-auto max-w-6xl px-4 pb-4">
                        <nav className="grid gap-1 rounded-md border p-2">
                            <NavLink
                                href="/"
                                label="Home"
                                active={isActive(pathname, "/")}
                                onClick={() => setOpen(false)}
                            />
                            <button
                                className="group flex items-center justify-between rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                                onClick={() => setMobileCatsOpen((s) => !s)}
                                aria-expanded={mobileCatsOpen}
                            >
                                <span className="relative">
                                    <UnderlineText
                                        text="Catalog"
                                        active={pathname.startsWith("/catalog")}
                                    />
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 transition-transform",
                                        mobileCatsOpen && "rotate-180"
                                    )}
                                />
                            </button>
                            {mobileCatsOpen && (
                                <div className="mx-2 mb-2 rounded-md border bg-background">
                                    {loadingCats && (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">
                                            Loading…
                                        </div>
                                    )}
                                    {!loadingCats &&
                                        (categories.length ? (
                                            (() => {
                                                const parentCategories = categories.filter(c => !c.parent_id)
                                                const subcategories = categories.filter(c => c.parent_id)
                                                
                                                return parentCategories.map((parent) => (
                                                    <div key={parent.id}>
                                                        <Link
                                                            href={`/catalog?category=${encodeURIComponent(
                                                                parent.slug
                                                            )}`}
                                                            className="block px-3 py-2 text-sm hover:bg-muted font-medium"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            {parent.name}
                                                        </Link>
                                                        {subcategories
                                                            .filter(sub => sub.parent_id === parent.id)
                                                            .map((sub) => (
                                                                <Link
                                                                    key={sub.id}
                                                                    href={`/catalog?category=${encodeURIComponent(
                                                                        sub.slug
                                                                    )}`}
                                                                    className="block px-3 py-2 text-sm hover:bg-muted pl-6 text-muted-foreground"
                                                                    onClick={() => setOpen(false)}
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                    </div>
                                                ))
                                            })()
                                        ) : (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No categories
                                            </div>
                                        ))}
                                </div>
                            )}
                            <NavLink
                                href="/contact"
                                label="Contact"
                                active={pathname.startsWith("/contact")}
                                onClick={() => setOpen(false)}
                            />
                            <Button
                                asChild
                                className="mt-2"
                                onClick={() => setOpen(false)}
                            >
                                <Link href="/catalog">Shop now</Link>
                            </Button>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}

function isActive(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
}

function UnderlineText({ text, active }: { text: string; active?: boolean }) {
    return (
        <span
            className={cn(
                "relative inline-flex items-center transition-colors text-foreground"
            )}
        >
            {text}
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute inset-x-2 -bottom-[2px] h-[2px] left scale-x-0 bg-primary transition-transform duration-200",
                    "group-hover:scale-x-150",
                    active && "scale-x-150"
                )}
            />
        </span>
    );
}

function NavLink({
    href,
    label,
    active,
    onClick,
}: {
    href: string;
    label: string;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "group rounded-md px-3 py-2 text-sm",
                active ? "text-foreground" : "text-muted-foreground"
            )}
            onClick={onClick}
        >
            <UnderlineText text={label} active={!!active} />
        </Link>
    );
}

function CatalogWithDropdown({
    categories,
    loading,
    active,
}: {
    categories: Category[];
    loading: boolean;
    active?: boolean;
}) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    
    // Group categories by parent/child relationship
    const groupedCategories = categories.reduce((acc, category) => {
        if (!category.parent_id) {
            // This is a parent category
            acc.push({
                ...category,
                subcategories: categories.filter(c => c.parent_id === category.id)
            });
        }
        return acc;
    }, [] as (Category & { subcategories: Category[] })[]);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    return (
        <div className="group relative">
            <Link
                href="/catalog"
                className={cn(
                    "group/nav rounded-md px-3 py-2 text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
                )}
            >
                <span className="inline-flex items-center gap-1">
                    <UnderlineText text="Catalogo" active={!!active} />
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover/nav:rotate-180" />
                </span>
            </Link>

            {/* Dropdown panel */}
            <div
                className={cn(
                    "invisible absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-md border bg-background opacity-0 shadow-md transition-all",
                    "translate-y-1 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
                    "group-focus-within:translate-y-0 group-focus-within:opacity-100"
                )}
                role="menu"
                aria-label="Categories"
            >
                {loading && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                        Loading…
                    </div>
                )}
                {!loading && groupedCategories.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                        No categories
                    </div>
                )}
                {!loading &&
                    groupedCategories.map((category) => (
                        <div key={category.id} className="group/cat relative">
                            <div className="flex items-center justify-between">
                                <Link
                                    href={`/catalog?category=${encodeURIComponent(
                                        category.slug
                                    )}`}
                                    prefetch={false}
                                    className="flex-1 px-3 py-2 text-sm hover:bg-primary hover:text-primary-foreground font-medium"
                                    role="menuitem"
                                >
                                    {category.name}
                                </Link>
                                {category.subcategories.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleCategory(category.id);
                                        }}
                                        className="peer px-2 py-2 text-foreground hover:text-foreground"
                                        aria-label={`Show subcategories for ${category.name}`}
                                    >
                                        <ChevronRight className={cn(
                                            "h-3.5 w-3.5 transition-transform",
                                            expandedCategories.has(category.id) && "rotate-90"
                                        )} />
                                    </button>
                                )}
                            </div>
                            
                            {/* Subcategories - inline inside the same dropdown (no separate flyout) */}
                            {category.subcategories.length > 0 && (
                                <div
                                    className={cn(
                                        "grid transition-all",
                                        // Hidden by default
                                        "max-h-0 opacity-0",
                                        // Show only when hovering the arrow button (peer)
                                        "peer-hover:max-h-96 peer-hover:opacity-100",
                                        // Or when explicitly expanded by clicking the arrow
                                        expandedCategories.has(category.id) && "max-h-96 opacity-100"
                                    )}
                                >
                                    {category.subcategories.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/catalog?category=${encodeURIComponent(
                                                category.slug
                                            )}&subcategory=${encodeURIComponent(
                                                sub.slug
                                            )}`}
                                            prefetch={false}
                                            className="block px-3 py-2 pl-8 text-sm text-foreground hover:bg-primary hover:text-primary-foreground"
                                            role="menuitem"
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
