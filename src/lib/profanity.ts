import filter from 'leo-profanity';

// Load dictionary (en + others if available, default is usually en)
filter.loadDictionary('en');

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

const BAD_WORDS_URL = "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/zh";

export const ensureProfanityLoaded = async () => {
    if (isLoaded) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        try {
            const response = await fetch(BAD_WORDS_URL);
            if (!response.ok) throw new Error('Failed to load profanity list');
            const text = await response.text();
            // Split by newline and filter empty strings
            const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
            filter.add(words);
            isLoaded = true;
        } catch (error) {
            console.error("Failed to load profanity list:", error);
            // Fallback or just ignore, but don't crash
        }
    })();

    return loadPromise;
};

export const isProfaneAsync = async (text: string): Promise<boolean> => {
    await ensureProfanityLoaded();
    return filter.check(text);
};

export const cleanContent = (text: string): string => {
    return filter.clean(text);
};
