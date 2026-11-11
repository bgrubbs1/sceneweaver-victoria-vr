import{cp,mkdir,writeFile}from'node:fs/promises';
await mkdir('docs',{recursive:true});await cp('dist','docs',{recursive:true});await writeFile('docs/.nojekyll','');
console.log('Copied current dist/ application into docs/ for GitHub Pages.');
