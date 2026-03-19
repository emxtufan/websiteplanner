
import React from "react";
import * as LucideIcons from "lucide-react";
import * as FramerMotion from "framer-motion";
import { transform } from "sucrase";
import { cn } from "./utils";

// Centralized helper to turn string code into a React component
export const createComponentFromCode = (code: string) => {
    if (!code) return null;

    try {
        const injections: string[] = [];
        
        // Helper to process imports and map them to injected objects
        const processLibraryImports = (libName: string, sourceObjName: string) => {
            const namedImportRegex = new RegExp(`import\\s+\\{([\\s\\S]*?)\\}\\s+from\\s+['"]${libName}['"]`, 'g');
            let match;
            while ((match = namedImportRegex.exec(code)) !== null) {
                const imports = match[1].split(',').map(i => i.trim()).filter(Boolean);
                imports.forEach(imp => {
                    const parts = imp.split(/\s+as\s+/);
                    if (parts.length === 2) {
                        injections.push(`const ${parts[1].trim()} = ${sourceObjName}.${parts[0].trim()};`);
                    } else {
                        injections.push(`const ${imp} = ${sourceObjName}.${imp};`);
                    }
                });
            }

            const namespaceRegex = new RegExp(`import\\s+\\*\\s+as\\s+([a-zA-Z0-9_]+)\\s+from\\s+['"]${libName}['"]`, 'g');
            while ((match = namespaceRegex.exec(code)) !== null) {
                injections.push(`const ${match[1]} = ${sourceObjName};`);
            }

            const defaultRegex = new RegExp(`import\\s+([a-zA-Z0-9_]+)\\s+from\\s+['"]${libName}['"]`, 'g');
            while ((match = defaultRegex.exec(code)) !== null) {
                if (match[1] !== sourceObjName) {
                    injections.push(`const ${match[1]} = ${sourceObjName};`);
                }
            }
        };

        processLibraryImports('lucide-react', 'Lucide');
        processLibraryImports('react', 'React');
        processLibraryImports('framer-motion', 'Motion');

        // Inject React hooks directly into the scope
        const hooks = [
            'useState', 'useEffect', 'useMemo', 'useCallback', 
            'useRef', 'useContext', 'useReducer', 'useLayoutEffect'
        ];
        hooks.forEach(hook => {
            injections.push(`const ${hook} = React.${hook};`);
        });

        let cleanCode = code
            .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
            .replace(/export\s+default\s+/g, 'const DefaultExport = ')
            .replace(/export\s+const\s+/g, 'const ')
            .replace(/export\s+function\s+/g, 'function ');

        if (!cleanCode.includes('const DefaultExport =')) {
            const matches = Array.from(cleanCode.matchAll(/(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/g));
            if (matches.length > 0) {
                const lastComponentName = matches[matches.length - 1][1];
                cleanCode += `\nconst DefaultExport = ${lastComponentName};`;
            }
        }

        const transformed = transform(cleanCode, {
            transforms: ["jsx", "typescript"],
            jsxRuntime: "classic",
        }).code;

        const func = new Function('React', 'Lucide', 'Motion', 'cn', 'props', `
            const { data, onOpenRSVP } = props;
            ${injections.join('\n')}
            try {
                ${transformed}
                return React.createElement(DefaultExport, props);
            } catch (e) {
                return React.createElement('div', { className: 'p-8 text-red-500 border border-red-200 rounded-lg bg-red-50' }, 
                    React.createElement('h3', { className: 'font-bold' }, 'Eroare la execuția template-ului:'),
                    React.createElement('p', { className: 'text-sm' }, e.message)
                );
            }
        `);
        
        return (props: any) => func(React, LucideIcons, FramerMotion, cn, props);
    } catch (e: any) {
        console.error("Compilation error:", e);
        return () => (
            <div className="p-8 text-red-500 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-bold">Eroare de compilare template:</h3>
                <p className="text-sm">{e.message}</p>
            </div>
        );
    }
};

/**
 * A container that isolates the preview.
 * Using transform: translate(0,0) makes fixed elements relative to this container.
 */
export const PreviewContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("relative w-full h-full overflow-hidden bg-white dark:bg-zinc-950 overflow-y-auto overflow-x-hidden", className)} style={{ transform: 'translate(0,0)' }}>
        {children}
    </div>
);

export const DeviceFrame = ({ children }: { children: React.ReactNode }) => (
    <PreviewContainer>
                {children}
            </PreviewContainer>
);
