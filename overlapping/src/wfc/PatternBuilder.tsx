
import { type Pattern, type Direction } from "../constants/types/PatternBuilder.type";
import { type Rules } from "../interfaces/Rules";
import { type WFCModelData } from "../interfaces/WFCModelData";


// --- CONFIGURAÇÃO ---
const MAX_WEIGHT = 100;
const MIN_WEIGHT = 1;


export function BuildWFCModel(inputGrid: string[][], N: number = 3): WFCModelData {
    console.time("WFC Builder");
    
    const height = inputGrid.length;
    const width = inputGrid[0].length;

    // 1. Extração de Padrões Únicos
    // Map: Chave (String do Padrão) -> Valor { padrão, contagem }
    const patternMap = new Map<string, { pattern: Pattern, weight: number }>();

    for (let y = 0; y <= height - N; y++) {
        for (let x = 0; x <= width - N; x++) {
            
            // Extrai o pedaço NxN da grade
            const pattern: Pattern = [];
            for (let dy = 0; dy < N; dy++) {
                pattern[dy] = [];
                for (let dx = 0; dx < N; dx++) {
                    pattern[dy][dx] = inputGrid[y + dy][x + dx];
                }
            }

            const key = JSON.stringify(pattern);
            const entry = patternMap.get(key);
            
            if (entry) {
                entry.weight++;
            } else {
                patternMap.set(key, { pattern: pattern, weight: 1 });
            }
        }
    }

    // 2. Compilar Lista de Padrões e Normalizar Pesos
    const uniquePatterns = Array.from(patternMap.values());
    
    // Calcula pesos normalizados (para evitar que uma cor comum domine tudo excessivamente)
    const rawWeights = uniquePatterns.map(p => p.weight);
    const maxRaw = Math.max(...rawWeights);
    const minRaw = Math.min(...rawWeights);

    const patterns: Pattern[] = [];
    const weights: number[] = [];

    uniquePatterns.forEach((item, _) => {
        patterns.push(item.pattern);
        
        const normalized = NormalizeWeight(item.weight, maxRaw, minRaw, MAX_WEIGHT, MIN_WEIGHT);
        weights.push(normalized);
    });

    // console.log(`[WFC Builder] Encontrados ${patterns.length} padrões únicos.`);

    // 3. Calcular Regras de Sobreposição (Adjacency Rules)
    // Compara cada padrão com todos os outros para ver se encaixam
    const rules: Record<number, Rules> = {};

    for (let i = 0; i < patterns.length; i++) {
        const p1 = patterns[i];
        rules[i] = { up: [], down: [], left: [], right: [] };

        for (let j = 0; j < patterns.length; j++) {
            const p2 = patterns[j];

            // Checa sobreposição em todas as direções
            if (CheckOverlap(p1, p2, N, "right")) rules[i].right.push(j);
            if (CheckOverlap(p1, p2, N, "left"))  rules[i].left.push(j);
            if (CheckOverlap(p1, p2, N, "down"))  rules[i].down.push(j);
            if (CheckOverlap(p1, p2, N, "up"))    rules[i].up.push(j);
        }
    }

    console.timeEnd("WFC Builder");

    return {
        n: N,
        patterns,
        weights,
        rules
    };
}

// --- FUNÇÕES AUXILIARES (Lógica Pura) ---

function NormalizeWeight(val: number, maxRaw: number, minRaw: number, maxOut: number, minOut: number): number {
    if (maxRaw === minRaw) return minOut;
    return Math.round(((val - minRaw) / (maxRaw - minRaw)) * (maxOut - minOut) + minOut);
}

function CheckOverlap(p1: Pattern, p2: Pattern, N: number, direction: Direction): boolean {
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            
            if (direction === "right") {
                // P1(x+1) == P2(x) (exceto última coluna de P1 e primeira de P2)
                if (x < N - 1 && p1[y][x + 1] !== p2[y][x]) return false;
            } 
            else if (direction === "left") {
                // P1(x) == P2(x+1)
                if (x < N - 1 && p1[y][x] !== p2[y][x + 1]) return false;
            }
            else if (direction === "down") {
                // P1(y+1) == P2(y)
                if (y < N - 1 && p1[y + 1][x] !== p2[y][x]) return false;
            }
            else if (direction === "up") {
                // P1(y) == P2(y+1)
                if (y < N - 1 && p1[y][x] !== p2[y + 1][x]) return false;
            }
        }
    }
    return true;
}