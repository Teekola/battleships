"use client";

import { ComponentProps } from "react";

import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface BackButtonLinkProps extends ComponentProps<typeof Button> {
   href: string;
   label: string;
}

export function BackButtonLink({ label, href, ...props }: Readonly<BackButtonLinkProps>) {
   return (
      <Button
         {...props}
         asChild
         variant="outline"
         type="button"
         className={cn(
            "group inline-flex w-fit items-center justify-between gap-2",
            props.className
         )}
      >
         <Link href={href} scroll={false}>
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {label}
         </Link>
      </Button>
   );
}
