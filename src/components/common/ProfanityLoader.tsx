"use client";

import { useEffect } from "react";
import { ensureProfanityLoaded } from "@/lib/profanity";

export function ProfanityLoader() {
    useEffect(() => {
        ensureProfanityLoaded();
    }, []);

    return null;
}
