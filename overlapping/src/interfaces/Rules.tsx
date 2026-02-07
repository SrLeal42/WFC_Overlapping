export interface Rules {
    up: number[];    // Lista de IDs permitidos acima
    down: number[];  // Lista de IDs permitidos abaixo
    left: number[];  // Lista de IDs permitidos à esquerda
    right: number[]; // Lista de IDs permitidos à direita
}