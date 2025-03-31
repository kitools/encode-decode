// @unocss-include

import _ from "lodash";
import localforage from "localforage";

import {
  h as vnd, defineComponent,
  reactive,
  // computed,
  onMounted,
} from 'vue';

import Panel from 'primevue/panel';
import Textarea from 'primevue/textarea';
// import ToolButton from '@components/shared/ToolButton';

// import { useToast } from 'primevue/usetoast';

//** ---------- ---------- ---------- ---------- ---------- **//

export const MyWordTagSpan = defineComponent({
  name: "MyWordTagSpan",
  props: ["word", "tag", "translate"],
  setup(props) {
    // const finalTag = computed(()=>props.tag);

    return ()=>{
      const make = ()=> vnd("span", {
        onClick: ()=>{ console.log({
          props,
        }); },
        class: [
          "inline-block border rounded px-0.2rem py-0.05rem m-0.1rem",
        ],
        title: `${props.word??""}\n${props.tag??""}`,
        "data-tag": props.tag,
        "data-translate": props.translate,
      }, [
        !props?.translate?.length ? props.word : vnd("ruby", {}, [props.word, vnd("rt", {class: "--fw-bold --text-shadow-md"}, props.translate)]),
        // props?.tag==null?null:[" ", vnd("span", {class: ["opacity-50"]}, finalTag.value)],
      ]);

      // return !props?.translate?.length ? make() : vnd("ruby", {}, [make(), vnd("rt", {class: "fw-bold text-shadow-md"}, props.translate)]);

      return make();
    };
  },
});

//** ---------- ---------- ---------- ---------- ---------- **//

const AppToolView = defineComponent({
  name: "AppToolView",
  setup() {

    // const toast = useToast();

    // /** data **/ //
    const demoData = reactive({

      input: "",

      processing: false,
      output: [] as any[],

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokenizerJSON: null as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokenizerConfig: null as any,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokenizer: null as any,

    });

    onMounted(async () => {
      await loadStoredDemoData();
    });

    // /** methods **/ //
    const loadStoredDemoData = async () => {
      const storedDemoData = await localforage.getItem("DeepSeekTokenCounter_DemoData");
      if (storedDemoData) {
        try {
          Object.assign(demoData, storedDemoData);
          demoData.processing = false;
        }
        catch (err) {
          console.error(err);
        }
      }
    };
    // const saveDemoData = async () => {
    //   await localforage.setItem("DeepSeekTokenCounter_DemoData", 
    //     JSON.parse(JSON.stringify(
    //       _.pick(demoData, ["input", "output", "tokenizerJSON", "tokenizerConfig"])
    //     ))
    //   );
    // };

    //** ---------- ---------- ---------- ---------- ---------- **//

    return ()=>{
      return vnd("div", {
      }, [

        vnd(Panel, { header: "输入分析", toggleable: true, class: "my-1.5rem! col" }, {
          default: () => vnd("div", {class: "stack-v"}, [
            vnd(Textarea, { class: "w-full", placeholder: "输入",
              modelValue: demoData.input,
              "onUpdate:modelValue": (value: string) => {
                demoData.input = value;
              },
              disabled: demoData.processing,
            }),


            vnd("div", {class: "stack-h opacity-60"}, [`共 ${demoData?.output?.length??0} 个 token`]),

            vnd("div", { class: "w-full max-h-50vh p-panel p-1rem overflow-auto" }, [
              demoData.output.map((item, index) => vnd(MyWordTagSpan, {
                word: item[1], tag: `${item[0]}`,
                key: `item-${index}-${item[1]}-${item[0]}`,
              })),
            ]),

          ]),
        }),
      ]);
    };
  }
})

export default AppToolView;
