import * as C from '../constants/Constants';

// Pinta um único pixel visualmente
export const PaintPixel = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * C.DRAW_PIXEL_SCALE, y * C.DRAW_PIXEL_SCALE, C.DRAW_PIXEL_SCALE, C.DRAW_PIXEL_SCALE);
};

// Redesenha o canvas inteiro baseado em uma grid
export const RedrawCanvas = (ctx: CanvasRenderingContext2D, grid: C.ColorGrid) => {
    ctx.clearRect(0, 0, C.DRAW_CANVAS_SIZE, C.DRAW_CANVAS_SIZE);
    
    // Otimização: Poderia pintar um fundo único primeiro se a maioria for default
    // mas o loop abaixo funciona bem.
    for (let y = 0; y < C.DRAW_GRID_SIZE; y++) {
        for (let x = 0; x < C.DRAW_GRID_SIZE; x++) {
            PaintPixel(ctx, x, y, grid[y][x]);
        }
    }
};

// Algoritmo Flood Fill (Modifica a grid E pinta o canvas)
export const FloodFill = (
    ctx: CanvasRenderingContext2D, 
    grid: C.ColorGrid, 
    startX: number, 
    startY: number, 
    newColor: string
) => {
    const targetColor = grid[startY][startX];
    if (targetColor === newColor) return;

    const stack: [number, number][] = [[startX, startY]];
    ctx.fillStyle = newColor;

    while (stack.length > 0) {
        const [x, y] = stack.pop()!;

        if (x < 0 || x >= C.DRAW_GRID_SIZE || y < 0 || y >= C.DRAW_GRID_SIZE) continue;
        if (grid[y][x] !== targetColor) continue;

        // Atualiza Lógica
        grid[y][x] = newColor;
        // Atualiza Visual
        ctx.fillRect(x * C.DRAW_PIXEL_SCALE, y * C.DRAW_PIXEL_SCALE, C.DRAW_PIXEL_SCALE, C.DRAW_PIXEL_SCALE);

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }
};