self.onmessage = async ({data}) => {
  try {
    const {instance}=await WebAssembly.instantiate(data.bytes,{});
    if(typeof instance.exports.score!=='function')throw Error('Нужен экспорт score(f64) → f64');
    const result=data.ranking.map(a=>({...a,score:instance.exports.score(a.score)}));
    if(result.some(a=>!Number.isFinite(a.score)))throw Error('Некорректный результат');
    self.postMessage({result:result.sort((a,b)=>b.score-a.score)});
  }catch(e){self.postMessage({error:e.message})}
};
