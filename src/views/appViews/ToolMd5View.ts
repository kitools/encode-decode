// @unocss-include

import { 
  h as vnd, 
  defineComponent, 
  ref,
  reactive
} from 'vue';

import Panel from 'primevue/panel';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
import { useToast } from 'primevue/usetoast';
import { md5 } from 'js-md5';

const ToolMd5View = defineComponent({
  name: "ToolMd5View",
  setup() {
    // Initialize toast service
    const toast = useToast();
    
    // State management
    const inputText = ref('');
    const outputHash = ref('');
    const isProcessing = ref(false);
    const hashOptions = reactive({
      type: '32', // 默认32位
      case: 'lower' // 默认小写
    });
    
    // Generate MD5 hash from input text
    const generateMd5 = () => {
      if (!inputText.value.trim()) {
        toast.add({
          severity: 'warn',
          summary: '警告',
          detail: '请输入需要转换的文本',
          life: 3000
        });
        return;
      }
      
      try {
        isProcessing.value = true;
        let result = md5(inputText.value);
        
        // 如果需要16位MD5，取32位MD5的中间16位
        if (hashOptions.type === '16') {
          result = result.substring(8, 24);
        }
        
        // 根据大小写选项处理结果
        result = hashOptions.case === 'upper' ? result.toUpperCase() : result.toLowerCase();
        
        outputHash.value = result;
        isProcessing.value = false;
      } catch (error) {
        console.error('MD5 generation error:', error);
        toast.add({
          severity: 'error',
          summary: '错误',
          detail: '生成MD5哈希时出错',
          life: 3000
        });
        isProcessing.value = false;
      }
    };
    
    // Copy output hash to clipboard
    const copyToClipboard = async () => {
      if (!outputHash.value) {
        toast.add({
          severity: 'warn',
          summary: '警告',
          detail: '没有内容可复制',
          life: 3000
        });
        return;
      }
      
      try {
        await navigator.clipboard.writeText(outputHash.value);
        toast.add({
          severity: 'success',
          summary: '成功',
          detail: 'MD5哈希已复制到剪贴板',
          life: 2000
        });
      } catch (error) {
        console.error('Clipboard write error:', error);
        toast.add({
          severity: 'error',
          summary: '错误',
          detail: '复制到剪贴板失败',
          life: 3000
        });
      }
    };
    
    return () => {
      return vnd("div", { class: "p-2" }, [
        vnd(Panel, { header: "MD5 转换工具", class: "mb-3" }, {
          default: () => vnd("div", { class: "flex flex-col gap-4" }, [
            // Input section
            vnd("div", { class: "flex flex-col gap-2" }, [
              vnd("label", { for: "input-text", class: "font-medium" }, "输入文本"),
              vnd(Textarea, {
                id: "input-text",
                class: "w-full",
                rows: 5,
                placeholder: "请输入需要转换为MD5的文本",
                modelValue: inputText.value,
                "onUpdate:modelValue": (value: string) => { inputText.value = value },
                disabled: isProcessing.value
              })
            ]),
            
            // Hash options
            vnd("div", { class: "flex flex-col gap-3" }, [
              // Hash length options
              vnd("div", { class: "flex items-center gap-4" }, [
                vnd("div", { class: "text-sm font-medium" }, "哈希长度:"),
                vnd("div", { class: "flex items-center gap-2" }, [
                  vnd(RadioButton, {
                    inputId: "hash32",
                    name: "hashType",
                    value: "32",
                    modelValue: hashOptions.type,
                    "onUpdate:modelValue": (value: string) => { hashOptions.type = value }
                  }),
                  vnd("label", { for: "hash32", class: "text-sm" }, "32位 (完整)")
                ]),
                vnd("div", { class: "flex items-center gap-2" }, [
                  vnd(RadioButton, {
                    inputId: "hash16",
                    name: "hashType",
                    value: "16",
                    modelValue: hashOptions.type,
                    "onUpdate:modelValue": (value: string) => { hashOptions.type = value }
                  }),
                  vnd("label", { for: "hash16", class: "text-sm" }, "16位 (简短)")
                ])
              ]),
              
              // Case options
              vnd("div", { class: "flex items-center gap-4" }, [
                vnd("div", { class: "text-sm font-medium" }, "字母大小写:"),
                vnd("div", { class: "flex items-center gap-2" }, [
                  vnd(RadioButton, {
                    inputId: "caseLower",
                    name: "hashCase",
                    value: "lower",
                    modelValue: hashOptions.case,
                    "onUpdate:modelValue": (value: string) => { hashOptions.case = value }
                  }),
                  vnd("label", { for: "caseLower", class: "text-sm" }, "小写字母")
                ]),
                vnd("div", { class: "flex items-center gap-2" }, [
                  vnd(RadioButton, {
                    inputId: "caseUpper",
                    name: "hashCase",
                    value: "upper",
                    modelValue: hashOptions.case,
                    "onUpdate:modelValue": (value: string) => { hashOptions.case = value }
                  }),
                  vnd("label", { for: "caseUpper", class: "text-sm" }, "大写字母")
                ])
              ])
            ]),
            
            // Convert button
            vnd("div", { class: "flex justify-center" }, [
              vnd(Button, {
                label: "转换为MD5",
                icon: "pi pi-refresh",
                onClick: generateMd5,
                disabled: isProcessing.value,
                loading: isProcessing.value
              })
            ]),
            
            // Output section
            vnd("div", { class: "flex flex-col gap-2" }, [
              vnd("div", { class: "flex justify-between items-center" }, [
                vnd("label", { for: "output-hash", class: "font-medium" }, "MD5哈希结果"),
                vnd(Button, {
                  icon: "pi pi-copy",
                  text: true,
                  rounded: true,
                  onClick: copyToClipboard,
                  disabled: !outputHash.value,
                  tooltip: "复制到剪贴板",
                  tooltipOptions: { position: "top" }
                })
              ]),
              vnd(Textarea, {
                id: "output-hash",
                class: "w-full",
                rows: 2,
                readonly: true,
                modelValue: outputHash.value,
                "onUpdate:modelValue": (value: string) => { outputHash.value = value }
              })
            ])
          ])
        })
      ]);
    };
  }
});

export default ToolMd5View;