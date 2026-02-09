"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { ModeToggle, Logo } from "@/components/theme";
import { LanguageSwitcher } from "./language-switcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useDictionary } from "@/components/dictionary-provider";

export function Header() {
  const router = useRouter();
  const { dictionary, categories, getLocalizedPath } = useDictionary();
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(getLocalizedPath(`/search?q=${encodeURIComponent(searchValue.trim())}`));
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchValue.trim()) {
      router.push(getLocalizedPath(`/search?q=${encodeURIComponent(mobileSearchValue.trim())}`));
    }
  };

  const t = dictionary.common;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Link href={getLocalizedPath("/")}>
                  <Logo className="h-12 w-auto" />
                </Link>
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Search */}
            <form onSubmit={handleMobileSearch} className="relative mt-4 mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.search}
                value={mobileSearchValue}
                onChange={(e) => setMobileSearchValue(e.target.value)}
                className="pl-9 w-full"
              />
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-1">
              {/* Categories */}
              <div className="py-2">
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {t.categories || "Categories"}
                </h4>
                {categories.map((category) => (
                  <SheetClose asChild key={category.id}>
                    <Link
                      href={getLocalizedPath(`/category/${category.slug}`)}
                      className="flex py-2 text-sm transition-colors hover:text-foreground text-foreground/70"
                    >
                      {category.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t my-2" />

              {/* Other Links */}
              <SheetClose asChild>
                <Link
                  href={getLocalizedPath("/casts")}
                  className="flex py-2 text-sm font-medium transition-colors hover:text-foreground text-foreground/70"
                >
                  {t.casts}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href={getLocalizedPath("/tags")}
                  className="flex py-2 text-sm font-medium transition-colors hover:text-foreground text-foreground/70"
                >
                  {t.tags}
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href={getLocalizedPath("/")} className="mr-6 flex items-center">
          <Logo className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation - Categories */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={getLocalizedPath(`/category/${category.slug}`)}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href={getLocalizedPath("/casts")}
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {t.casts}
          </Link>
          <Link
            href={getLocalizedPath("/tags")}
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {t.tags}
          </Link>
        </nav>

        {/* Search (Desktop) */}
        <div className="hidden md:flex flex-1 items-center justify-center px-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.search}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 w-full"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 ml-auto">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
