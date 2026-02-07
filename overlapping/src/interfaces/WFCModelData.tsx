import { type Pattern } from "../constants/types/PatternBuilder.type";
import { type Rules } from "./Rules";

export interface WFCModelData {
    n: number;                   // Tamanho do padrão (ex: 3)
    patterns: Pattern[];         // Lista de todos os padrões únicos encontrados
    weights: number[];           // Peso (frequência) de cada padrão
    rules: Record<number, Rules>;// O mapa de regras: ID do Padrão -> Regras
}