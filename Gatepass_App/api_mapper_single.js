
// import fs from "fs";
// import path from "path";
// import * as XLSX from "xlsx";

// // 🔧 CONFIGURE YOUR PATHS HERE
// const frontendRootFolder = path.join("src");
// const backendFile = path.join("..", "Backend", "server.cjs");
// const outputFile = path.join("..", "API_Mapping_Full_Frontend.xlsx");

// let mapping = [];

// // 📘 Step 1: Recursively scan the root folder and extract axios calls
// function scanRootFolderRecursively(currentPath) {
//     if (!fs.existsSync(currentPath)) {
//         console.error("❌ Folder not found:", currentPath);
//         return;
//     }

//     const filesAndFolders = fs.readdirSync(currentPath);

//     filesAndFolders.forEach(item => {
//         const itemPath = path.join(currentPath, item);
//         const stat = fs.statSync(itemPath);

//         if (stat.isDirectory()) {
//             if (["node_modules", "dist", "build"].includes(item) || item.startsWith(".")) {
//                 return;
//             }
//             scanRootFolderRecursively(itemPath);
//         } else if (/\.(js|jsx|ts|tsx)$/i.test(item) && !item.includes(".test.") && !item.includes(".spec.")) {
//             const moduleName = path.basename(itemPath);
//             scanSingleFrontendFile(itemPath, moduleName);
//         }
//     });
// }

// // 📘 Step 2: Extract axios calls from a single frontend file (ignores comments)
// function scanSingleFrontendFile(filePath, moduleName) {
//     try {
//         const rawContent = fs.readFileSync(filePath, "utf8");
//         let fileAPICount = 0;

//         const content = rawContent.replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multiline comments

//         // Handles axios.get/post/put/delete formats with SERVER_PORT
//         const axiosRegex = /(?<!\/\/.*)axios\.(get|post|put|delete)\s*\(\s*[`'"]\s*\$\{SERVER_PORT\}\/([^`'"\s)+]+)[^)]*\)/gi;

//         let match;
//         while ((match = axiosRegex.exec(content)) !== null) {
//             const fullAPICall = match[0].trim();

//             mapping.push({
//                 Module: moduleName,
//                 FrontEndAPICall: fullAPICall,
//                 BackEndAPICall: "",
//                 Query: "",
//             });
//             fileAPICount++;
//         }

//         if (fileAPICount > 0) console.log(`🟢 Found ${fileAPICount} API calls in ${moduleName}`);
//     } catch (error) {
//         console.error(`❌ Error reading file ${moduleName}: ${error.message}`);
//     }
// }

// // 📗 Step 3: Extract backend routes + SQL from server.cjs and perform matching
// function scanBackend() {
//     if (!fs.existsSync(backendFile)) {
//         console.error("❌ Backend file not found:", backendFile);
//         return;
//     }

//     const content = fs.readFileSync(backendFile, "utf8");
//     console.log(`📖 Backend file size: ${content.length} characters`);

//     const contentWithoutComments = content.replace(/\/\*[\s\S]*?\*\//g, "");

//     const routePatterns = [
//         /app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:async\s*)?\(\s*req\s*,\s*res\s*\)\s*=>?\s*\{/gi,
//         /app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:async\s*)?function\s*\(\s*req\s*,\s*res\s*\)\s*\{/gi,
//         /app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\([^)]*\)\s*=>?\s*\{/gi,
//     ];

//     let routes = [];

//     routePatterns.forEach(pattern => {
//         let match;
//         while ((match = pattern.exec(contentWithoutComments)) !== null) {
//             const [, method, route] = match;
//             const routeStart = match.index;

//             const routeEnd = findCompleteRouteFunction(contentWithoutComments, routeStart);
//             if (routeEnd > routeStart) {
//                 const routeBody = contentWithoutComments.substring(routeStart, routeEnd);

//                 const sqlQueries = extractAllSQLQueries(routeBody);

//                 routes.push({
//                     method: method.toUpperCase(),
//                     route,
//                     signature: `${method.toUpperCase()} ${route}`,
//                     sql: sqlQueries.length > 0 ? sqlQueries.join("\n\n--- NEXT QUERY ---\n\n") : "N/A",
//                 });
//             }
//         }
//     });

//     console.log(`\n🟢 Found ${routes.length} backend routes in ${path.basename(backendFile)}`);

//     mapping = mapping.map(m => {
//         const frontendCall = m.FrontEndAPICall;
//         const apiPathMatch = frontendCall.match(/\$\{SERVER_PORT\}\/([^/`'"\s)+]+)/i);
//         if (!apiPathMatch) return { ...m, BackEndAPICall: "Cannot parse API path", Query: "N/A" };

//         const apiBasePath = apiPathMatch[1];
//         const httpMethod =
//             frontendCall.includes("axios.get") ? "GET" :
//             frontendCall.includes("axios.post") ? "POST" :
//             frontendCall.includes("axios.put") ? "PUT" : "DELETE";

//         const foundRoute = findMatchingBackendRoute(routes, apiBasePath, httpMethod);

//         return {
//             ...m,
//             BackEndAPICall: foundRoute ? foundRoute.signature : "Not Found",
//             Query: foundRoute ? foundRoute.sql : "Not Found",
//         };
//     });
// }

// // 🧩 Updated SQL Extraction Function
// function extractAllSQLQueries(routeBody) {
//   const queries = [];

//   // 1️⃣ Basic patterns (single/double/backtick quotes)
//   const queryRegexes = [
//     /db\.query\s*\(\s*`([\s\S]*?)`\s*[,)]/g,   // Template literals
//     /db\.query\s*\(\s*'([\s\S]*?)'\s*[,)]/g,   // Single quotes
//     /db\.query\s*\(\s*"([\s\S]*?)"\s*[,)]/g    // Double quotes
//   ];

//   for (const regex of queryRegexes) {
//     let match;
//     while ((match = regex.exec(routeBody)) !== null) {
//       const sql = match[1].trim();
//       if (isValidSQL(sql)) queries.push(sql);
//     }
//   }

//   // 2️⃣ await db.query('SQL', [params])
//   const awaitQueryRegex = /await\s+db\.query\s*\(\s*([`'"])([\s\S]*?)\1\s*,\s*\[.*?\]\s*\)/g;
//   let awaitMatch;
//   while ((awaitMatch = awaitQueryRegex.exec(routeBody)) !== null) {
//     const sql = awaitMatch[2].trim();
//     if (isValidSQL(sql)) queries.push(sql);
//   }

//   // 3️⃣ db.query("SQL", [params], async (err, results) => {)
//   const callbackQueryRegex = /db\.query\s*\(\s*([`'"])([\s\S]*?)\1\s*,\s*\[.*?\]\s*,\s*(?:async\s*)?\(.*?\)\s*=>/g;
//   let cbMatch;
//   while ((cbMatch = callbackQueryRegex.exec(routeBody)) !== null) {
//     const sql = cbMatch[2].trim();
//     if (isValidSQL(sql)) queries.push(sql);
//   }

//   // 4️⃣ Queries stored in variables (const sql = 'SELECT ...')
//   const variableQueryRegex = /(?:const|let|var)\s+\w+\s*=\s*([`'"])([\s\S]*?)\1\s*;/g;
//   let varMatch;
//   while ((varMatch = variableQueryRegex.exec(routeBody)) !== null) {
//     const sql = varMatch[2].trim();
//     if (isValidSQL(sql)) queries.push(sql);
//   }

//   // 5️⃣ handle simple patterns like: const result = await db.query('SELECT * FROM table');
//   const simpleAwaitRegex = /await\s+db\.query\s*\(\s*([`'"])([\s\S]*?)\1\s*\)/g;
//   let simpleMatch;
//   while ((simpleMatch = simpleAwaitRegex.exec(routeBody)) !== null) {
//     const sql = simpleMatch[2].trim();
//     if (isValidSQL(sql)) queries.push(sql);
//   }

//   // 🔁 Remove duplicates + clean up
//   const uniqueQueries = [...new Set(queries.map(q => q.replace(/\s+/g, ' ').trim()))];
//   return uniqueQueries.length ? uniqueQueries : ["N/A"];
// }


// // 🧩 Route Matching + Helpers
// function findMatchingBackendRoute(routes, frontendPath, httpMethod) {
//     for (const route of routes) {
//         if (route.method !== httpMethod) continue;
//         const backendPath = route.route;

//         if (backendPath === `/${frontendPath}`) return route;

//         const backendBasePath = backendPath.split("/:")[0];
//         if (backendBasePath && frontendPath.startsWith(backendBasePath.substring(1))) return route;

//         if (backendPath.substring(1) === frontendPath) return route;

//         if (backendPath.toLowerCase().substring(1) === frontendPath.toLowerCase()) return route;
//     }
//     return null;
// }

// function findCompleteRouteFunction(content, startIndex) {
//     let braceCount = 0;
//     let foundFirstBrace = false;

//     for (let i = startIndex; i < content.length; i++) {
//         if (content[i] === "{") {
//             braceCount++;
//             foundFirstBrace = true;
//         } else if (content[i] === "}") braceCount--;

//         if (foundFirstBrace && braceCount === 0) return i + 1;
//         if (i - startIndex > 10000) return i;
//     }
//     return content.length;
// }

// function isValidSQL(text) {
//     if (!text || text.length < 5) return false;
//     const keywords = [
//         "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER",
//         "FROM", "WHERE", "JOIN", "VALUES", "RETURNING", "INTO", "SET",
//     ];
//     const upper = text.toUpperCase().replace(/\s+/g, " ");
//     return keywords.some(k => upper.includes(k));
// }

// // 📙 Step 4: Export to Excel
// function exportToExcel() {
//     if (!mapping.length) {
//         console.warn("⚠️ No mappings to export.");
//         return;
//     }

//     const ws = XLSX.utils.json_to_sheet(mapping);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "API_Mapping");

//     ws["!cols"] = [
//         { wch: 30 },
//         { wch: 50 },
//         { wch: 40 },
//         { wch: 80 },
//     ];

//     XLSX.writeFile(wb, outputFile);
//     console.log(`\n✅ Full API mapping generated → ${outputFile}`);
// }

// // 🚀 Run
// console.log(`🔍 Scanning files recursively starting from: ${frontendRootFolder}...`);
// scanRootFolderRecursively(frontendRootFolder);
// scanBackend();
// exportToExcel();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

// 🔧 CONFIGURE YOUR PATHS HERE
// NOTE: This assumes the script is run from a root directory that contains 'src'
// and has a sibling 'Backend' folder containing 'server.cjs'.
const frontendRootFolder = path.join("src");
const backendFile = path.join("..", "Backend", "server.cjs");
const outputExcelFile = path.join("..", "API_Mapping_Full_Frontend.xlsx");
const cleanedBackendFile = path.join("..", "Backend", "server.cleaned.cjs");

let mapping = [];
let allBackendRoutes = [];
let allFrontendAPIs = new Set(); // Track unique frontend APIs
let originalBackendContent = "";

// 📘 Step 1: Recursively scan the root folder and extract axios calls
function scanRootFolderRecursively(currentPath) {
    if (!fs.existsSync(currentPath)) {
        console.error("❌ Folder not found:", currentPath);
        return;
    }

    const filesAndFolders = fs.readdirSync(currentPath);

    filesAndFolders.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (["node_modules", "dist", "build", ".git"].includes(item) || item.startsWith(".")) {
                return;
            }
            scanRootFolderRecursively(itemPath);
        } else if (/\.(js|jsx|ts|tsx)$/i.test(item) && !item.includes(".test.") && !item.includes(".spec.")) {
            const moduleName = path.basename(itemPath);
            scanSingleFrontendFile(itemPath, moduleName);
        }
    });
}

// 📘 Step 2: Extract ALL axios calls from a single frontend file
function scanSingleFrontendFile(filePath, moduleName) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        let fileAPICount = 0;

        // 📝 Customization Point 1: Add new patterns for non-Axios clients here
        const clientPatterns = [
            // AXIOS PATTERNS (Existing Logic - Indices 0, 1, 2):
            
            // 0. Matches axios.method(`.../${path}`) or axios.method("${path}") etc.
            /axios\.(get|post|put|delete|patch)\s*\(\s*['"`](?:[^'"`]*?)\/([^'"`]*?)['"`]/gi,
            
            // 1. Handles cases where the URL is a variable or part of a variable concatenation (less precise, but captures more)
            /axios\.(get|post|put|delete|patch)\s*\(\s*(\w+)\s*\+\s*['"`]\/([^'"`]*?)['"`]/gi,
            
            // 2. Matches plain strings/template literals without explicit SERVER_PORT
            /axios\.(get|post|put|delete|patch)\s*\(\s*([`'"])\s*\/([^'"`]*?)\2/gi,
            
            // --- INSERT NEW CLIENT PATTERNS BELOW ---
            
            // 3. FETCH PATTERN: Matches simple fetch(URL) calls. Assumes GET. Path is in capture group 1.
            /\bfetch\s*\(\s*['"`](?:[^'"`]*?)\/([^'"`]+)['"`]/gi, 
            
            // --- INSERT OTHER CUSTOM CLIENT PATTERNS HERE ---
            // Remember to update the extraction logic below (around line 73) for any new pattern.
        ];

        clientPatterns.forEach((pattern, patternIndex) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                
                let method = 'GET'; // Default to GET for generic patterns (e.g., fetch)
                let apiPath;
                
                // Extraction logic must be adjusted if you add new patterns
                if (patternIndex <= 2) {
                    // Logic for Axios patterns 0, 1, 2 (Method is in match[1])
                    method = match[1].toUpperCase();
                    apiPath = (patternIndex === 0) ? match[2] : match[3];
                } else if (patternIndex === 3) {
                    // Logic for FETCH pattern (Index 3). Assumes GET. Path is in match[1].
                    apiPath = match[1]; 
                    // NOTE: Parsing the method (POST/PUT/etc.) for fetch requires looking inside the options object, 
                    // which is complex for regex and is currently ignored for simplicity.
                } else {
                    // Custom client logic (you must adjust match indices based on your new regex)
                    // Example: apiPath = match[1]; 
                    // Example: method = 'POST'; // If you know the method for this pattern
                    continue; // Skip if no custom extraction logic is written
                }


                // Clean up the path
                apiPath = apiPath.replace(/[`'")\s,]+$/g, ''); 
                
                // Remove dynamic template variables and parameters from the path for base matching
                let basePath = apiPath.replace(/\$\{[^}]+\}/g, '') // Remove ${anything}
                                         .replace(/\/+$/, '') // Remove trailing slashes
                                         .replace(/\/+/g, '/') // Clean multiple slashes
                                         .trim();
                
                // Only consider paths that aren't empty after cleaning
                if (!basePath) continue;

                const apiKey = `${method} /${basePath}`;
                
                if (allFrontendAPIs.has(apiKey)) {
                    continue;
                }
                
                allFrontendAPIs.add(apiKey);

                mapping.push({
                    Module: moduleName,
                    FrontEndAPICall: match[0].trim().replace(/\s+/g, ' '),
                    ExtractedPath: apiPath,
                    BasePath: basePath,
                    BackEndAPICall: "",
                    Query: "",
                    Status: "Used",
                    MatchType: "",
                    HttpMethod: method
                });
                fileAPICount++;
            }
        });

        if (fileAPICount > 0) {
             // console.log(`🟢 Extracted ${fileAPICount} unique API calls from ${moduleName}`);
        }
    } catch (error) {
        console.error(`❌ Error reading file ${moduleName}: ${error.message}`);
    }
}

// 📗 Step 3: Extract backend routes + SQL from server.cjs
function scanBackend() {
    if (!fs.existsSync(backendFile)) {
        console.error("❌ Backend file not found:", backendFile);
        return;
    }

    originalBackendContent = fs.readFileSync(backendFile, "utf8");
    const content = originalBackendContent;
    
    // 📝 Customization Point 2: Backend Route Patterns
    // Add logic here if your Express app uses a global base path, e.g., app.use('/api/v1', router)
    const routePatterns = [
        /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    ];

    allBackendRoutes = [];

    routePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const [fullMatch, method, route] = match;
            const routeStart = match.index;
            
            // 1. Find the opening brace of the function body
            let bodyStartIndex = -1;
            let tempIndex = routeStart + fullMatch.length;
            let braceCount = 0;
            
            // Scan forward to find the function signature end and the main opening brace
            while (tempIndex < content.length) {
                if (content[tempIndex] === '{') {
                    // Check if the brace is for the main function block
                    if (braceCount === 0) {
                        bodyStartIndex = tempIndex;
                        break;
                    }
                    braceCount++;
                } else if (content[tempIndex] === '}') {
                    braceCount--;
                }
                tempIndex++;
            }
            
            if (bodyStartIndex === -1) continue;
            
            // 2. Find the full closing brace for the function
            const routeEnd = findCompleteBlockEnd(content, bodyStartIndex);
            
            if (routeEnd > bodyStartIndex) {
                // Extract route body (including the final closing '}')
                const routeBody = content.substring(bodyStartIndex, routeEnd); 
                
                const sqlQueries = extractAllSQLQueries(routeBody);
                
                // Create base path without parameters for matching
                const basePath = route.replace(/\/:[^/]+/g, '').replace(/^\/+/, '');
                
                allBackendRoutes.push({
                    method: method.toUpperCase(),
                    route: route.trim(),
                    basePath: basePath,
                    signature: `${method.toUpperCase()} ${route.trim()}`,
                    sql: sqlQueries.join("\n\n--- NEXT QUERY ---\n\n"),
                    used: false,
                    startIndex: routeStart,
                    endIndex: routeEnd // End index points just after the closing brace
                });
            }
        }
    });

    console.log(`\n🟢 Found ${allBackendRoutes.length} backend routes in ${backendFile}`);
}

// 🧩 Matching and Reporting
function processMapping() {
    let matchedCount = 0;

    mapping = mapping.map(m => {
        const basePath = m.BasePath;
        const httpMethod = m.HttpMethod;

        const matchResult = findExactMatchingBackendRoute(allBackendRoutes, basePath, httpMethod);

        if (matchResult.found) {
            matchResult.route.used = true;
            matchedCount++;
            
            return {
                Module: m.Module,
                FrontEndAPICall: m.FrontEndAPICall,
                ExtractedPath: m.ExtractedPath,
                BackEndAPICall: matchResult.route.signature,
                Query: matchResult.route.sql,
                Status: "Used",
                MatchType: matchResult.type,
                HttpMethod: httpMethod
            };
        } else {
            return {
                Module: m.Module,
                FrontEndAPICall: m.FrontEndAPICall,
                ExtractedPath: m.ExtractedPath,
                BackEndAPICall: "NOT FOUND IN BACKEND",
                Query: "N/A",
                Status: "Backend Not Found",
                MatchType: "No Match",
                HttpMethod: httpMethod
            };
        }
    });

    console.log(`🔗 Matched ${matchedCount} out of ${mapping.length} unique frontend calls`);
    
    // Add unused backend routes to mapping report
    addUnusedBackendRoutesToReport();
}

// 🧩 EXACT Route Matching Function
function findExactMatchingBackendRoute(routes, baseFrontendPath, httpMethod) {
    // 1. Exact base path match + Method match
    for (const route of routes) {
        if (route.method === httpMethod && route.basePath === baseFrontendPath) {
            return {
                found: true,
                route: route,
                type: "Base Path + Method Match"
            };
        }
    }
    
    // 2. Parameterized route match (less safe, but necessary)
    // Checks if the frontend path is a direct prefix of a parameterized backend route
    for (const route of routes) {
        if (route.method === httpMethod && route.route.startsWith(`/${baseFrontendPath}/`)) {
            return {
                found: true,
                route: route,
                type: "Parameterized Route Match (Prefix)"
            };
        }
    }

    return { found: false };
}

// 📗 Step 3.5: Add unused backend routes to the mapping report
function addUnusedBackendRoutesToReport() {
    const unusedRoutes = allBackendRoutes.filter(route => !route.used);
    
    console.log(`\n🔍 Found ${unusedRoutes.length} UNUSED backend routes (candidates for removal).`);
    
    unusedRoutes.forEach(route => {
        mapping.push({
            Module: "BACKEND-ONLY",
            FrontEndAPICall: "NOT USED IN FRONTEND",
            ExtractedPath: "N/A",
            BackEndAPICall: route.signature,
            Query: route.sql,
            Status: "UNUSED",
            MatchType: "Unused",
            HttpMethod: route.method
        });
    });
}

// 🧩 SQL Extraction Function (Uses a slightly simplified version that handles common cases)
function extractAllSQLQueries(routeBody) {
    const queries = [];
    // Regex for: db.query(`...`) or db.query('...') or db.query("...") 
    const queryRegex = /db\.query\s*\(\s*([`'"])([\s\S]*?)\1\s*[,)]/g;
    
    let match;
    while ((match = queryRegex.exec(routeBody)) !== null) {
        const sql = match[2].trim();
        if (isValidSQL(sql)) queries.push(sql.replace(/\s+/g, ' '));
    }
    
    const uniqueQueries = [...new Set(queries)];
    return uniqueQueries.length ? uniqueQueries : ["N/A"];
}

// Function to find the end of a block (matching braces)
function findCompleteBlockEnd(content, bodyStartIndex) {
    let braceCount = 0;
    let inString = false;
    let quoteChar = null;

    for (let i = bodyStartIndex; i < content.length; i++) {
        const char = content[i];

        if (inString) {
            if (char === quoteChar && content[i - 1] !== '\\') {
                inString = false;
                quoteChar = null;
            }
        } else {
            if (['"', "'", '`'].includes(char)) {
                inString = true;
                quoteChar = char;
            } else if (char === "{") {
                braceCount++;
            } else if (char === "}") {
                braceCount--;
            }

            // We found the initial brace at bodyStartIndex (so count starts at 1)
            // When count returns to 0, we've found the matching closing brace.
            if (i > bodyStartIndex && braceCount === 0) { 
                // We've found the closing brace. Find the end of the full statement (usually a semicolon or newline)
                let end = i + 1;
                while(end < content.length && (content[end] === ' ' || content[end] === '\n' || content[end] === '\r' || content[end] === ';')) {
                    end++;
                }
                // Also check for the app.listen() or other code after the block
                if (end < content.length && content.substring(end, end + 3).toLowerCase() === 'app') {
                    // It's likely a chained call like app.post(...).then(...) 
                    // To be safe, we stop right after the closing brace, allowing for a semicolon to be removed later
                    return i + 1; 
                }
                return end;
            }
        }
    }
    return content.length;
}

function isValidSQL(text) {
    if (!text || text.length < 5) return false;
    const keywords = [
        "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER",
        "FROM", "WHERE", "JOIN", "VALUES", "RETURNING", "INTO", "SET",
    ];
    const upper = text.toUpperCase().replace(/\s+/g, " ");
    return keywords.some(k => upper.includes(k));
}

// 🚨 Step 5: REMOVE UNUSED ROUTES and write the new file
function removeUnusedBackendRoutes(originalContent) {
    // Get only the UNUSED routes, sorted by index from end to start
    const unusedRoutes = allBackendRoutes
        .filter(route => !route.used)
        .sort((a, b) => b.startIndex - a.startIndex); 

    if (unusedRoutes.length === 0) {
        return originalContent;
    }

    console.log(`\n✂️ Starting removal of ${unusedRoutes.length} unused routes...`);
    let modifiedContent = originalContent;

    for (const route of unusedRoutes) {
        console.log(`   🗑️ Removing: ${route.signature} (Index: ${route.startIndex} to ${route.endIndex})`);
        
        // Remove the code segment (start to end index)
        const before = modifiedContent.substring(0, route.startIndex);
        const after = modifiedContent.substring(route.endIndex);
        
        modifiedContent = before + after;
    }
    
    // Clean up excessive empty lines introduced by removal
    modifiedContent = modifiedContent.replace(/(\n\s*\n){2,}/g, '\n\n'); 

    return modifiedContent;
}

// 📙 Step 4: Export to Excel with comprehensive reporting
function exportToExcel() {
    if (!mapping.length) {
        console.warn("⚠️ No mappings to export.");
        return;
    }

    const usedCount = mapping.filter(m => m.Status === "Used").length;
    const unusedCount = mapping.filter(m => m.Status === "UNUSED").length;
    
    const ws = XLSX.utils.json_to_sheet(mapping);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "API_Mapping");

    // Summary sheet
    const unusedAPIs = mapping.filter(m => m.Status === "UNUSED");
    const summaryData = [
        ["COMPREHENSIVE API MAPPING REPORT"],
        ["Generated Date", new Date().toLocaleString()],
        ["Backend File", backendFile],
        [""],
        ["STATISTICS", "COUNT"],
        ["Used APIs (Frontend → Backend)", usedCount],
        ["Unused Backend Routes (Dead Code)", unusedCount],
        [""],
        ["UNUSED BACKEND APIs (Removed from server.cleaned.cjs)", ""],
        ...unusedAPIs.map(api => [api.BackEndAPICall, "❌ UNUSED"]),
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    ws["!cols"] = [
        { wch: 25 }, { wch: 80 }, { wch: 30 }, { wch: 40 }, 
        { wch: 80 }, { wch: 20 }, { wch: 25 }, { wch: 10 } 
    ];

    XLSX.writeFile(wb, outputExcelFile);
    console.log(`\n✅ Full API mapping report generated → ${outputExcelFile}`);
}

// 💾 Write the cleaned file
function writeCleanedBackendFile(content) {
    if (content === originalBackendContent) {
        console.log("\n✨ No changes made to the backend file.");
        return;
    }
    fs.writeFileSync(cleanedBackendFile, content);
    console.log(`\n🎉 CLEANUP COMPLETE! The cleaned backend code is in → ${cleanedBackendFile}`);
    console.log("Please review this file before replacing your original server.cjs.");
}

// Main execution function
function init() {
    console.log(`🚀 STARTING COMPREHENSIVE API CLEANER...`);
    
    // Step 1 & 2: Scan frontend and extract used APIs
    scanRootFolderRecursively(frontendRootFolder);
    
    // Step 3: Scan backend, extract all routes, and get the original content
    scanBackend();
    
    // Step 4: Match frontend usage against backend routes and generate report data
    processMapping();
    
    // Step 5: Export the detailed report to Excel
    exportToExcel();
    
    // Step 6: Perform the physical removal and write the cleaned file
    const newBackendContent = removeUnusedBackendRoutes(originalBackendContent);
    writeCleanedBackendFile(newBackendContent);
}

init();
