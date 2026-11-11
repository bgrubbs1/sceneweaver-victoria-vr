import{cp,mkdir}from'node:fs/promises';
await mkdir('docs',{recursive:true});await cp('dist','docs',{recursive:true});
console.log('Copied current dist/ application into docs/ for GitHub Pages.');
