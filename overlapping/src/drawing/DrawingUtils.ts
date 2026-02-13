import * as C from '../constants/Constants';

// Cria uma grid vazia
export const CreateEmptyGrid = (): C.ColorGrid => {
    return Array(C.DRAW_GRID_SIZE).fill(null).map(() => Array(C.DRAW_GRID_SIZE).fill(C.DEFAULT_COLOR));
};

// Clona a grid (Deep Copy)
export const CloneGrid = (grid: C.ColorGrid): C.ColorGrid => {
    return grid.map(row => [...row]);
};

// Calcula coordenadas do mouse relativas ao grid
export const GetMouseCoords = (e: React.MouseEvent, canvas: HTMLCanvasElement): { x: number, y: number } | null => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / C.DRAW_PIXEL_SCALE);
    const y = Math.floor((e.clientY - rect.top) / C.DRAW_PIXEL_SCALE);

    if (x >= 0 && x < C.DRAW_GRID_SIZE && y >= 0 && y < C.DRAW_GRID_SIZE) {
        return { x, y };
    }
    return null;
};