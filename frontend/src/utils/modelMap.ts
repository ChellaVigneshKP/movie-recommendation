export const modelMap: Record<string, string> = {
    "SVD Based Recommendations": "svd",
    "ALS Based Recommendations": "als",
    "Based on Your Recent Searches": "nlp",
    "Deep Learning Based Recommendations": "deepmatch",
};

export function getModelType(sectionHeading: string): string {
    return modelMap[sectionHeading] || "default";
}  