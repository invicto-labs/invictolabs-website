import sharp from 'sharp'
import { mkdir,writeFile } from 'node:fs/promises'

const screenshots=['01-operations-overview','04-team-overview','08-order-workspace','02-employee-productivity','07-quality-management']
const results=[]
await mkdir('public/images/traceq/responsive',{recursive:true})
for(const name of screenshots)for(const width of [640,960,1440,1920]){
  const source=`public/images/traceq/${name}.png`,destination=`public/images/traceq/responsive/${name}-${width}.webp`
  const info=await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:86,effort:6}).toFile(destination)
  results.push({source,destination,width:info.width,height:info.height,bytes:info.size})
}
for(const [name,source]of [['tushar','public/tushar-portrait.png'],['jay','public/jay-prasad.webp'],['sneha','public/sneha-gowda.webp']])for(const width of [360,640,900]){
  const destination=`public/${name}-portrait-${width}.webp`
  const info=await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(destination)
  results.push({source,destination,width:info.width,height:info.height,bytes:info.size})
}
await writeFile('qa/after-phase2/setup/responsive-images.json',JSON.stringify(results,null,2)+'\n')
console.log(JSON.stringify({variants:results.length,bytes:results.reduce((n,r)=>n+r.bytes,0)}))
