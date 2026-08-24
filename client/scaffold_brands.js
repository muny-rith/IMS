const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'features', 'categories');
const destDir = path.join(__dirname, 'src', 'features', 'brands');

function copyAndReplace(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyAndReplace(path.join(src, file), path.join(dest, file.replace(/category/gi, match => {
        if (match === 'category') return 'brand';
        if (match === 'Category') return 'Brand';
        if (match === 'CATEGORy') return 'BRAND';
        if (match === 'categories') return 'brands';
        if (match === 'Categories') return 'Brands';
        return 'Brand';
      })));
    }
  } else {
    let content = fs.readFileSync(src, 'utf-8');
    content = content.replace(/category/g, 'brand')
                     .replace(/Category/g, 'Brand')
                     .replace(/categories/g, 'brands')
                     .replace(/Categories/g, 'Brands')
                     .replace(/tb_brand/g, 'tb_brand') // just in case
                     .replace(/brand_name/g, 'brand_name'); // just in case
    
    // Some specific field names from categoryService.js might need mapping:
    // row.category_id -> row.brand_id
    // row.category_name -> row.brand_name
    content = content.replace(/category_id/g, 'brand_id')
                     .replace(/category_name/g, 'brand_name');

    fs.writeFileSync(dest, content, 'utf-8');
  }
}

copyAndReplace(srcDir, destDir);
console.log('Brands feature created successfully from Categories.');
