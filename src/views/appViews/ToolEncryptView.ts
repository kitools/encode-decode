// @unocss-include

import { 
  h as vnd, 
  defineComponent, 
  ref,
  // reactive,
} from 'vue';

import Panel from 'primevue/panel';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';

import {
  encryptWithPassword,
  decryptWithPassword,
} from '@utils/crypto-utils';

const ToolEncryptView = defineComponent({
  name: "ToolEncryptView",
  setup() {
    // Initialize toast service
    const toast = useToast();
    
    // State management
    const inputText = ref('');
    const password = ref('');
    const outputText = ref('');
    const isProcessing = ref(false);
    const operationType = ref('encrypt'); // 'encrypt' or 'decrypt'
    
    // Process the text (encrypt or decrypt)
    const processText = async () => {
      if (!inputText.value.trim()) {
        toast.add({
          severity: 'warn',
          summary: '警告',
          detail: '请输入需要处理的文本',
          life: 3000
        });
        return;
      }

      if (!password.value.trim()) {
        toast.add({
          severity: 'warn',
          summary: '警告',
          detail: '请输入密码',
          life: 3000
        });
        return;
      }
      
      try {
        isProcessing.value = true;
        let result;
        
        if (operationType.value === 'encrypt') {
          result = await encryptWithPassword(inputText.value, password.value);
        } else {
          result = await decryptWithPassword(inputText.value, password.value);
        }
        
        outputText.value = result;
        isProcessing.value = false;
      } catch (error) {
        console.error(`${operationType.value === 'encrypt' ? '加密' : '解密'}错误:`, error);
        toast.add({
          severity: 'error',
          summary: '错误',
          detail: `${operationType.value === 'encrypt' ? '加密' : '解密'}处理失败，${operationType.value === 'decrypt' ? '请检查密码或输入文本格式是否正确' : ''}`,
          life: 3000
        });
        isProcessing.value = false;
      }
    };
    
    // Copy output text to clipboard
    const copyToClipboard = async () => {
      if (!outputText.value) {
        toast.add({
          severity: 'warn',
          summary: '警告',
          detail: '没有内容可复制',
          life: 3000
        });
        return;
      }
      
      try {
        await navigator.clipboard.writeText(outputText.value);
        toast.add({
          severity: 'success',
          summary: '成功',
          detail: '已复制到剪贴板',
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
    
    // Clear fields
    const clearFields = () => {
      inputText.value = '';
      outputText.value = '';
      // 保留密码，便于连续操作
    };
    
    return () => {
      return vnd("div", { class: "p-2" }, [
        vnd(Panel, { header: "文本加密/解密工具", class: "mb-3" }, {
          default: () => vnd("div", { class: "flex flex-col gap-4" }, [
            // Operation type selection
            vnd("div", { class: "flex items-center gap-4" }, [
              vnd("div", { class: "text-sm font-medium" }, "操作类型:"),
              vnd("div", { class: "flex items-center gap-2" }, [
                vnd(RadioButton, {
                  inputId: "typeEncrypt",
                  name: "operationType",
                  value: "encrypt",
                  modelValue: operationType.value,
                  "onUpdate:modelValue": (value: string) => { operationType.value = value }
                }),
                vnd("label", { for: "typeEncrypt", class: "text-sm" }, "加密")
              ]),
              vnd("div", { class: "flex items-center gap-2" }, [
                vnd(RadioButton, {
                  inputId: "typeDecrypt",
                  name: "operationType",
                  value: "decrypt",
                  modelValue: operationType.value,
                  "onUpdate:modelValue": (value: string) => { operationType.value = value }
                }),
                vnd("label", { for: "typeDecrypt", class: "text-sm" }, "解密")
              ])
            ]),
            
            // Input section
            vnd("div", { class: "flex flex-col gap-2" }, [
              vnd("label", { for: "input-text", class: "font-medium" }, 
                operationType.value === 'encrypt' ? "待加密文本" : "待解密文本"),
              vnd(Textarea, {
                id: "input-text",
                class: "w-full",
                rows: 5,
                placeholder: operationType.value === 'encrypt' ? "请输入需要加密的文本" : "请输入需要解密的文本",
                modelValue: inputText.value,
                "onUpdate:modelValue": (value: string) => { inputText.value = value },
                disabled: isProcessing.value
              })
            ]),
            
            // Password input
            vnd("div", { class: "flex flex-col gap-2" }, [
              vnd("label", { for: "password", class: "font-medium" }, "密码"),
              vnd(InputText, {
                id: "password",
                class: "w-full",
                type: "password",
                placeholder: "请输入密码",
                modelValue: password.value,
                "onUpdate:modelValue": (value: string) => { password.value = value },
                disabled: isProcessing.value
              })
            ]),
            
            // Action buttons
            vnd("div", { class: "flex justify-center gap-3" }, [
              vnd(Button, {
                label: operationType.value === 'encrypt' ? "加密" : "解密",
                icon: operationType.value === 'encrypt' ? "pi pi-lock" : "pi pi-unlock",
                onClick: processText,
                disabled: isProcessing.value,
                loading: isProcessing.value
              }),
              vnd(Button, {
                label: "清除",
                icon: "pi pi-trash",
                onClick: clearFields,
                disabled: isProcessing.value,
                severity: "secondary"
              })
            ]),
            
            // Output section
            vnd("div", { class: "flex flex-col gap-2" }, [
              vnd("div", { class: "flex justify-between items-center" }, [
                vnd("label", { for: "output-text", class: "font-medium" }, 
                  operationType.value === 'encrypt' ? "加密结果" : "解密结果"),
                vnd(Button, {
                  icon: "pi pi-copy",
                  text: true,
                  rounded: true,
                  onClick: copyToClipboard,
                  disabled: !outputText.value,
                  tooltip: "复制到剪贴板",
                  tooltipOptions: { position: "top" }
                })
              ]),
              vnd(Textarea, {
                id: "output-text",
                class: "w-full",
                rows: 5,
                readonly: true,
                modelValue: outputText.value,
                "onUpdate:modelValue": (value: string) => { outputText.value = value }
              })
            ])
          ])
        })
      ]);
    };
  }
});

export default ToolEncryptView;