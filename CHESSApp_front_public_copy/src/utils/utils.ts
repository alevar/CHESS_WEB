export type PathParts = {
    params: Record<string, string>;
    remainder: string;
};

export function parsePathname(pathname: string): PathParts {
    const params: Record<string, string> = {};
    let remainder = "";

    // Remove any leading or trailing slashes and split the pathname by "/"
    const parts = pathname.replace(/^\/|\/$/g, "").split("/");
    let paramsDone = false;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Check if part is in the "key:value" format
        if (!paramsDone && part.includes(":")) {
            const [key, value] = part.split(":", 2);
            if (key && value) {
                params[key] = value;
            }
        } else {
            // Stop parsing params and set the remainder
            paramsDone = true;
            remainder = parts.slice(i).join("/");
            break;
        }
    }

    return { params, remainder };
}

export function buildPathname(pathParts: PathParts): string {
    const { params, remainder } = pathParts;
    const paramStr = Object.entries(params)
        .map(([key, value]) => `${key}:${value}`)
        .join("/");
    return `/${paramStr}/${remainder}`;
}