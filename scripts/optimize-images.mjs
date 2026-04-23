import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve("public");
const outputDir = path.join(publicDir, "optimized");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const maxWidth = 1600;
const webpQuality = 82;

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const walkImages = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const images = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (fullPath.startsWith(outputDir)) {
            continue;
        }

        if (entry.isDirectory()) {
            images.push(...await walkImages(fullPath));
            continue;
        }

        if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
            images.push(fullPath);
        }
    }

    return images;
};

const optimizeImage = async (inputPath) => {
    const relativePath = path.relative(publicDir, inputPath);
    const parsedPath = path.parse(relativePath);
    const outputPath = path.join(outputDir, parsedPath.dir, `${parsedPath.name}.webp`);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const inputStats = await fs.stat(inputPath);
    const metadata = await sharp(inputPath).metadata();
    const resizeOptions = metadata.width && metadata.width > maxWidth
        ? { width: maxWidth, withoutEnlargement: true }
        : { withoutEnlargement: true };

    await sharp(inputPath)
        .rotate()
        .resize(resizeOptions)
        .webp({
            quality: webpQuality,
            effort: 6,
        })
        .toFile(outputPath);

    const outputStats = await fs.stat(outputPath);

    return {
        input: relativePath,
        output: path.relative(publicDir, outputPath),
        before: inputStats.size,
        after: outputStats.size,
        saved: inputStats.size - outputStats.size,
    };
};

const main = async () => {
    const images = await walkImages(publicDir);
    const results = [];

    for (const imagePath of images) {
        results.push(await optimizeImage(imagePath));
    }

    const totalBefore = results.reduce((sum, result) => sum + result.before, 0);
    const totalAfter = results.reduce((sum, result) => sum + result.after, 0);

    console.table(results.map((result) => ({
        input: result.input,
        output: result.output,
        before: formatBytes(result.before),
        after: formatBytes(result.after),
        saved: formatBytes(result.saved),
    })));

    console.log(`Optimized ${results.length} images`);
    console.log(`Before: ${formatBytes(totalBefore)}`);
    console.log(`After: ${formatBytes(totalAfter)}`);
    console.log(`Saved: ${formatBytes(totalBefore - totalAfter)}`);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
