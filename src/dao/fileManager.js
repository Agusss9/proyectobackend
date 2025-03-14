import fs from "fs";

const readFile = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, "utf-8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error(`Error leyendo ${file}:`, error);
        return [];
    }
};

const writeFile = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error escribiendo en ${file}:`, error);
    }
};

export { readFile, writeFile };
