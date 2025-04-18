export const modelMap: Record<string, string> = {
    "SVD Based Recommendations": "svd",
    "ALS Based Recommendations": "als",
};

export function getModelType(sectionHeading: string): string {
    return modelMap[sectionHeading] || "default";
}  