import fs from "fs";
import fg from "fast-glob";

const MAX_SIZE = 500 * 1024; // 🔥 300KB per fișier (poți micșora la 200KB dacă vrei)

let part = 1;
let currentSize = 0;
let output = fs.createWriteStream(`project_dump_part${part}.txt`);

const files = await fg(["**/*"], {
  ignore: [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    ".next/**",
    "coverage/**"
  ],
  onlyFiles: true
});

function write(content) {
  const size = Buffer.byteLength(content, "utf8");

  if (currentSize + size > MAX_SIZE) {
    output.end();
    part++;
    output = fs.createWriteStream(`project_dump_part${part}.txt`);
    currentSize = 0;
  }

  output.write(content);
  currentSize += size;
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  const header = `\n===== LOCATION: ${file} =====\n\n`;

  write(header);
  write(content + "\n");
}

output.end();

console.log(`Gata ✅ Export împărțit în ${part} fișiere.`);