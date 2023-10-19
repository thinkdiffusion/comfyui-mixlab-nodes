import { app } from '../../../scripts/app.js'
import { api } from '../../../scripts/api.js'
import { ComfyWidgets } from "../../../scripts/widgets.js";


// 和python实现一样
function run(mutable_prompt, immutable_prompt) {
  // Split the text into an array of words
  const words1 = mutable_prompt.split("\n");
  
  // Split the text into an array of words
  const words2 = immutable_prompt.split("\n");
  
  const prompts = [];
  for (let i = 0; i < words1.length; i++) {
      words1[i]=words1[i].trim()
      for (let j = 0; j < words2.length; j++) {
          words2[j]=words2[j].trim()
          if(words2[j]&& words1[i]){
            prompts.push(words2[j].replaceAll('``', words1[i]));
          }
      }
  }
  
  return prompts;
}

// 更新ui，计算prompt的组合结果
const updateUI=(node)=>{
  const mutable_prompt_w = node.widgets.filter((w) => w.name === "mutable_prompt")[0];
        mutable_prompt_w.inputEl.title='Enter keywords, one per line'
        const immutable_prompt_w = node.widgets.filter((w) => w.name === "immutable_prompt")[0];
        immutable_prompt_w.inputEl.title='Enter prompts, one per line, variables represented by ``'

        const max_count = node.widgets.filter((w) => w.name === "max_count")[0];
        let prompts=run(mutable_prompt_w.value,immutable_prompt_w.value);

        prompts=prompts.slice(0,max_count.value);
        
        max_count.value=prompts.length;

        // 如果已经存在,删除
        const pw = node.widgets.filter((w) => w.name === "prompts")[0];
				if (pw) {
					// node.widgets[pos].onRemove?.();
          pw.value = prompts.join('\n\n');
          pw.inputEl.title=`Total of ${prompts.length} prompts`;
				}else{

          // 动态添加
          const w = ComfyWidgets.STRING(node, "prompts", ["STRING", { multiline: true }], app).widget;
              w.inputEl.readOnly = true;
              w.inputEl.style.opacity = 0.6;
              w.value = prompts.join('\n\n');
              w.inputEl.title=`Total of ${prompts.length} prompts`;
        }

         // 移除无关的widget
        //  for (let i = 0; i < node.widgets.length; i++) {
        //   console.log(node.widgets[i]?.name)
        //   if(node.widgets[i]&&!['mutable_prompt','immutable_prompt','max_count','prompts'].includes(node.widgets[i].name)) node.widgets[i].onRemove?.();
        // }

        // console.log(node.widgets.length,node.size);

        node.widgets.length = 4;
        node.onResize?.(node.size);
}


const node = {
    name: 'RandomPrompt',
    async setup(a){
      for (const node of app.graph._nodes) {
        if(node.comfyClass==='RandomPrompt'){
          console.log('#setup',node )
          updateUI(node)
        }
      }
    },
    async nodeCreated(node){
      
      if(node.comfyClass==='RandomPrompt'){
        updateUI(node)
      }
    },
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        
      // 注册节点前，可以修改节点的数据
      // 可以获取得到其他节点数据

      // 汉化
       // app.graph._nodes // title ='123' 

        if(nodeData.name === "SaveTransparentImage"){
          const onExecuted = nodeType.prototype.onExecuted;
          nodeType.prototype.onExecuted = function (message) {
            const r = onExecuted?.apply?.(this, arguments);

            console.log('executed',message)
            const {image_path}=message;
            if(image_path){
              
            }



            return r
          }
        }
        
        if (nodeData.name === "RandomPrompt") {
          
          const onExecuted = nodeType.prototype.onExecuted;
          nodeType.prototype.onExecuted = function (message) {
            const r = onExecuted?.apply?.(this, arguments);

            let prompts=message.prompts;
            console.log('executed',message)
            // console.log('#RandomPrompt', this.widgets)
            const pw = this.widgets.filter((w) => w.name === "prompts")[0];
        
            if (pw) {
              // node.widgets[pos].onRemove?.();
              pw.value = prompts.join('\n\n');
              pw.inputEl.title=`Total of ${prompts.length} prompts`;
            }else{

              // 动态添加
              const w = ComfyWidgets.STRING(node, "prompts", ["STRING", { multiline: true }], app).widget;
                  w.inputEl.readOnly = true;
                  w.inputEl.style.opacity = 0.6;
                  w.value = prompts.join('\n\n');
                  w.inputEl.title=`Total of ${prompts.length} prompts`;
            }

            this.widgets.length = 4;

            this.onResize?.(this.size);

            return r;
          };
        } 


        }
}

app.registerExtension(node)