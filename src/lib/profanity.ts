import filter from 'leo-profanity';

// Load dictionary (en + others if available, default is usually en)
filter.loadDictionary('en');
// You can add Chinese words if needed, or find a zh dictionary for leo-profanity
// filter.add(['...']);

export const isProfane = (text: string): boolean => {
    return filter.check(text);
};

export const cleanContent = (text: string): string => {
    return filter.clean(text);
};
